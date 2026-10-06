import { expect, mock, test } from 'claude-code/testing'
import type { SessionContextBreakdown, SessionUsage } from 'claude-code'

// register.test.ts는 band(기본 display)·dark(기본 palette)로 로드된 mod를 쓴다. claude-code/testing은
// 디렉터리의 plugin.json 기본값으로만 mod를 불러오고 options를 바꿔치기할 방법이 없어서(이 mod가
// /ctx를 등록하는 유일한 command.register 호출자라 plugins:[...]로 같은 mod를 다른 options로 또
// 불러오면 /ctx가 두 번 등록돼 충돌한다), "statusline" 분기는 여기서 돌리지 않는다. 그 분기가 실제로
// 무엇을 쓰는지는 tests/paths.test.ts가 순수 함수(snapshotPayload/tempDirFrom)로 증명한다.

const ABOVE_PROMPT = (bodyColumns: number) => ({
  plugin: 'ctx-strip',
  component: 'AbovePrompt' as const,
  requestId: 'band',
  props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns, scroll: { offset: 0, bodyRows: 20 }, view: {} },
})

// hint 모드는 힌트 줄 들여쓰기 몫으로 4칸을 빼고 재므로, 원하는 폭 + 4를 넘긴다
const HINT_AT = (columns: number) => ({
  plugin: 'ctx-strip',
  component: 'PromptHint' as const,
  requestId: `hint-${columns}`,
  viewport: { columns: columns + 4, rows: 30, isFullscreen: true },
  props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
})

const PROMPT_HINT = {
  plugin: 'ctx-strip',
  component: 'PromptHint' as const,
  requestId: 'hint',
  // columns >= 110 so the agent line's description shows (narrower terminals hide it to save room)
  viewport: { columns: 120, rows: 30, isFullscreen: true },
  props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
}

function breakdownOf(totalTokens: number, messagesTokens: number): SessionContextBreakdown {
  const rest = totalTokens - messagesTokens
  return {
    categories: [
      { name: 'Messages', tokens: messagesTokens, color: 'claude', isDeferred: false, kind: 'used' },
      { name: 'System tools', tokens: Math.max(0, rest - 100), color: 'suggestion', isDeferred: false, kind: 'used' },
      { name: 'Skills', tokens: Math.min(100, Math.max(0, rest)), color: 'warning', isDeferred: false, kind: 'used' },
      { name: 'Free space', tokens: Math.max(0, 1000 - totalTokens), color: 'inactive', isDeferred: false, kind: 'free' },
    ],
    totalTokens,
    maxTokens: 1000,
    rawMaxTokens: 1000,
    autocompactSource: 'auto',
    percentage: Math.round((totalTokens / 1000) * 100),
    gridRows: [],
    model: 'claude-opus-5-5',
    memoryFiles: [],
    mcpTools: [],
    agents: [],
    isAutoCompactEnabled: true,
    autoCompactThreshold: 850,
    apiUsage: null,
  }
}

function stubUsageSequence(on: (name: string, fn: (...args: unknown[]) => unknown) => void, breakdowns: SessionContextBreakdown[]) {
  const queue = [...breakdowns]
  on('session.usage', () => {
    const breakdown = queue.shift() ?? breakdowns[breakdowns.length - 1]
    const value: SessionUsage = { startedAt: 0, context: { window: 1000, breakdown }, rateLimits: [] }
    return { value }
  })
}

test('band: wide tier shows the stacked bar, percent, and full legend', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ctx' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }))
  stubUsageSequence(on, [breakdownOf(700, 330)])

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...ABOVE_PROMPT(120), surface })
    expect(await ui.find({ type: 'Text', text: /70%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /대화 33%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /도구 27%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /스킬 10%/ })).toBeDefined()
    await ui.unmount()
  }
})

test('band: medium tier keeps the bar but trims the legend to the top 3', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ctx' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }))
  stubUsageSequence(on, [breakdownOf(700, 330)])

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...ABOVE_PROMPT(80), surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /70%/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /대화 33%/ })).toBeDefined()
})

test('band: narrow tier collapses to a single 컨텍스트 N% line with no legend', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ctx' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }))
  stubUsageSequence(on, [breakdownOf(700, 330)])

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...ABOVE_PROMPT(60), surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /컨텍스트 70%/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /대화/ })).toBeUndefined()
})

test('band: the hint line under the prompt is left alone when no subagent runs', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ctx' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['THEIRS'] }))
  stubUsageSequence(on, [breakdownOf(700, 330)])

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...HINT_AT(120), surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: 'THEIRS' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /70%/ })).toBeUndefined()
})

test('band: delta shows the increase since the last measurement, and classic.SessionStart clears it', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ctx' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('session.measure', () => ({ changed: ['context'] }))
  on('classic.SessionStart', () => ({}))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }))
  // 1) session.start가 재는 값, 2) session.measure가 재는(늘어난) 값, 3) classic.SessionStart 뒤 다시 잰 값
  stubUsageSequence(on, [breakdownOf(700, 330), breakdownOf(4400, 4030), breakdownOf(200, 100)])

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  await $.session.measure({ context: { window: 1000 }, rateLimits: [], changed: ['context'] })

  const afterMeasure = await $.ui.mount({ ...ABOVE_PROMPT(120), surface: 'terminal' })
  expect(await afterMeasure.find({ type: 'Text', text: /\+3\.7k/ })).toBeDefined()

  await $.classic.SessionStart({ source: 'clear' })
  const afterClear = await $.ui.mount({ ...ABOVE_PROMPT(120), surface: 'terminal', requestId: 'band-2' })
  expect(await afterClear.find({ type: 'Text', text: /\+3\.7k/ })).toBeUndefined()
})

test('/ctx writes the HTML report under the per-user temp dir and opens it', async ($, on) => {
  const written: Array<{ path: string; text: string }> = []
  const ran: string[][] = []
  on('command.register', () => ({ value: { command: 'ctx' } }))
  on('session.id', () => ({ value: 'sess-1' }))
  on('session.messages', () => ({ value: [] }))
  on('env.get', ($, e) => ({ value: e.name === 'TMPDIR' ? '/tmp/x' : e.name === 'USER' ? 'rd' : e.name === 'HOME' ? '/Users/rd' : undefined }))
  on('fs.write', ($, e) => {
    written.push({ path: e.path, text: e.text })
    return { value: undefined }
  })
  on('process.run', ($, e) => {
    ran.push([...e.argv])
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  stubUsageSequence(on, [breakdownOf(700, 330)])

  const answer = await $.command.run({
    command: 'ctx',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 100 },
  })

  expect(written).toHaveLength(1)
  expect(written[0]?.path).toBe('/tmp/x/ctx-strip-rd/sess-1.html')
  expect(written[0]?.text).toContain('컨텍스트 70%')
  expect(ran.some((argv) => argv[0] === 'mkdir')).toBe(true)
  expect(ran.some((argv) => argv[0] === 'open' && argv[1] === '/tmp/x/ctx-strip-rd/sess-1.html')).toBe(true)
  expect(answer.text).toContain('/tmp/x/ctx-strip-rd/sess-1.html')
})

test('subagent line: appears while running, shows done, then disappears after the linger window', async ($, on) => {
  const clock = mock.clock(on)
  on('tool.call', () => ({ result: 'ok' }))
  on('classic.SubagentStart', () => ({}))
  on('classic.SubagentStop', () => ({}))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }))

  await $.tool.call({ tool: 'Agent', tool_use_id: 'tu1', description: '요약 작업', prompt: 'p', subagent_type: 'general-purpose' })
  await $.classic.SubagentStart({ agent_id: 'a1', agent_type: 'general-purpose' })

  const running = await $.ui.mount({ ...PROMPT_HINT, surface: 'terminal' })
  expect(await running.find({ type: 'Text', text: /⎇/ })).toBeDefined()
  expect(await running.find({ type: 'Text', text: /요약 작업/ })).toBeDefined()

  await $.classic.SubagentStop({ agent_id: 'a1', agent_type: 'general-purpose', stop_hook_active: false, agent_transcript_path: '/tmp/t.jsonl' })
  const done = await $.ui.mount({ ...PROMPT_HINT, surface: 'terminal', requestId: 'hint-2' })
  expect(await done.find({ type: 'Text', text: /✓/ })).toBeDefined()

  await clock.advance(8000)
  const gone = await $.ui.mount({ ...PROMPT_HINT, surface: 'terminal', requestId: 'hint-3' })
  expect(await gone.find({ type: 'Text', text: /⎇/ })).toBeUndefined()
})
