// ctx-strip
//   턴마다 컨텍스트 구성(/context와 같은 분류)을 재서 막대와 범례로 보여준다. 어디에 그릴지는 display:
//   "band"(기본): 입력창 위 띠.
//   "hint": 입력창 아래, 모드 표시 줄 밑.
//   "statusline": 그리지 않고 사람별 임시 폴더에 JSON 스냅샷만 써서, 사용자가 자기 상태줄
//     명령에서 extras/statusline-ctx.py로 읽어 상태줄 바로 아래에 그리게 한다(README 참고).
//   모든 모드: 서브에이전트가 돌 때만 힌트 줄 아래에 한 줄(종류·모델·설명·경과 시간).
//   /ctx: 상세 리포트(HTML)를 써서 연다. 유일한 명령.
//
// 구성은 $.session.usage({ breakdown: "summary" })로 받는다. summary는 로컬 추정이라 API 호출이 없다.
import type { ElementConstructor, EngineInterface, On, PluginOptions, RenderElement, SessionContextBreakdown, TextProps } from 'claude-code'

import { barSegments, barWidth, deltaText, legendChips, percentSeverity, widthTier } from './bar'
import { SHORT_LABEL } from './categories'
import { k } from './format'
import { categoryColor, paletteName, paletteOf, type CtxPalette } from './palette'
import { snapshotPayload, tempDirFrom } from './paths'
import { buildReportHtml, heaviestItems } from './report'

const DONE_LINGER_MS = 8000

type Display = 'hint' | 'band' | 'statusline'
type PendingAgent = { type: string; description: string; model: string | null }
type RunningAgent = PendingAgent & { id: string; startedAt: number; endedAt: number | null }

let previousTotal: number | null = null
let delta: number | null = null
let latestBreakdown: SessionContextBreakdown | null = null

// 서브에이전트. pending은 Agent 도구 호출로 알게 된 설명·모델을 SubagentStart와 짝지을 때까지 둔다.
let pending: PendingAgent[] = []
let agents: RunningAgent[] = []
let stopTicker: { cancel: () => void } | null = null

export function register(on: On, options: PluginOptions): void {
  const palette = paletteOf(options.palette)
  const paletteId = paletteName(options.palette)
  const display: Display = options.display === 'statusline' ? 'statusline' : options.display === 'hint' ? 'hint' : 'band'

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'ctx', description: '컨텍스트 상세 리포트 열기', immediate: true })
    if (display === 'statusline') await ensureDir($, await tempDir($))
    await measure($, display, paletteId)
    return next(e)
  })

  // 턴이 끝날 때, 요금제 한도 비율이 바뀔 때 엔진이 알려준다. 타이머로 폴링하지 않는다.
  on('session.measure', async ($, e, next) => {
    await measure($, display, paletteId)
    return next(e)
  })

  // /clear, 압축 뒤에는 구성이 크게 바뀌므로 증가량을 지우고 다시 잰다.
  on('classic.SessionStart', async ($, e, next) => {
    previousTotal = null
    delta = null
    await measure($, display, paletteId)
    return next(e)
  })

  on('command.run', { command: 'ctx' }, async ($) => {
    const usage = await $.session.usage({ breakdown: 'summary', columns: 80 }).catch(() => null)
    const breakdown = usage?.context.breakdown ?? latestBreakdown
    if (!breakdown) return { text: '컨텍스트 정보를 아직 잴 수 없어요.' }
    const dir = await tempDir($)
    await ensureDir($, dir)
    const path = `${dir}/${await $.session.id()}.html`
    const messages = await $.session.messages().catch(() => [])
    const heavy = heaviestItems(Array.isArray(messages) ? messages : [])
    const home = await $.env.get('HOME')
    await $.fs.write(path, buildReportHtml(breakdown, heavy, home))
    await openPath($, path)
    return { text: `상세 리포트를 열었어요: ${path}` }
  })

  on('tool.call', { tool: 'Agent' }, async ($, e, next) => {
    pending.push({
      type: String(e.subagent_type ?? 'general-purpose'),
      description: String(e.description ?? ''),
      model: e.model ? String(e.model) : null,
    })
    return next(e)
  }).catch(async ($, e, next) => next(e))

  on('classic.SubagentStart', async ($, e, next) => {
    const index = pending.findIndex((p) => p.type === e.agent_type)
    const meta: PendingAgent = index >= 0 ? pending.splice(index, 1)[0]! : { type: String(e.agent_type), description: '', model: null }
    agents.push({ id: String(e.agent_id), ...meta, startedAt: await $.clock.now(), endedAt: null })
    startTicker($)
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('classic.SubagentStop', async ($, e, next) => {
    const agent = agents.find((a) => a.id === e.agent_id)
    if (agent) agent.endedAt = await $.clock.now()
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // 입력창 아래: hint 모드면 컨텍스트 막대, 모든 모드에서 서브에이전트가 돌 때만 그 줄.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const theirs = await next(e)
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return theirs
    const { Box, Text } = $.ui.resolve(e)
    const columns = e.viewport?.columns ?? 100
    const rows: RenderElement[] = []
    // 힌트 줄은 왼쪽 2칸 들여쓰기로 그려지므로 그만큼 빼고 잰다
    if (display === 'hint') rows.push(...contextRows(Text, palette, Math.max(20, columns - 4), '  '))
    // 시계는 서브에이전트가 있을 때만 읽는다 (힌트 줄은 자주 다시 그려진다)
    if (agents.length > 0) {
      const now = await $.clock.now()
      agents = agents.filter((a) => a.endedAt === null || now - a.endedAt < DONE_LINGER_MS)
      if (agents.length === 0) stopTickerIfIdle()
      else rows.push(agentLine(Text, palette, columns, now))
    }
    if (rows.length === 0) return theirs
    return Box({ flexDirection: 'column', children: [theirs, ...rows] })
  })

  // 입력창 위: band 모드일 때만.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const theirs = await next(e)
    if (e.props.hasSurvey) return theirs
    if (display !== 'band') return theirs
    const { Box, Text } = $.ui.resolve(e)
    const rows = contextRows(Text, palette, e.props.bodyColumns, '')
    if (rows.length === 0) return theirs
    return Box({ flexDirection: 'column', children: [theirs, ...rows] })
  })
}

/** 서브에이전트 한 줄: ⎇ N  종류·모델 설명 경과시간 │ ... */
function agentLine(Text: ElementConstructor<TextProps>, palette: CtxPalette, columns: number, now: number): RenderElement {
  const running = agents.filter((a) => a.endedAt === null).length
  const showDescription = columns >= 110
  const parts = [Text({ color: palette.agentAccent, bold: true, children: running > 0 ? ` ⎇ ${running}` : ' ⎇' })]
  agents.forEach((a, i) => {
    const elapsed = clock((a.endedAt ?? now) - a.startedAt)
    const model = a.model ? `·${a.model}` : ''
    const label = showDescription && a.description ? `${a.type}${model} ${a.description}` : `${a.type}${model}`
    const isDone = a.endedAt !== null
    parts.push(Text({ children: i === 0 ? '  ' : ' │ ' }))
    parts.push(Text({ color: isDone ? palette.agentDone : palette.bright, children: `${label} ${elapsed}${isDone ? ' ✓' : ''}` }))
  })
  return Text({ wrap: 'truncate-end', children: parts })
}

/** 컨텍스트 막대와 범례. 넓음: 막대+전체 범례, 보통: 막대+상위 3개, 좁음: 한 줄 요약. 아직 못 쟀으면 빈 배열. */
function contextRows(Text: ElementConstructor<TextProps>, palette: CtxPalette, bodyColumns: number, indent: string): RenderElement[] {
  const breakdown = latestBreakdown
  if (!breakdown) return []
  const tier = widthTier(bodyColumns)
  const used = breakdown.categories.filter((c) => c.kind === 'used' && c.tokens > 0)
  const max = breakdown.rawMaxTokens || breakdown.maxTokens || 1
  const threshold = breakdown.isAutoCompactEnabled ? (breakdown.autoCompactThreshold ?? null) : null
  const colorFor = (name: string) => categoryColor(palette, name, Math.max(0, used.findIndex((c) => c.name === name)))
  const severity = percentSeverity(breakdown.percentage)
  const severityColor = severity === 'danger' ? palette.danger : severity === 'warn' ? palette.warn : palette.bright
  const dInfo = deltaText(delta)
  const lead = indent ? [Text({ children: indent })] : []

  if (tier === 'narrow') {
    const showDelta = delta !== null && Math.abs(delta) >= 1000
    const arrow = showDelta && delta !== null ? (delta > 0 ? '▲' : '▼') : ''
    const deltaPart = showDelta && delta !== null ? `${arrow}${k(Math.abs(delta))}` : ''
    return [
      Text({
        wrap: 'truncate-end',
        children: [
          ...lead,
          Text({ color: severityColor, bold: true, children: `컨텍스트 ${breakdown.percentage}%` }),
          ...(deltaPart ? [Text({ color: palette.dim, children: ` ${deltaPart}` })] : []),
        ],
      }),
    ]
  }

  const width = barWidth(bodyColumns)
  const runs = barSegments(
    used.map((c) => ({ name: c.name, tokens: c.tokens })),
    width,
    max,
    threshold,
  )
  const barCells = runs.map((run) => {
    if (run.hasMark) return Text({ backgroundColor: palette.track, color: palette.mark, children: '▕' })
    const bg = run.key ? colorFor(run.key) : palette.track
    return Text({ backgroundColor: bg, children: ' '.repeat(run.length) })
  })
  const nearCompact = threshold !== null && threshold - breakdown.totalTokens < max * 0.15
  const barLine = Text({
    wrap: 'truncate-end',
    children: [
      ...lead,
      ...barCells,
      Text({ bold: true, color: severityColor, children: ` ${breakdown.percentage}%` }),
      ...(dInfo.text ? [Text({ color: dInfo.isBig ? palette.warn : palette.dim, children: `  ${dInfo.text}` })] : []),
      ...(nearCompact ? [Text({ color: palette.danger, bold: true, children: ` 압축까지 ${k(Math.max(0, threshold! - breakdown.totalTokens))}` })] : []),
    ],
  })

  const chips = legendChips(
    used.map((c) => ({ name: c.name, tokens: c.tokens })),
    max,
    tier === 'medium' ? 3 : undefined,
  )
  const legendLine = Text({
    wrap: 'truncate-end',
    children: [
      ...lead,
      ...chips.map((c) => Text({ backgroundColor: colorFor(c.name), color: palette.chipInk, children: ` ${SHORT_LABEL[c.name] ?? c.name} ${c.pct} ` })),
    ],
  })
  return [barLine, legendLine]
}

async function measure($: EngineInterface, display: Display, paletteId: string): Promise<void> {
  try {
    const usage = await $.session.usage({ breakdown: 'summary', columns: 80 })
    const breakdown = usage.context.breakdown
    if (!breakdown) return
    const total = breakdown.totalTokens
    if (previousTotal !== null && total !== previousTotal) delta = total - previousTotal
    previousTotal = total
    latestBreakdown = breakdown
    // hint·band는 이 mod가 직접 그리므로, 상태줄과 달리 다시 그리라고 알려야 한다.
    $.ui.invalidate('ui.render')
    if (display === 'statusline') {
      const dir = await tempDir($)
      await ensureDir($, dir)
      const id = await $.session.id()
      await $.fs.write(`${dir}/${id}.json`, JSON.stringify(snapshotPayload(breakdown, delta, paletteId)))
    }
  } catch {
    // 잴 수 없으면 이전 상태를 그대로 둔다
  }
}

/** 사람별 임시 폴더 경로. $.env.get을 두 번 읽어 순수 계산(tempDirFrom)에 넘긴다. */
async function tempDir($: EngineInterface): Promise<string> {
  const tmpdir = await $.env.get('TMPDIR')
  const user = (await $.env.get('USER')) ?? (await $.env.get('USERNAME'))
  return tempDirFrom(tmpdir, user)
}

async function ensureDir($: EngineInterface, dir: string): Promise<void> {
  await $.process.run(['mkdir', '-p', dir], { timeoutMs: 5000 }).catch(() => {})
}

/** macOS는 open, 그 외(주로 Linux)는 xdg-open. 하나가 실패하면 다른 쪽을 시도한다. */
async function openPath($: EngineInterface, path: string): Promise<void> {
  try {
    await $.process.run(['open', path], { timeoutMs: 5000 })
  } catch {
    await $.process.run(['xdg-open', path], { timeoutMs: 5000 }).catch(() => {})
  }
}

function startTicker($: EngineInterface): void {
  if (stopTicker !== null) return
  stopTicker = $.clock.every(1000, () => $.ui.invalidate('ui.render'))
}

function stopTickerIfIdle(): void {
  if (stopTicker === null) return
  stopTicker.cancel()
  stopTicker = null
}

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
