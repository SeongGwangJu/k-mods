import { expect, test } from 'claude-code/testing'

import {
  buildAppleScript,
  buildFinishedMessage,
  buildNeedsYouMessage,
  buildStatusText,
  buildTestReportText,
  enabledChannelIds,
  escapeAppleScript,
  firstLineSummary,
  formatDuration,
  maskSensitive,
  normalizeOptions,
  parseAlarmArgs,
  projectNameOf,
  rfc2047,
  shouldNotifyFinished,
  shouldNotifyNeedsYou,
  stripMarkdown,
  truncate,
  webhookBody,
  type NormalizedOptions,
} from '../hooks/format.js'

function baseCfg(overrides: Partial<NormalizedOptions> = {}): NormalizedOptions {
  return {
    minSeconds: 30,
    desktop: true,
    voice: false,
    ntfyTopic: '',
    ntfyServer: 'https://ntfy.sh',
    telegramBotToken: '',
    telegramChatId: '',
    webhookUrl: '',
    includeSummary: false,
    ...overrides,
  }
}

// ---- formatDuration: 한국식 길이 표기 ----

test('formatDuration: 45초처럼 1분 미만은 초만 보여준다', async () => {
  expect(formatDuration(45_000)).toBe('45초')
})

test('formatDuration: 3분 12초처럼 분과 초를 함께 보여준다', async () => {
  expect(formatDuration(192_000)).toBe('3분 12초')
})

test('formatDuration: 1시간 2분처럼 시간이 있으면 초는 생략한다', async () => {
  expect(formatDuration(3_720_000)).toBe('1시간 2분')
})

test('formatDuration: 0이나 음수는 0초로 바닥을 깐다', async () => {
  expect(formatDuration(0)).toBe('0초')
  expect(formatDuration(-500)).toBe('0초')
})

// ---- shouldNotifyFinished: 기준 시간·중단·서브에이전트 ----

test('shouldNotifyFinished: 메인 대화에서 기준 시간 이상이면 알린다', async () => {
  expect(shouldNotifyFinished({ isAborted: false, durationMs: 30_000 }, 30)).toBe(true)
})

test('shouldNotifyFinished: 기준 시간보다 짧으면 알리지 않는다', async () => {
  expect(shouldNotifyFinished({ isAborted: false, durationMs: 29_999 }, 30)).toBe(false)
})

test('shouldNotifyFinished: 중단된 턴은 기준 시간을 넘어도 알리지 않는다', async () => {
  expect(shouldNotifyFinished({ isAborted: true, durationMs: 60_000 }, 30)).toBe(false)
})

test('shouldNotifyFinished: 서브에이전트 턴(agentId 있음)은 알리지 않는다', async () => {
  expect(shouldNotifyFinished({ agentId: 'sub-1', isAborted: false, durationMs: 60_000 }, 30)).toBe(false)
})

test('shouldNotifyFinished: min_seconds가 0이면 아주 짧은 턴도 알린다', async () => {
  expect(shouldNotifyFinished({ isAborted: false, durationMs: 1 }, 0)).toBe(true)
})

// ---- shouldNotifyNeedsYou: 디바운스 ----

test('shouldNotifyNeedsYou: 60초 안에 또 오면 막는다', async () => {
  expect(shouldNotifyNeedsYou(0, 59_999, 60_000)).toBe(false)
})

test('shouldNotifyNeedsYou: 정확히 60초가 지나면 다시 보낸다', async () => {
  expect(shouldNotifyNeedsYou(0, 60_000, 60_000)).toBe(true)
})

test('shouldNotifyNeedsYou: 맨 처음(lastAt이 -Infinity)에는 바로 보낸다', async () => {
  expect(shouldNotifyNeedsYou(-Infinity, 0, 60_000)).toBe(true)
})

// ---- 메시지 포맷 ----

test('buildFinishedMessage: 요약 없이', async () => {
  expect(buildFinishedMessage({ durationMs: 192_000, project: 'my-project' })).toBe('✅ 작업 끝 · 3분 12초 · my-project')
})

test('buildFinishedMessage: 요약이 있으면 다음 줄에 붙인다', async () => {
  expect(buildFinishedMessage({ durationMs: 45_000, project: 'k-mods', summary: '테스트를 모두 통과했어요' })).toBe(
    '✅ 작업 끝 · 45초 · k-mods\n테스트를 모두 통과했어요',
  )
})

test('buildNeedsYouMessage', async () => {
  expect(buildNeedsYouMessage({ project: 'k-mods', reason: 'Bash 권한이 필요해요' })).toBe(
    '🙋 확인이 필요해요 · k-mods · Bash 권한이 필요해요',
  )
})

// ---- 마크다운 제거 · 요약 자르기 ----

test('stripMarkdown: 굵게·코드·링크·헤딩을 걷어낸다', async () => {
  expect(stripMarkdown('# 제목')).toBe('제목')
  expect(stripMarkdown('이건 **중요**하고 `code`예요')).toBe('이건 중요하고 code예요')
  expect(stripMarkdown('[링크](https://example.com) 확인')).toBe('링크 확인')
  expect(stripMarkdown('- 목록 항목')).toBe('목록 항목')
})

test('truncate: maxLen 이하면 그대로, 넘으면 말줄임표로 끝내고 길이를 지킨다', async () => {
  expect(truncate('짧은 글', 80)).toBe('짧은 글')
  const long = 'a'.repeat(100)
  const cut = truncate(long, 80)
  expect(cut.length).toBe(80)
  expect(cut.endsWith('…')).toBe(true)
})

test('firstLineSummary: 첫 줄만, 마크다운 없이, 80자로', async () => {
  expect(firstLineSummary('**끝났어요**\n두 번째 줄')).toBe('끝났어요')
  expect(firstLineSummary('')).toBe('')
  expect(firstLineSummary('\n   \n실제 내용')).toBe('실제 내용')
})

// ---- 프로젝트 이름 ----

test('projectNameOf: 절대 경로에서 마지막 폴더 이름만', async () => {
  expect(projectNameOf('/Users/jsg/git/personal/cc-mods')).toBe('cc-mods')
  expect(projectNameOf('/Users/jsg/git/personal/cc-mods/')).toBe('cc-mods')
})

// ---- AppleScript 이스케이프 ----

test('escapeAppleScript: 백슬래시와 큰따옴표를 이스케이프한다', async () => {
  expect(escapeAppleScript('she said "hi"')).toBe('she said \\"hi\\"')
  expect(escapeAppleScript('C:\\path\\to\\file')).toBe('C:\\\\path\\\\to\\\\file')
  // 백슬래시를 먼저 이스케이프해야, 따옴표 때문에 새로 생긴 백슬래시가 다시 이스케이프되지 않는다
  expect(escapeAppleScript('"')).toBe('\\"')
})

test('buildAppleScript: 한 줄 메시지는 그대로 담는다', async () => {
  const script = buildAppleScript('✅ 작업 끝 · 45초 · my-project', 'my-project')
  expect(script).toBe(
    'display notification ("✅ 작업 끝 · 45초 · my-project") with title "Claude Code" subtitle "my-project" sound name "Glass"',
  )
})

test('buildAppleScript: 여러 줄 메시지는 return으로 이어 붙인다 (AppleScript 문자열엔 줄바꿈을 못 담는다)', async () => {
  const script = buildAppleScript('첫 줄\n둘째 줄', 'proj')
  expect(script).toBe(
    'display notification ("첫 줄" & return & "둘째 줄") with title "Claude Code" subtitle "proj" sound name "Glass"',
  )
})

test('buildAppleScript: 메시지 안의 따옴표도 이스케이프된다', async () => {
  const script = buildAppleScript('결과는 "성공"이에요', 'proj')
  expect(script).toContain('\\"성공\\"')
})

// ---- ntfy 제목 인코딩 ----

test('rfc2047: 인쇄 가능한 ASCII는 그대로 둔다', async () => {
  expect(rfc2047('Claude Code')).toBe('Claude Code')
})

test('rfc2047: 한글이 섞이면 UTF-8 Base64로 감싼다', async () => {
  const encoded = rfc2047('완료')
  expect(encoded.startsWith('=?UTF-8?B?')).toBe(true)
  expect(encoded.endsWith('?=')).toBe(true)
})

// ---- webhook payload ----

test('webhookBody: slack은 text, discord는 content, 그 외는 text', async () => {
  expect(webhookBody('https://hooks.slack.com/services/x', '메시지')).toEqual({ text: '메시지' })
  expect(webhookBody('https://discord.com/api/webhooks/x', '메시지')).toEqual({ content: '메시지' })
  expect(webhookBody('https://discordapp.com/api/webhooks/x', '메시지')).toEqual({ content: '메시지' })
  expect(webhookBody('https://example.com/hook', '메시지')).toEqual({ text: '메시지' })
})

// ---- 채널 활성화 ----

test('enabledChannelIds: 기본값은 데스크톱만 켜져 있다', async () => {
  expect(enabledChannelIds(baseCfg())).toEqual(['desktop'])
})

test('enabledChannelIds: telegram은 토큰과 chat id가 모두 있어야 켜진다', async () => {
  expect(enabledChannelIds(baseCfg({ desktop: false, telegramBotToken: 'abc' }))).toEqual([])
  expect(enabledChannelIds(baseCfg({ desktop: false, telegramBotToken: 'abc', telegramChatId: '123' }))).toEqual([
    'telegram',
  ])
})

test('enabledChannelIds: 전부 켜면 늘 같은 순서로 돌려준다', async () => {
  expect(
    enabledChannelIds(
      baseCfg({
        voice: true,
        ntfyTopic: 't',
        telegramBotToken: 'tok',
        telegramChatId: 'id',
        webhookUrl: 'https://example.com/hook',
      }),
    ),
  ).toEqual(['desktop', 'voice', 'ntfy', 'telegram', 'webhook'])
})

// ---- normalizeOptions: 타입이 안 맞아도 기본값으로 떨어진다 ----

test('normalizeOptions: 값이 없으면 선언된 기본값을 쓴다', async () => {
  const cfg = normalizeOptions({})
  expect(cfg.minSeconds).toBe(30)
  expect(cfg.desktop).toBe(true)
  expect(cfg.voice).toBe(false)
  expect(cfg.ntfyServer).toBe('https://ntfy.sh')
})

test('normalizeOptions: 타입이 안 맞는 값은 무시하고 기본값으로', async () => {
  const cfg = normalizeOptions({ min_seconds: 'oops', desktop: 'yes' })
  expect(cfg.minSeconds).toBe(30)
  expect(cfg.desktop).toBe(true)
})

// ---- /alarm 인자 파싱 ----

test('parseAlarmArgs', async () => {
  expect(parseAlarmArgs('')).toBe('status')
  expect(parseAlarmArgs('   ')).toBe('status')
  expect(parseAlarmArgs('test')).toBe('test')
  expect(parseAlarmArgs('ON')).toBe('on')
  expect(parseAlarmArgs('off')).toBe('off')
  expect(parseAlarmArgs('banana')).toBe('unknown')
})

// ---- 토큰 가리기 ----

test('maskSensitive: 값이 있으면 ●●●, 없으면 미설정', async () => {
  expect(maskSensitive('super-secret-token')).toBe('●●●')
  expect(maskSensitive('')).toBe('미설정')
})

// ---- /alarm status 출력 ----

test('buildStatusText: 켜진 채널과 기준 시간이 보인다', async () => {
  const text = buildStatusText(baseCfg({ telegramBotToken: 'tok', telegramChatId: 'id' }), false, {})
  expect(text).toContain('데스크톱: 켜짐')
  expect(text).toContain('음성: 꺼짐')
  expect(text).toContain('Telegram: 켜짐 (토큰 ●●●)')
  expect(text).toContain('30초 이상')
  expect(text).not.toContain('tok') // 토큰 원문은 절대 나오면 안 된다
})

test('buildStatusText: 음소거면 상태 줄에 드러난다', async () => {
  expect(buildStatusText(baseCfg(), true, {})).toContain('꺼짐')
})

test('buildStatusText: 최근 실패를 함께 보여준다', async () => {
  const text = buildStatusText(baseCfg(), false, { desktop: { ok: false, error: '프로그램을 찾을 수 없어요' } })
  expect(text).toContain('최근 실패: 프로그램을 찾을 수 없어요')
})

// ---- /alarm test 출력 ----

test('buildTestReportText: 켜진 채널이 없으면 안내만 보여준다', async () => {
  expect(buildTestReportText([], {})).toContain('켜진 채널이 없어요')
})

test('buildTestReportText: 성공은 체크, 실패는 X와 이유', async () => {
  const text = buildTestReportText(['desktop', 'webhook'], {
    desktop: { ok: true },
    webhook: { ok: false, error: 'HTTP 404' },
  })
  expect(text).toContain('✓ 데스크톱')
  expect(text).toContain('✗ Webhook: HTTP 404')
})
