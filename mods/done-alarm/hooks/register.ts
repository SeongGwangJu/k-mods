import type { EngineInterface, On, Register } from 'claude-code'

import {
  buildAppleScript,
  buildFinishedMessage,
  buildNeedsYouMessage,
  buildStatusText,
  buildTestReportText,
  enabledChannelIds,
  firstLineSummary,
  normalizeOptions,
  parseAlarmArgs,
  projectNameOf,
  rfc2047,
  shouldNotifyFinished,
  shouldNotifyNeedsYou,
  truncate,
  webhookBody,
  type ChannelId,
  type ChannelResult,
  type NormalizedOptions,
} from './format.js'

// 한 번 울리면 이 안에서는 "확인이 필요해요" 알림을 다시 보내지 않는다.
const NEEDS_YOU_DEBOUNCE_MS = 60_000

const PHRASE_FINISHED = '작업이 끝났어요'
const PHRASE_NEEDS_YOU = '확인이 필요해요'
const TEST_MESSAGE = '🔔 done-alarm 테스트 알림이에요'
const TITLE = 'Claude Code'

type Platform = 'mac' | 'linux' | 'other'

// session.start에서 한 번 정해 두는 값들. 모듈이 다시 로드되기 전까지는 그대로다.
let platform: Platform = 'other'
let muted = false
let lastNeedsYouAt = -Infinity
// 채널별로 가장 최근에 보내 본 결과. /alarm 상태에서 "최근 실패"를 보여주는 데 쓴다.
const lastResult: Partial<Record<ChannelId, ChannelResult>> = {}

type NotifyContext = {
  platform: Platform
  desktopMessage: string
  remoteMessage: string
  voicePhrase: string
  tags: string
  project: string
}

// ---------------------------------------------------------------------------
// $를 받는 도우미는 전부 이 파일 최상위에 둔다 (정적 분석 규칙).
// ---------------------------------------------------------------------------

/** uname으로 한 번만 플랫폼을 확인한다. 실패하면 "기타"로 두고 데스크톱 알림은 건너뛴다. */
async function detectPlatform($: EngineInterface): Promise<Platform> {
  try {
    const result = await $.process.run(['uname'])
    const name = result.stdout.trim()
    if (name === 'Darwin') return 'mac'
    if (name === 'Linux') return 'linux'
    return 'other'
  } catch {
    return 'other'
  }
}

/** macOS는 osascript, Linux는 notify-send. 프로그램이 없으면 실패를 기록하고 넘어간다. */
async function sendDesktop(
  $: EngineInterface,
  platform: Platform,
  message: string,
  project: string,
): Promise<ChannelResult> {
  try {
    if (platform === 'mac') {
      const script = buildAppleScript(message, project)
      const result = await $.process.run(['osascript', '-e', script])
      if (result.exitCode !== 0) return { ok: false, error: result.stderr.trim() || 'osascript 실행이 실패했어요' }
      return { ok: true }
    }
    if (platform === 'linux') {
      const result = await $.process.run(['notify-send', TITLE, message])
      if (result.exitCode !== 0) return { ok: false, error: result.stderr.trim() || 'notify-send 실행이 실패했어요' }
      return { ok: true }
    }
    return { ok: false, error: '데스크톱 알림을 지원하지 않는 OS예요' }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/** Yuna(한국어 음성)로 먼저 시도하고, 설치돼 있지 않으면 기본 음성으로 한 번 더 시도한다. */
async function sendVoice($: EngineInterface, phrase: string): Promise<ChannelResult> {
  try {
    await $.audio.speak(phrase, { voice: 'Yuna' })
    return { ok: true }
  } catch {
    try {
      await $.audio.speak(phrase)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}

/** ntfy: 본문은 평문, 제목은 (필요하면) RFC 2047로 감싸 헤더가 한글 때문에 깨지지 않게 한다. */
async function sendNtfy(
  $: EngineInterface,
  server: string,
  topic: string,
  message: string,
  tags: string,
): Promise<ChannelResult> {
  try {
    const url = `${server.replace(/\/+$/, '')}/${encodeURIComponent(topic)}`
    const response = await $.http.fetch(url, {
      method: 'POST',
      body: message,
      headers: { Title: rfc2047(TITLE), Tags: tags },
    })
    if (!response.ok) return { ok: false, error: `ntfy가 ${response.status}을 돌려줬어요` }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function sendTelegram($: EngineInterface, token: string, chatId: string, text: string): Promise<ChannelResult> {
  try {
    const response = await $.http.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    if (!response.ok) return { ok: false, error: `Telegram이 ${response.status}을 돌려줬어요` }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function sendWebhook($: EngineInterface, url: string, text: string): Promise<ChannelResult> {
  try {
    const response = await $.http.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookBody(url, text)),
    })
    if (!response.ok) return { ok: false, error: `Webhook이 ${response.status}을 돌려줬어요` }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/** 채널 하나를 보내고 결과를 lastResult에 남긴다. 실제 트리거와 /alarm test가 함께 쓴다. */
async function runChannel(
  $: EngineInterface,
  id: ChannelId,
  cfg: NormalizedOptions,
  ctx: NotifyContext,
): Promise<ChannelResult> {
  const result = await (id === 'desktop'
    ? sendDesktop($, ctx.platform, ctx.desktopMessage, ctx.project)
    : id === 'voice'
      ? sendVoice($, ctx.voicePhrase)
      : id === 'ntfy'
        ? sendNtfy($, cfg.ntfyServer, cfg.ntfyTopic, ctx.remoteMessage, ctx.tags)
        : id === 'telegram'
          ? sendTelegram($, cfg.telegramBotToken, cfg.telegramChatId, ctx.remoteMessage)
          : sendWebhook($, cfg.webhookUrl, ctx.remoteMessage))
  lastResult[id] = result
  return result
}

/** 켜진 채널 전부에 동시에 보낸다. 하나가 실패해도 나머지는 그대로 진행한다(allSettled). */
async function notifyAll($: EngineInterface, cfg: NormalizedOptions, ctx: NotifyContext): Promise<void> {
  const ids = enabledChannelIds(cfg)
  await Promise.allSettled(ids.map((id) => runChannel($, id, cfg, ctx)))
}

async function notifyFinished(
  $: EngineInterface,
  cfg: NormalizedOptions,
  durationMs: number,
  answer: string,
): Promise<void> {
  const project = projectNameOf(await $.session.cwd())
  const summary = firstLineSummary(answer, 80)
  await notifyAll($, cfg, {
    platform,
    desktopMessage: buildFinishedMessage({ durationMs, project, summary: summary || undefined }),
    remoteMessage: buildFinishedMessage({ durationMs, project, summary: cfg.includeSummary && summary ? summary : undefined }),
    voicePhrase: PHRASE_FINISHED,
    tags: 'white_check_mark',
    project,
  })
}

async function notifyNeedsYou($: EngineInterface, cfg: NormalizedOptions, reason: string): Promise<void> {
  const project = projectNameOf(await $.session.cwd())
  const message = buildNeedsYouMessage({ project, reason: truncate(reason, 60) })
  await notifyAll($, cfg, {
    platform,
    desktopMessage: message,
    remoteMessage: message,
    voicePhrase: PHRASE_NEEDS_YOU,
    tags: 'raising_hand',
    project,
  })
}

async function runTest($: EngineInterface, cfg: NormalizedOptions): Promise<string> {
  const project = projectNameOf(await $.session.cwd())
  const ids = enabledChannelIds(cfg)
  const ctx: NotifyContext = {
    platform,
    desktopMessage: TEST_MESSAGE,
    remoteMessage: TEST_MESSAGE,
    voicePhrase: TEST_MESSAGE,
    tags: 'test_tube',
    project,
  }
  const results: Partial<Record<ChannelId, ChannelResult>> = {}
  await Promise.all(
    ids.map(async (id) => {
      results[id] = await runChannel($, id, cfg, ctx)
    }),
  )
  return buildTestReportText(ids, results)
}

// ---------------------------------------------------------------------------

export const register: Register = (on: On, options) => {
  const cfg = normalizeOptions(options)

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'alarm',
      description: '작업 끝 알림 상태 확인 · 테스트 · 끄기/켜기',
      argumentHint: '[test|on|off]',
      immediate: true,
    })
    platform = await detectPlatform($)
    return next(e)
  })

  // 트리거 1: 메인 대화의 턴이 끝났을 때. 세션 흐름을 늦추지 않도록 알림은 기다리지 않고 던진다.
  on('turn.complete', async ($, e, next) => {
    if (!muted && shouldNotifyFinished(e, cfg.minSeconds)) {
      notifyFinished($, cfg, e.durationMs, e.answer).catch(() => {})
    }
    return next(e)
  })

  // 트리거 2-가: 설정 훅 Notification의 미러. 권한이 필요하거나 가만히 있은 지 오래됐을 때 온다.
  // validate가 이것도 "막을 수 있는 훅"으로 보길래, AskUserQuestion과 같은 이유로 .catch를 단다.
  on('classic.Notification', async ($, e, next) => {
    if (!muted) {
      const now = await $.clock.now()
      if (shouldNotifyNeedsYou(lastNeedsYouAt, now, NEEDS_YOU_DEBOUNCE_MS)) {
        lastNeedsYouAt = now
        notifyNeedsYou($, cfg, e.message).catch(() => {})
      }
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // 트리거 2-나: AskUserQuestion이 걸려 있는 것도 "확인이 필요해요"다. 막을 수 있는 훅이라
  // .catch로 늘 통과시킨다. 이 mod는 지켜보기만 하고, 질문을 절대 막지 않는다.
  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    if (!muted && e.tool === 'AskUserQuestion') {
      const now = await $.clock.now()
      if (shouldNotifyNeedsYou(lastNeedsYouAt, now, NEEDS_YOU_DEBOUNCE_MS)) {
        lastNeedsYouAt = now
        const reason = e.questions[0]?.question ?? '질문이 있어요'
        notifyNeedsYou($, cfg, reason).catch(() => {})
      }
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'alarm' }, async ($, e) => {
    const action = parseAlarmArgs(e.args)
    if (action === 'on') {
      muted = false
      $.ui.invalidate('ui.render')
      return { text: '🔔 알림을 켰어요.' }
    }
    if (action === 'off') {
      muted = true
      $.ui.invalidate('ui.render')
      return { text: '🔕 알림을 껐어요. 이 세션에서만 적용돼요.' }
    }
    if (action === 'test') {
      return { text: await runTest($, cfg) }
    }
    return { text: buildStatusText(cfg, muted, lastResult) }
  })

  // 음소거일 때만 입력창 위 힌트 줄 끝에 짧게 표시한다. 그 외엔 아무 것도 그리지 않는다.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    if (!muted) return next(e)
    const tail = [e.props.tail, '알림 꺼짐'].filter(Boolean).join(' · ')
    return next({ ...e, props: { ...e.props, tail } })
  })
}
