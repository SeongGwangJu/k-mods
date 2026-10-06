import type { On, RenderElement } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const SURFACES = ['terminal', 'desktop'] as const

const SITE = { plugin: 'skins', viewport: { columns: 100, rows: 30 } } as const

// Stands for what Claude Code would draw wherever the skin hands a row back.
const STOCK: RenderElement = { type: 'Text', props: {}, children: ['stock row'] }

const PANE = {
  ...SITE,
  component: 'Pane',
  requestId: 'skins-settings',
  props: {
    title: 'Skins',
    isFocused: true,
    bodyColumns: 80,
    placement: 'inline',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

const call = (tool: string, input: unknown, state: object = {}) => ({
  tool_use_id: 'tu1',
  tool,
  input,
  isRunning: false,
  isErrored: false,
  isInterrupted: false,
  ...state,
})

type Found = { props: Record<string, unknown>; children?: readonly unknown[] } | undefined

// `find` matches text anywhere in a row, so a span's colour is read from its children.
function spanColor(row: Found, text: string): unknown {
  for (const child of row?.children ?? []) {
    const element = child as { props?: { color?: unknown }; children?: readonly unknown[] }

    if (element.children?.[0] === text) {
      return element.props?.color
    }

    const inner = spanColor(element as Found, text)

    if (inner !== undefined) {
      return inner
    }
  }

  return undefined
}

const runSkin = ($: Engine, args: string) =>
  $.command.run({
    command: 'skin',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 100 },
  })

// The engine's own answers, so a hook can mount without a session.
function stubEngine(on: On) {
  mock.clock(on, { now: 10_000 })
  on('session.cwd', () => ({ value: '/work' }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000, percent: 42 }, rateLimits: [{ kind: 'five_hour', percentUsed: 18 }] } }))
  // The dialog must hold Claude Code's own drawing, which a real engine hands back by reference.
  on('ui.render', ($, e) => (e.component === 'AskUserQuestion' ? { type: 'engine', ref: 0 } : STOCK))
}

const toolUse = (props: ReturnType<typeof call>, surface: (typeof SURFACES)[number] = 'terminal') =>
  ({ ...SITE, surface, component: 'ToolUse', requestId: props.tool_use_id, props }) as const

test('a Bash call is a node on the terminal\u2019s rail and an icon row on the desktop', async ($, on) => {
  stubEngine(on)

  const terminal = await $.ui.mount(toolUse(call('Bash', { command: 'pnpm test' }), 'terminal'))
  expect(await terminal.find({ type: 'Text', text: '┃' })).toBeDefined()
  expect(await terminal.find({ type: 'Text', text: /●─ Bash {2}pnpm test/ })).toBeDefined()
  await terminal.unmount()

  const desktop = await $.ui.mount(toolUse(call('Bash', { command: 'pnpm test' }), 'desktop'))
  const icon = (await desktop.find({ type: 'Svg' })) as { props: { source: string } } | undefined
  expect(icon?.props.source).toContain('M5 7l5 5-5 5')
  expect(await desktop.find({ type: 'Text', text: /Bash {2}pnpm test/ })).toBeDefined()
  expect(await desktop.find({ type: 'Text', text: '┃' })).toBeUndefined()
  await desktop.unmount()

  const running = await $.ui.mount(toolUse(call('Bash', { command: 'sleep 9' }, { tool_use_id: 'tu3', isRunning: true }), 'desktop'))
  const spinning = (await running.find({ type: 'Svg' })) as { props: { source: string } } | undefined
  expect(spinning?.props.source).toContain('class="spin"')
})

test('an edit shows its added and removed lines', async ($, on) => {
  stubEngine(on)

  const output = { structuredPatch: [{ lines: ['+a', '+b', '-c'] }] }
  const ui = await $.ui.mount(toolUse(call('Edit', { file_path: '/work/a.ts' }, { output })))

  expect(await ui.find({ type: 'Text', text: '+2' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' −1' })).toBeDefined()
})

test('a failed call shows the error mark, a running one the running mark', async ($, on) => {
  stubEngine(on)

  const failed = await $.ui.mount(toolUse(call('Read', { file_path: '/work/a.ts' }, { isErrored: true })))
  expect(await failed.find({ type: 'Text', text: /✕─ Read/ })).toBeDefined()

  const running = await $.ui.mount(toolUse(call('Bash', { command: 'sleep 9' }, { tool_use_id: 'tu2', isRunning: true })))
  expect(await running.find({ type: 'Text', text: /○─ Bash/ })).toBeDefined()
})

test('tools a skin cannot redraw faithfully keep their own row', async ($, on) => {
  stubEngine(on)

  const ui = await $.ui.mount(toolUse(call('Task', { description: 'dig' })))

  expect(await ui.find({ type: 'Text', text: 'stock row' })).toBeDefined()
})

test('a folded group is one node, an expanded one keeps its rows', async ($, on) => {
  stubEngine(on)

  const calls = [call('Read', {}), call('Read', {}), call('Grep', { pattern: 'x' })]
  const group = (isExpanded: boolean) =>
    ({ ...SITE, surface: 'terminal', component: 'ToolGroup', requestId: 'g1', props: { calls, isActive: false, isExpanded } }) as const

  const folded = await $.ui.mount(group(false))
  expect(await folded.find({ type: 'Text', text: /Read 2 · Search 1/ })).toBeDefined()
  await folded.unmount()

  const expanded = await $.ui.mount(group(true))
  expect(await expanded.find({ type: 'Text', text: 'stock row' })).toBeDefined()
})

test('a typed prompt sits in an outline sized to its text, other senders keep their row', async ($, on) => {
  stubEngine(on)

  for (const surface of SURFACES) {
    const prompt = (kind: 'composer' | 'task-notification') =>
      ({ ...SITE, surface, component: 'UserMessage', requestId: 'm1', props: { text: 'fix the build', origin: { kind }, isExpanded: false } }) as const

    const typed = await $.ui.mount(prompt('composer'))
    const column = (await typed.find({ type: 'Box' })) as { props: { alignItems?: string }; children?: readonly { props?: { borderStyle?: string; borderColor?: string } }[] } | undefined
    // The outline hugs the text: its column does not stretch it to the full width.
    expect(column?.props.alignItems).toBe('flex-start')
    // k-mods: a bold border in the skin's own accent (noir's dark `user`), not a plain
    // round border in `muted`, so the prompt stands out among tool rows and replies.
    expect(column?.children?.[0]?.props?.borderStyle).toBe('bold')
    expect(column?.children?.[0]?.props?.borderColor).toBe('#f5f5f5')
    expect(await typed.find({ type: 'Text', text: '❯ ' })).toBeDefined()
    expect(await typed.find({ type: 'Text', text: 'fix the build' })).toBeDefined()
    await typed.unmount()

    const notice = await $.ui.mount(prompt('task-notification'))
    expect(await notice.find({ type: 'Text', text: 'stock row' })).toBeDefined()
    await notice.unmount()
  }
})

test('a reply with a table draws the table, a reply without one keeps its own drawing', async ($, on) => {
  stubEngine(on)

  const reply = (text: string) =>
    ({ ...SITE, surface: 'terminal', component: 'AssistantMessage', requestId: 'r1', props: { text, isFirstOfReply: true } }) as const

  const withTable = await $.ui.mount(reply('Limits:\n\n| Route | Limit |\n|---|--:|\n| /chat | 60 |\n| /up | 10 |'))
  expect(await withTable.find({ type: 'Markdown' })).toBeDefined()
  expect(await withTable.find({ type: 'Text', text: 'Route' })).toBeDefined()
  expect(await withTable.find({ type: 'Text', text: '10' })).toBeDefined()
  await withTable.unmount()

  const plain = await $.ui.mount(reply('No table | here, just a pipe.'))
  expect(await plain.find({ type: 'Text', text: 'stock row' })).toBeDefined()
})

test('the terminal spinner shimmers, the desktop one is an animated icon beside its step', async ($, on) => {
  stubEngine(on)

  const spinner = (surface: (typeof SURFACES)[number]) =>
    ({ ...SITE, surface, component: 'Spinner', requestId: 'main', props: { word: 'Sauteing', message: null, suffix: '…', mode: 'responding' } }) as const

  const terminal = await $.ui.mount(spinner('terminal'))
  expect(await terminal.find({ type: 'Text', text: /^⠋ .+…/ })).toBeDefined()
  await terminal.unmount()

  const desktop = await $.ui.mount(spinner('desktop'))
  const icon = (await desktop.find({ type: 'Svg' })) as { props: { source: string } } | undefined
  expect(icon?.props.source).toContain('class="bar')
  expect(await desktop.find({ type: 'Text', text: 'Sauteing' })).toBeDefined()
})

test('the turn footer names the time in the skin’s words', async ($, on) => {
  stubEngine(on)

  const ui = await $.ui.mount({
    ...SITE,
    surface: 'terminal',
    component: 'TurnDuration',
    requestId: 'f1',
    props: { word: 'Baked', durationMs: 64000 },
  })

  expect(await ui.find({ type: 'Text', text: /^◆ .+ in 1m 4s$/ })).toBeDefined()
})

test('the question dialog keeps Claude Code’s drawing under a band naming its topics', async ($, on) => {
  stubEngine(on)

  const ui = await $.ui.mount({
    ...SITE,
    surface: 'terminal',
    component: 'AskUserQuestion',
    requestId: 'q1',
    props: { tool: 'AskUserQuestion', questions: [{ header: 'Approach' }, { header: 'Store' }] },
  })

  expect(await ui.find({ type: 'Text', text: /Approach {2}· {2}Store/ })).toBeDefined()
})

test('the settings pane picks a skin, switches the rail and paints a slot', async ($, on) => {
  stubEngine(on)

  const pane = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await pane.press({ key: 'skin-dracula' })
  await pane.press({ key: 'toggle-rail' })
  await pane.unmount()

  const row = await $.ui.mount(toolUse(call('Bash', { command: 'ls' })))
  const found = await row.find({ type: 'Text', text: /Bash/ })
  expect(spanColor(found, 'Bash')).toBe('#f1fa8c')
  expect(await row.find({ type: 'Text', text: '┃' })).toBeUndefined()
  await row.unmount()

  const again = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await again.input({ key: 'hex', text: '#ff0000' })
  await again.unmount()

  expect((await runSkin($, 'list')).text).toContain('● my-dracula')
})

test('the agent’s design tool saves a skin and it applies at once', async ($, on) => {
  stubEngine(on)

  const out = await $.tool.call({
    tool: 'mcp__skins__design',
    action: 'save',
    name: 'sunset',
    base: 'gruvbox',
    palette: { run: '#ff8800' },
  })
  expect(out.deny).toBeUndefined()

  const row = await $.ui.mount(toolUse(call('Bash', { command: 'ls' })))
  expect(spanColor(await row.find({ type: 'Text', text: /Bash/ }), 'Bash')).toBe('#ff8800')

  const refused = await $.tool.call({ tool: 'mcp__skins__design', action: 'save', name: 'dracula' })
  expect(refused.deny).toContain('built-in')
})

test('/skin with no argument opens the settings pane', async ($, on) => {
  stubEngine(on)

  const answer = await runSkin($, '')

  expect(answer.text).toBeUndefined()
})

test('a table wider than its share spans the column instead of running off it', async ($, on) => {
  stubEngine(on)

  const wide = `| File | What changed |\n|---|---|\n| server.ts | ${'a long description '.repeat(6)} |`

  for (const surface of ['terminal'] as const) {
    const ui = await $.ui.mount({
      ...SITE,
      surface,
      component: 'AssistantMessage',
      requestId: 'r2',
      props: { text: wide, isFirstOfReply: true },
    })
    type Node = { props?: { width?: unknown; position?: unknown; top?: unknown }; children?: readonly Node[] }
    const reply = (await ui.find({ type: 'Box' })) as Node
    const frame = reply.children?.[0]
    // Copy sits on the frame's top border, laid over it at the right.
    const control = frame?.children?.at(-1)

    expect(frame?.props?.width).toBe('100%')
    expect(control?.props?.position).toBe('absolute')
    expect(control?.props?.top).toBe(-1)
    expect(await ui.find({ type: 'Text', text: /…$/ })).toBeDefined()
    await ui.unmount()
  }
})

test('the desktop draws a table as an animated vector card, with a tooltip on a cut cell', async ($, on) => {
  stubEngine(on)

  const text = `| Skin | Accent | Note |
|---|---|---|
| dracula | #bd93f9 | ${'a very long note '.repeat(30)} |
| x<y | +18 −3 | ok |`
  const ui = await $.ui.mount({
    ...SITE,
    surface: 'desktop',
    component: 'AssistantMessage',
    requestId: 'r3',
    props: { text, isFirstOfReply: true },
  })
  const svg = (await ui.find({ type: 'Svg' })) as { props: { source: string; isInteractive?: boolean; alt: string } } | undefined

  expect(svg?.props.isInteractive).toBeUndefined()
  expect(svg?.props.source).toContain('class="row"')
  expect(svg?.props.source).toContain('<circle')
  expect(svg?.props.source).toContain('x&lt;y')
  expect(svg?.props.alt).toContain('Skin | Accent | Note')
})

test('on the desktop an edit is a diff card and a shell command a terminal card', async ($, on) => {
  stubEngine(on)

  const result = (tool: string, output: unknown, isErrored = false) =>
    ({ ...SITE, surface: 'desktop', component: 'ToolResult', requestId: 'tr1', props: { tool_use_id: 'tr1', tool, output, isErrored } }) as const
  const sourceOf = async (ui: { find: (q: { type: string }) => Promise<unknown> }) =>
    ((await ui.find({ type: 'Svg' })) as { props: { source: string } } | undefined)?.props.source ?? ''

  const edit = await $.ui.mount(result('Edit', { filePath: '/work/src/a.ts', structuredPatch: [{ oldStart: 1, newStart: 1, lines: ['-a', '+b'] }] }))
  expect(await sourceOf(edit)).toContain('src/a.ts')
  await edit.unmount()

  const shell = await $.ui.mount(result('Bash', { stdout: 'built', stderr: '', interrupted: false }))
  expect(await sourceOf(shell)).toContain('built')
  await shell.unmount()

  const terminal = await $.ui.mount({ ...result('Bash', { stdout: 'built', stderr: '', interrupted: false }), surface: 'terminal' })
  expect(await terminal.find({ type: 'Text', text: 'stock row' })).toBeDefined()
})

test('a code fence is a card on the desktop and stays markdown in the terminal', async ($, on) => {
  stubEngine(on)

  const reply = (surface: (typeof SURFACES)[number]) =>
    ({ ...SITE, surface, component: 'AssistantMessage', requestId: 'c1', props: { text: 'Run:\n\n```ts\nconst a = 1\n```', isFirstOfReply: true } }) as const

  const desktop = await $.ui.mount(reply('desktop'))
  expect(((await desktop.find({ type: 'Svg' })) as { props: { source: string } } | undefined)?.props.source).toContain('const')
  await desktop.unmount()

  const terminal = await $.ui.mount(reply('terminal'))
  expect(await terminal.find({ type: 'Svg' })).toBeUndefined()
  expect(await terminal.find({ type: 'Markdown' })).toBeDefined()
})

const BAND = (surface: (typeof SURFACES)[number], isWorking: boolean) =>
  ({
    ...SITE,
    surface,
    component: 'AbovePrompt',
    requestId: 'band',
    props: { hasSurvey: false, isWorking, maxRows: 4, bodyColumns: 100, scroll: { offset: 0, bodyRows: 4 }, view: {} },
  }) as const

test('the band offers Compact, nudges at 70% context, and compacts on a press', async ($, on) => {
  let compacted = 0
  const toasts: string[] = []
  const clock = mock.clock(on, { now: 10_000 })
  on('store.get', () => ({ value: undefined }))
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.render', () => STOCK)
  on('command.run', ($, e) => {
    if (e.command === 'compact') {
      compacted += 1
    }

    return {}
  })
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000, percent: 85 }, rateLimits: [] } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('command.register', () => ({ value: { command: 'skin' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__skins__design' } }))

  await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

  const band = await $.ui.mount(BAND('desktop', false))
  expect(await band.find({ type: 'Text', text: 'Context is 85% full' })).toBeDefined()
  // A digit hotkey reaches it from an empty prompt where the terminal reports no clicks.
  expect(((await band.find({ key: 'compact' })) as { props: { hotkey?: string } } | undefined)?.props.hotkey).toBe('0')
  await band.press({ key: 'compact' })
  // It starts on a timer, outside the press, so the press ending cannot cancel it.
  expect(compacted).toBe(0)
  // Hidden until that run ends, so more presses cannot queue more runs.
  expect(await band.find({ key: 'compact' })).toBeUndefined()
  await clock.advance(1)
  expect(compacted).toBe(1)
  expect(await band.find({ key: 'compact' })).toBeDefined()
  expect(toasts).toEqual([])
  await band.unmount()

  const busy = await $.ui.mount(BAND('terminal', true))
  expect(await busy.find({ key: 'compact' })).toBeUndefined()
})

test('cards draw no background of their own', async ($, on) => {
  stubEngine(on)

  const ui = await $.ui.mount({
    ...SITE,
    surface: 'desktop',
    component: 'AssistantMessage',
    requestId: 'bg',
    props: { text: '| a | b |\n|---|---|\n| 1 | 2 |\n\n```ts\nconst x = 1\n```', isFirstOfReply: true },
  })
  const svg = (await ui.find({ type: 'Svg' })) as { props: { source: string } } | undefined

  expect(svg?.props.source).not.toContain('background:')
})

test('/skin gallery opens a pane with every element, numbered, on both surfaces', async ($, on) => {
  stubEngine(on)

  expect((await runSkin($, 'gallery')).text).toBeUndefined()

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, requestId: 'skins-gallery', surface })

    expect(await ui.find({ type: 'Text', text: /^1  Your prompt/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^11  Turn footer/ })).toBeDefined()
    await ui.unmount()
  }
})

test('on a light Claude Code theme the skin draws dark text for a light background', async ($, on) => {
  stubEngine(on)
  on('config.list', () => ({ value: [{ key: 'theme', label: 'Theme', kind: 'enum', value: 'light', provider: { kind: 'engine' }, isLocked: false }] as never }))
  on('session.start', () => ({ cwd: '/work' }))
  on('command.register', () => ({ value: { command: 'skin' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__skins__design' } }))

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const row = await $.ui.mount(toolUse(call('Bash', { command: 'ls' })))
  expect(spanColor(await row.find({ type: 'Text', text: /Bash/ }), 'Bash')).toBe('#111111')
})

test('code blocks, tables and shell output get a Copy button that copies their text', async ($, on) => {
  stubEngine(on)
  const copied: string[] = []
  on('ui.copy', ($, e) => {
    copied.push(e.text)
    return { value: { isCopied: true } }
  })

  const text = 'Run:\n\n```ts\nconst a = 1\n```\n\n| A | B |\n|---|---|\n| 1 | 2 |'

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...SITE, surface, component: 'AssistantMessage', requestId: `cp-${surface}`, props: { text, isFirstOfReply: true } })
    await ui.press({ key: 'copy-1' })
    await ui.press({ key: 'copy-2' })
    await ui.unmount()
  }

  const shell = await $.ui.mount({
    ...SITE,
    surface: 'desktop',
    component: 'ToolResult',
    requestId: 'cp-sh',
    props: { tool_use_id: 'cp-sh', tool: 'Bash', output: { stdout: 'built ok', stderr: '', interrupted: false }, isErrored: false },
  })
  await shell.press({ key: 'copy-output' })

  expect(copied).toEqual(['const a = 1', '| A | B |\n| --- | --- |\n| 1 | 2 |', 'const a = 1', '| A | B |\n| --- | --- |\n| 1 | 2 |', 'built ok'])
})

test('on the desktop the Copy button is laid over the card, in the corner the card leaves free', async ($, on) => {
  stubEngine(on)
  on('ui.copy', () => ({ value: { isCopied: true } }))

  const ui = await $.ui.mount({
    ...SITE,
    surface: 'desktop',
    component: 'AssistantMessage',
    requestId: 'ov',
    props: { text: '```ts\nconst a = 1\n```', isFirstOfReply: true },
  })
  type Node = { type?: string; props?: Record<string, unknown>; children?: readonly Node[] }
  const reply = (await ui.find({ type: 'Box' })) as Node
  const card = reply.children?.[0]
  const overlay = card?.children?.[1]

  expect(card?.props?.alignSelf).toBe('flex-start')
  expect(overlay?.props?.position).toBe('absolute')
  expect(overlay?.children?.[0]?.type).toBe('Button')
})

// ---- k-mods additions ------------------------------------------------------

test('a terminal code block is a bordered card with Copy inside it, not floating below', async ($, on) => {
  stubEngine(on)
  const copied: string[] = []
  on('ui.copy', ($, e) => {
    copied.push(e.text)
    return { value: { isCopied: true } }
  })

  const ui = await $.ui.mount({
    ...SITE,
    surface: 'terminal',
    component: 'AssistantMessage',
    requestId: 'cb1',
    props: { text: 'Run:\n\n```ts\nconst a = 1\n```', isFirstOfReply: true },
  })
  type Node = { type?: string; props?: Record<string, unknown>; children?: readonly Node[] }
  const reply = (await ui.find({ type: 'Box' })) as Node
  // children[0] is the 'Run:' text (a Markdown element); the code fence is segment 1.
  const card = reply.children?.[1] as Node | undefined

  expect(card?.props?.borderStyle).toBe('round')
  // Copy sits inside the card as a normal child, right-aligned, not position="absolute"
  // on the border: an overlay like the desktop card above uses does not draw in the
  // terminal, and dragging a selection across the border would pick up its │ characters.
  const copyRow = card?.children?.at(-1) as Node | undefined
  expect(copyRow?.props?.justifyContent).toBe('flex-end')
  expect(copyRow?.props?.position).toBeUndefined()
  // The code itself is still plain markdown (a Markdown element), not re-rendered text.
  expect(await ui.find({ type: 'Markdown', text: /const a = 1/ })).toBeDefined()

  // 'Run:' is segment 0, the code fence is segment 1, so its key is copy-1.
  await ui.press({ key: 'copy-1' })
  expect(copied).toEqual(['const a = 1'])
})

test('a table header reads in the skin’s accent, with no background band or zebra stripe', async ($, on) => {
  stubEngine(on)

  const reply = '| Name | Note |\n|---|---|\n| a | one |\n| b | two |'
  const ui = await $.ui.mount({ ...SITE, surface: 'terminal', component: 'AssistantMessage', requestId: 'th1', props: { text: reply, isFirstOfReply: true } })

  type Node = { props?: Record<string, unknown>; children?: readonly Node[] }
  const reply_ = (await ui.find({ type: 'Box' })) as Node
  const table = reply_.children?.[0] as Node | undefined
  const headerRow = table?.children?.[0] as Node | undefined
  const bodyRow2 = table?.children?.[2] as Node | undefined // the old zebra row

  expect(headerRow?.props?.backgroundColor).toBeUndefined()
  expect(bodyRow2?.props?.backgroundColor).toBeUndefined()

  const headerText = (await ui.find({ type: 'Text', text: 'Name' })) as Node | undefined
  // An exact match: `text` otherwise matches by inclusion, and 'a' is a substring of 'Name'.
  const bodyText = (await ui.find({ type: 'Text', text: /^a$/ })) as Node | undefined
  // noir (the default skin)'s dark palette: `user` for the header, `fg` for a body cell.
  expect(headerText?.props?.color).toBe('#f5f5f5')
  expect(headerText?.props?.bold).toBe(true)
  expect(bodyText?.props?.color).toBe('#ededed')
})

test('a finished Bash call draws its output as a card under the row in the terminal', async ($, on) => {
  stubEngine(on)

  const output = { stdout: 'built ok', stderr: '', interrupted: false }
  const done = await $.ui.mount(toolUse(call('Bash', { command: 'pnpm build' }, { output }), 'terminal'))
  expect(await done.find({ type: 'Text', text: 'built ok' })).toBeDefined()
  await done.unmount()

  // No card yet while the call is still running: there's no output to show.
  const running = await $.ui.mount(toolUse(call('Bash', { command: 'pnpm build' }, { tool_use_id: 'tu-run', isRunning: true, output }), 'terminal'))
  expect(await running.find({ type: 'Text', text: 'built ok' })).toBeUndefined()
  await running.unmount()

  // The desktop keeps its own Svg card, drawn separately by the ToolResult hook, so
  // ToolUse itself draws no text card there.
  const desktop = await $.ui.mount(toolUse(call('Bash', { command: 'pnpm build' }, { tool_use_id: 'tu-desk', output }), 'desktop'))
  expect(await desktop.find({ type: 'Text', text: 'built ok' })).toBeUndefined()
  await desktop.unmount()
})

// Shared setup for the status_lines tests below: a session.start that status-ko can be
// "enabled" for, by what $.settings.read answers.
function stubSessionStart(on: On, statusKoEnabled: boolean) {
  mock.clock(on, { now: 10_000 })
  on('store.get', () => ({ value: undefined }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000, percent: 10 }, rateLimits: [] } }))
  on('config.list', () => ({ value: [] as never }))
  on('settings.read', () => ({ value: { enabledPlugins: statusKoEnabled ? { 'status-ko@k-mods': true } : {} } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('command.register', () => ({ value: { command: 'skin' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__skins__design' } }))
  on('ui.render', () => STOCK)
}

const SPINNER = { ...SITE, surface: 'terminal', component: 'Spinner', requestId: 'main', props: { word: 'Sauteing', message: null, suffix: '…', mode: 'responding' } } as const
const FOOTER = { ...SITE, surface: 'terminal', component: 'TurnDuration', requestId: 'f1', props: { word: 'Baked', durationMs: 64000 } } as const

test('status_lines "engine" always leaves the spinner and the turn line to the engine', { options: { status_lines: 'engine' } }, async ($, on) => {
  stubEngine(on)

  const spinner = await $.ui.mount(SPINNER)
  expect(await spinner.find({ type: 'Text', text: 'stock row' })).toBeDefined()
  await spinner.unmount()

  const footer = await $.ui.mount(FOOTER)
  expect(await footer.find({ type: 'Text', text: 'stock row' })).toBeDefined()
})

test('status_lines "skins" keeps drawing them even once status-ko is enabled', { options: { status_lines: 'skins' } }, async ($, on) => {
  stubSessionStart(on, true)
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const spinner = await $.ui.mount(SPINNER)
  expect(await spinner.find({ type: 'Text', text: /^⠋ .+…/ })).toBeDefined()
})

test('status_lines defaults to "auto", which hands the spinner and the turn line to status-ko once it’s enabled', async ($, on) => {
  stubSessionStart(on, true)
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const spinner = await $.ui.mount(SPINNER)
  expect(await spinner.find({ type: 'Text', text: 'stock row' })).toBeDefined()
  await spinner.unmount()

  const footer = await $.ui.mount(FOOTER)
  expect(await footer.find({ type: 'Text', text: 'stock row' })).toBeDefined()
})
