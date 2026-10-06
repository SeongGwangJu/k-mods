import { expect, mock, test } from 'claude-code/testing'

// Spinner는 terminal·desktop 모두에서 그려지고, TurnDuration은 terminal에서만 그려진다
// (RenderPropsOf의 문서 주석 기준). 그래서 Spinner 테스트는 두 surface를 다 돌고
// TurnDuration 테스트는 terminal만 돈다.

test('Spinner: thinking mode becomes 생각 중 on both surfaces', async ($, on) => {
  on('ui.render', ($, e) => ({ type: 'Text', props: {}, children: [String((e.props as { word?: string }).word ?? '')] }))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'status-ko',
      surface,
      component: 'Spinner',
      requestId: 'main',
      props: { word: 'Thinking', message: null, suffix: '…', mode: 'thinking' },
    })
    expect(await ui.find({ type: 'Text', text: /생각 중/ })).toBeDefined()
    await ui.unmount()
  }
})

test('Spinner: tool-use mode shows the Korean tool label and target', async ($, on) => {
  on('ui.render', ($, e) => ({ type: 'Text', props: {}, children: [String((e.props as { word?: string }).word ?? '')] }))
  // 영원히 끝나지 않는 stub: 도구가 "진행 중"인 상태를 고정해 둔다
  on('tool.call', () => new Promise(() => {}))

  // await 하지 않는다 — 훅의 동기 부분(running.push)까지만 실행되면 충분하다
  void $.tool.call({ tool: 'Read', tool_use_id: 't1', file_path: '/a/b/page.tsx' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'status-ko',
      surface,
      component: 'Spinner',
      requestId: 'main',
      props: { word: 'Thinking', message: null, suffix: '…', mode: 'tool-use' },
    })
    expect(await ui.find({ type: 'Text', text: /읽는 중 · page\.tsx/ })).toBeDefined()
    await ui.unmount()
  }
})

test('Spinner: an engine status message is left untouched', async ($, on) => {
  on('ui.render', ($, e) => ({ type: 'Text', props: {}, children: [String((e.props as { message?: string }).message ?? '')] }))

  const ui = await $.ui.mount({
    plugin: 'status-ko',
    surface: 'terminal',
    component: 'Spinner',
    requestId: 'main',
    props: { word: 'Thinking', message: '압축 중', suffix: '', mode: 'thinking' },
  })
  expect(await ui.find({ type: 'Text', text: '압축 중' })).toBeDefined()
})

test('TurnDuration: answer with a recorded summary shows model, tools, cache, clock', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 0, 1, 14, 59) })
  on('turn.complete', () => ({ text: '' }))

  await $.turn.complete({
    turnId: 't1',
    answer: 'hi',
    durationMs: 5000,
    isAborted: false,
    reason: 'answer',
    usage: { input_tokens: 30, output_tokens: 50, cache_read_input_tokens: 970, cache_creation_input_tokens: 0, model: 'claude-opus-5-5' },
  })
  await clock.settle()

  const ui = await $.ui.mount({
    plugin: 'status-ko',
    surface: 'terminal',
    component: 'TurnDuration',
    requestId: 'm1',
    props: { word: 'Brewed', durationMs: 5000 },
  })
  expect(await ui.find({ type: 'Text', text: /Opus 5\.5/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /도구 0/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /캐시 97%/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /\d{2}:\d{2}/ })).toBeDefined()
})

test('TurnDuration: aborted reason', async ($, on) => {
  const clock = mock.clock(on)
  on('turn.complete', () => ({ text: '' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))

  await $.turn.complete({ turnId: 't2', answer: '', durationMs: 7000, isAborted: true, reason: 'aborted' })
  await clock.settle()

  const ui = await $.ui.mount({
    plugin: 'status-ko',
    surface: 'terminal',
    component: 'TurnDuration',
    requestId: 'm2',
    props: { word: 'Brewed', durationMs: 7000 },
  })
  expect(await ui.find({ type: 'Text', text: /중단/ })).toBeDefined()
})

test('TurnDuration: error reason', async ($, on) => {
  const clock = mock.clock(on)
  on('turn.complete', () => ({ text: '' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))

  await $.turn.complete({ turnId: 't3', answer: '', durationMs: 1200, isAborted: false, reason: 'error' })
  await clock.settle()

  const ui = await $.ui.mount({
    plugin: 'status-ko',
    surface: 'terminal',
    component: 'TurnDuration',
    requestId: 'm3',
    props: { word: 'Brewed', durationMs: 1200 },
  })
  expect(await ui.find({ type: 'Text', text: /오류/ })).toBeDefined()
})

test('TurnDuration: refusal reason', async ($, on) => {
  const clock = mock.clock(on)
  on('turn.complete', () => ({ text: '' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))

  await $.turn.complete({
    turnId: 't4',
    answer: '',
    durationMs: 800,
    isAborted: false,
    reason: 'refusal',
    refusal: { category: null, explanation: null },
  })
  await clock.settle()

  const ui = await $.ui.mount({
    plugin: 'status-ko',
    surface: 'terminal',
    component: 'TurnDuration',
    requestId: 'm4',
    props: { word: 'Brewed', durationMs: 800 },
  })
  expect(await ui.find({ type: 'Text', text: /거절/ })).toBeDefined()
})

test('TurnDuration: no recorded summary falls back to a plain 완료 line', async ($, on) => {
  const ui = await $.ui.mount({
    plugin: 'status-ko',
    surface: 'terminal',
    component: 'TurnDuration',
    requestId: 'm5',
    props: { word: 'Brewed', durationMs: 42000 },
  })
  expect(await ui.find({ type: 'Text', text: /완료/ })).toBeDefined()
})
