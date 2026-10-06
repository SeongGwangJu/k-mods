// 설치·제거 흐름: $.process.run으로 넘어가는 argv, claude 버전 확인, 실패 시
// 배너와 복사 버튼, settings.read로부터의 설치 상태를 확인한다.
// 특정 seed 항목 이름에 기대지 않도록, 카탈로그에서 자기 자신을 뺀 첫 항목을
// 실행 시점에 골라 쓴다.

import { expect, test } from 'claude-code/testing'

import { CATALOG, SELF_NAME } from '../hooks/catalog'

const TARGET = CATALOG.find(item => item.name !== SELF_NAME)!.name
const TARGET_SPEC = `${TARGET}@k-mods`

// $.process.run 스텁이 돌려줄 전체 모양(ProcessRunResult)을 한 곳에서 만든다.
function proc(exitCode: number, stdout: string, stderr: string) {
  return { exitCode, stdout, stderr, isStdoutTruncated: false, isStderrTruncated: false }
}

// 테스트에서 $.command.run('/k-mods')을 직접 쏠 때 채워야 하는 나머지 필드.
const RUN_FROM_COMPOSER = {
  origin: { kind: 'composer' } as const,
  presentation: { isFullscreen: true, columns: 100 },
}

const PANE = {
  plugin: 'mod-store',
  component: 'Pane',
  requestId: 'k-mods-store',
  viewport: { columns: 100, rows: 40 },
  props: {
    title: 'k-mods 모드 상점',
    isFocused: true,
    bodyColumns: 100,
    placement: 'inline',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

test('설치 버튼은 claude plugin install ...--scope user를 실행한다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  const toasts: string[] = []
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })

  const runs: string[][] = []
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    if (e.argv.includes('--version')) return { value: proc(0, '2.1.291', '') }
    return { value: proc(0, `Successfully installed plugin: ${TARGET_SPEC} (scope: user)`, '') }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` })

  expect(runs).toContainEqual(['claude', 'plugin', 'install', TARGET_SPEC, '--scope', 'user'])
  expect(toasts).toContain('설치했어요')
  expect(await ui.find({ key: 'apply-reload' })).toBeDefined()

  await ui.unmount()
})

test('"지금 적용"은 /reload-plugins를 실행한다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('process.run', ($, e) => {
    if (e.argv.includes('--version')) return { value: proc(0, '2.1.291', '') }
    return { value: proc(0, `Successfully installed plugin: ${TARGET_SPEC} (scope: user)`, '') }
  })
  const commandRuns: string[] = []
  on('command.run', ($, e) => {
    commandRuns.push(e.command)
    return { text: '' }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` })
  await ui.press({ key: 'apply-reload' })

  expect(commandRuns).toContain('reload-plugins')
  expect(await ui.find({ key: 'apply-reload' })).toBeUndefined()

  await ui.unmount()
})

test('claude 버전이 너무 오래되면 설치 명령을 실행하지 않고 오류 배너를 보여준다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  const runs: string[][] = []
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    return { value: proc(0, '2.0.1', '') }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` })

  expect(runs.length).toBe(1) // --version만 불렀고 install은 안 불렀다
  expect(await ui.find({ key: 'banner-copy' })).toBeDefined()
  expect(await ui.find({ key: 'banner-dismiss' })).toBeDefined()

  await ui.unmount()
})

test('마켓플레이스가 없으면 추가 안내 배너를 보여준다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('process.run', ($, e) => {
    if (e.argv.includes('--version')) return { value: proc(0, '2.1.291', '') }
    return { value: proc(1, '', 'Marketplace "k-mods" not found') }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` })

  expect(await ui.find({ type: 'Text', text: /plugin marketplace add SeongGwangJu\/k-mods/ })).toBeDefined()
  expect(await ui.find({ key: 'banner-copy' })).toBeDefined()

  await ui.unmount()
})

test('설치 상태는 settings.read의 enabledPlugins를 따라간다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('settings.read', () => ({ value: { enabledPlugins: { [TARGET_SPEC]: true } } }))

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  // /k-mods를 한 번 실행해야 refreshInstalled()가 settings.read를 불러 installed를 채운다
  await $.command.run({ command: 'k-mods', args: '', ...RUN_FROM_COMPOSER })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ key: `install-${TARGET}` })).toMatchObject({ props: { label: '설치됨 · 제거' } })

  await ui.unmount()
})

test('제거 확인에서 취소하면 명령을 실행하지 않는다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('settings.read', () => ({ value: { enabledPlugins: { [TARGET_SPEC]: true } } }))
  const runs: string[][] = []
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    return { value: proc(0, '2.1.291', '') }
  })
  on('tool.call', ($, e) => {
    if (e.tool !== 'AskUserQuestion') return { result: 'ok' }
    return { result: { answers: { [e.questions[0]!.question]: '취소' } } }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  await $.command.run({ command: 'k-mods', args: '', ...RUN_FROM_COMPOSER })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` }) // 이미 설치됨 → 제거를 묻고, 취소를 고른다

  expect(runs.some(argv => argv.includes('uninstall'))).toBe(false)
  expect(await ui.find({ key: `install-${TARGET}` })).toMatchObject({ props: { label: '설치됨 · 제거' } })

  await ui.unmount()
})

test('제거를 확인하면 claude plugin uninstall ...--scope user를 실행한다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  const toasts: string[] = []
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('settings.read', () => ({ value: { enabledPlugins: { [TARGET_SPEC]: true } } }))
  const runs: string[][] = []
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    if (e.argv.includes('--version')) return { value: proc(0, '2.1.291', '') }
    return { value: proc(0, `Successfully uninstalled plugin: ${TARGET} (scope: user)`, '') }
  })
  on('tool.call', ($, e) => {
    if (e.tool !== 'AskUserQuestion') return { result: 'ok' }
    return { result: { answers: { [e.questions[0]!.question]: '제거' } } }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  await $.command.run({ command: 'k-mods', args: '', ...RUN_FROM_COMPOSER })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` })

  expect(runs).toContainEqual(['claude', 'plugin', 'uninstall', TARGET_SPEC, '--scope', 'user'])
  expect(toasts).toContain('제거했어요')
  expect(await ui.find({ key: `install-${TARGET}` })).toMatchObject({ props: { label: '설치' } })

  await ui.unmount()
})

test('복사 버튼은 $.ui.copy를 호출한다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('process.run', ($, e) => {
    if (e.argv.includes('--version')) return { value: proc(0, '2.1.291', '') }
    return { value: proc(1, '', 'boom') }
  })
  const copies: { text: string }[] = []
  on('ui.copy', ($, e) => {
    copies.push({ text: e.text })
    return { value: { isCopied: true } }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `install-${TARGET}` }) // 실패시켜서 오류 배너 + 복사 버튼을 띄운다
  await ui.press({ key: 'banner-copy' })

  expect(copies).toContainEqual({ text: `claude plugin install ${TARGET_SPEC} --scope user` })

  await ui.unmount()
})
