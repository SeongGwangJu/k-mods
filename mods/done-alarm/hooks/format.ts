// $를 받지 않는 순수 함수만 모아 둔 파일. register.ts가 가져다 쓴다.
// (CONTRIBUTING.md: "hooks/*.ts: $를 받지 않는 순수 함수. 테스트하기 쉽게 분리")

/** 사용자가 켤 수 있는 알림 채널의 이름. */
export type ChannelId = 'desktop' | 'voice' | 'ntfy' | 'telegram' | 'webhook'

/** 채널 하나를 실제로 보내 본 결과. */
export type ChannelResult = { ok: true } | { ok: false; error: string }

/** plugin.json의 userConfig를 타입이 분명한 값으로 정리한 것. */
export type NormalizedOptions = {
  minSeconds: number
  desktop: boolean
  voice: boolean
  ntfyTopic: string
  ntfyServer: string
  telegramBotToken: string
  telegramChatId: string
  webhookUrl: string
  includeSummary: boolean
}

export const CHANNEL_IDS: readonly ChannelId[] = ['desktop', 'voice', 'ntfy', 'telegram', 'webhook']

export const CHANNEL_LABELS: Record<ChannelId, string> = {
  desktop: '데스크톱',
  voice: '음성',
  ntfy: 'ntfy',
  telegram: 'Telegram',
  webhook: 'Webhook',
}

function toBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function toNum(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toStr(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

/** register(on, options)가 받은 원값을 타입이 분명한 설정 객체로 바꾼다. */
export function normalizeOptions(options: Record<string, unknown>): NormalizedOptions {
  return {
    minSeconds: toNum(options.min_seconds, 30),
    desktop: toBool(options.desktop, true),
    voice: toBool(options.voice, false),
    ntfyTopic: toStr(options.ntfy_topic),
    ntfyServer: toStr(options.ntfy_server, 'https://ntfy.sh'),
    telegramBotToken: toStr(options.telegram_bot_token),
    telegramChatId: toStr(options.telegram_chat_id),
    webhookUrl: toStr(options.webhook_url),
    includeSummary: toBool(options.include_summary, false),
  }
}

/** 설정에서 실제로 켜져 있는 채널만 골라, 늘 같은 순서로 돌려준다. */
export function enabledChannelIds(cfg: NormalizedOptions): ChannelId[] {
  const ids: ChannelId[] = []
  if (cfg.desktop) ids.push('desktop')
  if (cfg.voice) ids.push('voice')
  if (cfg.ntfyTopic) ids.push('ntfy')
  if (cfg.telegramBotToken && cfg.telegramChatId) ids.push('telegram')
  if (cfg.webhookUrl) ids.push('webhook')
  return ids
}

/** 끝난 턴을 알릴지: 메인 대화만, 중단되지 않았고, 기준 시간 이상 걸렸을 때. */
export function shouldNotifyFinished(
  e: { agentId?: string; isAborted: boolean; durationMs: number },
  minSeconds: number,
): boolean {
  return !e.agentId && !e.isAborted && e.durationMs >= minSeconds * 1000
}

/** "확인이 필요해요" 알림의 디바운스: 마지막 알림에서 이만큼 지나야 다시 보낸다. */
export function shouldNotifyNeedsYou(lastAt: number, now: number, debounceMs: number): boolean {
  return now - lastAt >= debounceMs
}

/** 1시간 2분, 3분 12초, 45초처럼 한국식으로 길이를 읽는다. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}시간 ${minutes}분`
  if (minutes > 0) return `${minutes}분 ${seconds}초`
  return `${seconds}초`
}

/** 아주 단순한 마크다운 제거: 굵게·기울임·코드·링크·헤딩·목록 기호만 걷어낸다. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/^#{1,6}\s+/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/^>\s?/, '')
    .trim()
}

/** text를 maxLen자 이내로 자르고, 잘렸으면 말줄임표 하나로 끝맺는다(전체 길이는 maxLen 유지). */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  if (maxLen <= 1) return text.slice(0, maxLen)
  return text.slice(0, maxLen - 1).trimEnd() + '…'
}

/** Claude 답변의 첫 줄을, 마크다운을 걷어내고 maxLen자로 잘라 요약으로 쓴다. */
export function firstLineSummary(answer: string, maxLen = 80): string {
  const firstLine = answer.split('\n').find((line) => line.trim().length > 0) ?? ''
  return truncate(stripMarkdown(firstLine.trim()), maxLen)
}

/** $.session.cwd()가 돌려준 절대 경로에서 폴더 이름만 꺼낸다. */
export function projectNameOf(cwd: string): string {
  const normalized = cwd.replace(/[\\/]+$/, '')
  const parts = normalized.split(/[\\/]/)
  return parts[parts.length - 1] || cwd
}

/** "✅ 작업 끝 · 3분 12초 · my-project" (+ 요약이 있으면 다음 줄에). */
export function buildFinishedMessage(params: { durationMs: number; project: string; summary?: string }): string {
  const base = `✅ 작업 끝 · ${formatDuration(params.durationMs)} · ${params.project}`
  return params.summary ? `${base}\n${params.summary}` : base
}

/** "🙋 확인이 필요해요 · my-project · <reason>". */
export function buildNeedsYouMessage(params: { project: string; reason: string }): string {
  return `🙋 확인이 필요해요 · ${params.project} · ${params.reason}`
}

/** AppleScript 문자열 리터럴 안에 넣을 수 있도록 \와 "를 이스케이프한다. */
export function escapeAppleScript(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * osascript -e로 넘길 전체 스크립트를 만든다. AppleScript 문자열 리터럴은 줄바꿈을
 * 그대로 담지 못하므로, 메시지를 줄 단위로 쪼개 `& return &`로 이어 붙인다.
 */
export function buildAppleScript(message: string, project: string): string {
  const body = message
    .split('\n')
    .map((line) => `"${escapeAppleScript(line)}"`)
    .join(' & return & ')
  return `display notification (${body}) with title "Claude Code" subtitle "${escapeAppleScript(project)}" sound name "Glass"`
}

/** 인쇄 가능한 ASCII만 있으면 그대로, 아니면 ntfy가 읽을 수 있는 RFC 2047(UTF-8 Base64)로 감싼다. */
export function rfc2047(text: string): string {
  if (/^[\x20-\x7e]*$/.test(text)) return text
  const bytes = new TextEncoder().encode(text)
  return `=?UTF-8?B?${bytes.toBase64()}?=`
}

/** Slack은 {text}, Discord는 {content}, 그 외는 {text}로 보낸다. */
export function webhookBody(url: string, text: string): Record<string, string> {
  if (/discord(app)?\.com/.test(url)) return { content: text }
  return { text }
}

/** 값이 있으면 ●●●, 없으면 "미설정". 토큰이든 뭐든 실제 값은 절대 보여주지 않는다. */
export function maskSensitive(value: string): string {
  return value ? '●●●' : '미설정'
}

function onOff(flag: boolean): string {
  return flag ? '켜짐' : '꺼짐'
}

function failureNote(id: ChannelId, lastResult: Partial<Record<ChannelId, ChannelResult>>): string {
  const result = lastResult[id]
  if (!result || result.ok) return ''
  return ` (최근 실패: ${result.error})`
}

/** `/alarm`의 상태 출력. */
export function buildStatusText(
  cfg: NormalizedOptions,
  muted: boolean,
  lastResult: Partial<Record<ChannelId, ChannelResult>>,
): string {
  const lines: string[] = []
  lines.push('🔔 작업 끝 알림 상태')
  lines.push(`- 이 세션 알림: ${muted ? '꺼짐 · /alarm on으로 다시 켜세요' : '켜짐'}`)
  lines.push(`- 데스크톱: ${onOff(cfg.desktop)}${failureNote('desktop', lastResult)}`)
  lines.push(`- 음성: ${onOff(cfg.voice)}${failureNote('voice', lastResult)}`)
  lines.push(`- ntfy: ${cfg.ntfyTopic ? '켜짐' : '꺼짐'}${failureNote('ntfy', lastResult)}`)
  lines.push(
    `- Telegram: ${cfg.telegramBotToken && cfg.telegramChatId ? `켜짐 (토큰 ${maskSensitive(cfg.telegramBotToken)})` : '꺼짐'}${failureNote('telegram', lastResult)}`,
  )
  lines.push(`- Webhook: ${cfg.webhookUrl ? `켜짐 (${maskSensitive(cfg.webhookUrl)})` : '꺼짐'}${failureNote('webhook', lastResult)}`)
  lines.push(`- 기준 시간: ${cfg.minSeconds}초 이상 걸린 작업만 알려요`)
  return lines.join('\n')
}

/** `/alarm test`의 채널별 결과 출력. */
export function buildTestReportText(ids: ChannelId[], results: Partial<Record<ChannelId, ChannelResult>>): string {
  if (ids.length === 0) {
    return '🔔 켜진 채널이 없어요. /alarm 으로 상태를 보고 하나 이상 켜주세요.'
  }
  const lines = ['🔔 테스트 결과']
  for (const id of ids) {
    const result = results[id]
    const label = CHANNEL_LABELS[id]
    lines.push(result?.ok ? `✓ ${label}` : `✗ ${label}: ${result?.ok === false ? result.error : '알 수 없는 오류'}`)
  }
  return lines.join('\n')
}

/** `/alarm` 뒤에 붙는 말 한 마디를 해석한다. */
export function parseAlarmArgs(args: string): 'status' | 'test' | 'on' | 'off' | 'unknown' {
  const word = args.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  if (word === '') return 'status'
  if (word === 'test' || word === 'on' || word === 'off') return word
  return 'unknown'
}
