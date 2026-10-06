import { expect, test } from 'claude-code/testing'

// Claude Code가 Pane에 넘기는 값(app 빼고 전부), render-sites 표 그대로.
const PANE_PROPS = {
  title: '메모',
  isFocused: true,
  bodyColumns: 60,
  placement: 'inline' as const,
  scroll: { offset: 0, bodyRows: 10 },
  view: {},
}

test('session.start registers /m and loads existing notes from the store', async ($, on) => {
  const getCalls: string[] = []
  on('command.register', () => ({ value: { command: 'm' } }))
  on('store.get', ($, e) => {
    getCalls.push(e.key)
    return { value: ['기존 메모'] }
  })
  on('session.cwd', () => ({ value: '/work' }))
  on('session.start', () => ({ cwd: '/work' }))

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  expect(getCalls).toEqual(['notes:/work'])

  const ui = await $.ui.mount({ plugin: 'memo-pad', surface: 'terminal', component: 'Pane', requestId: 'memo-pad', props: PANE_PROPS })
  expect(await ui.find({ type: 'Text', text: /기존 메모/ })).toBeDefined()
})

test('add: typing into the Input and pressing Enter saves the note', async ($, on) => {
  const saved: unknown[] = []
  on('command.register', () => ({ value: { command: 'm' } }))
  on('store.get', () => ({ value: [] }))
  on('session.cwd', () => ({ value: '/work' }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.set', ($, e) => {
    saved.push(e.value)
    return { value: undefined }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'memo-pad', surface, component: 'Pane', requestId: 'memo-pad', props: PANE_PROPS })
    await ui.input({ key: 'new', text: `다음에 할 일 (${surface})` })
    expect(await ui.find({ type: 'Text', text: new RegExp(`다음에 할 일 \\(${surface}\\)`) })).toBeDefined()
    await ui.unmount()
  }
  expect(saved.at(-1)).toEqual(['다음에 할 일 (terminal)', '다음에 할 일 (desktop)'])
})

test('fill: [넣기] fills the prompt, removes the note, and closes the pane', async ($, on) => {
  const filled: Array<{ text: string; mode: string }> = []
  const closed: string[] = []
  on('command.register', () => ({ value: { command: 'm' } }))
  on('store.get', () => ({ value: ['버그 고치기', '테스트 돌리기'] }))
  on('session.cwd', () => ({ value: '/work' }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.set', () => ({ value: undefined }))
  on('prompt.fill', ($, e) => {
    filled.push({ text: e.text, mode: e.mode })
    return { isFilled: true }
  })
  on('ui.close', ($, e) => {
    closed.push(e.id)
    return { value: undefined }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const ui = await $.ui.mount({ plugin: 'memo-pad', surface: 'terminal', component: 'Pane', requestId: 'memo-pad', props: PANE_PROPS })
  await ui.press({ key: 'use-0' })

  expect(filled).toEqual([{ text: '버그 고치기', mode: 'replace' }])
  expect(closed).toEqual(['memo-pad'])
  expect(await ui.find({ type: 'Text', text: '버그 고치기' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /테스트 돌리기/ })).toBeDefined()
})

test('delete: [x] removes the note without touching prompt.fill', async ($, on) => {
  const filled: unknown[] = []
  on('command.register', () => ({ value: { command: 'm' } }))
  on('store.get', () => ({ value: ['버그 고치기', '테스트 돌리기'] }))
  on('session.cwd', () => ({ value: '/work' }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.set', () => ({ value: undefined }))
  on('prompt.fill', ($, e) => {
    filled.push(e)
    return { isFilled: true }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const ui = await $.ui.mount({ plugin: 'memo-pad', surface: 'terminal', component: 'Pane', requestId: 'memo-pad', props: PANE_PROPS })
  await ui.press({ key: 'del-1' })

  expect(filled).toEqual([])
  expect(await ui.find({ type: 'Text', text: /테스트 돌리기/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /버그 고치기/ })).toBeDefined()
})

test('hint tail: shown with notes while the pane is closed, absent otherwise', async ($, on) => {
  on('command.register', () => ({ value: { command: 'm' } }))
  on('store.get', () => ({ value: ['버그 고치기'] }))
  on('session.cwd', () => ({ value: '/work' }))
  on('session.start', () => ({ cwd: '/work' }))
  // next(e)로 넘긴 ui.render를 흉내낸다: 실제로는 엔진이 tail을 줄 끝에 이어 그린다는 문서 설명대로,
  // 여기서는 그 결과를 눈으로 검증할 수 있게 tail(or 원래 hint)을 그대로 돌려주는 stub을 쓴다.
  on('ui.render', ($, e) => {
    const text = e.component === 'PromptHint' ? (e.props.tail ?? e.props.hint) : ''
    return { type: 'Text', props: {}, children: [String(text ?? '')] }
  })
  on('ui.open', () => ({ value: { isPlaced: true } }))

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const closedHint = await $.ui.mount({
    plugin: 'memo-pad',
    surface: 'terminal',
    component: 'PromptHint',
    requestId: 'hint',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  })
  expect(await closedHint.find({ type: 'Text', text: '✎ 메모 1 (/m)' })).toBeDefined()

  await $.command.run({ command: 'm', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })
  const openHint = await $.ui.mount({
    plugin: 'memo-pad',
    surface: 'terminal',
    component: 'PromptHint',
    requestId: 'hint-open',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  })
  expect(await openHint.find({ type: 'Text', text: '? for shortcuts' })).toBeDefined()
})
