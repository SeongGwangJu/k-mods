// session.start(환영 토스트, /k-mods 등록)과 /k-mods 명령의 열기/닫기 토글을 검증한다.

import { expect, test } from 'claude-code/testing'

test('처음 세션에서만 환영 토스트를 보여준다', async ($, on) => {
  const store = new Map<string, unknown>()
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', ($, e) => ({ value: store.get(e.key) }))
  on('store.set', ($, e) => {
    store.set(e.key, e.value)
    return { value: undefined }
  })
  const toasts: string[] = []
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  expect(toasts).toEqual(['k-mods 설치 완료 · /k-mods 로 모드를 둘러보세요'])
  expect(store.get('welcomed')).toBe(true)
})

test('이미 환영했으면 토스트를 다시 보여주지 않는다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  const toasts: string[] = []
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  expect(toasts).toEqual([])
})

test('/k-mods를 immediate: true로 등록한다', async ($, on) => {
  const registered: { name: string; immediate?: true }[] = []
  on('command.register', ($, e) => {
    registered.push(e)
    return { value: { command: e.name } }
  })
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  expect(registered.length).toBe(1)
  expect(registered[0]!.name).toBe('k-mods')
  expect(registered[0]!.immediate).toBe(true)
})

test('/k-mods는 패널을 열고, 다시 실행하면 닫는다 (Esc와 같은 닫기 경로)', async ($, on) => {
  let isOpen = false
  const opens: { id: string; focus?: true; closeOnEscape?: true }[] = []
  let closeCount = 0

  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('settings.read', () => ({ value: {} }))
  on('ui.panes', () =>
    isOpen
      ? { value: [{ id: 'k-mods-store', title: 'k-mods 모드 상점', isShown: true, isFocused: true, isPlaced: true }] }
      : { value: [] },
  )
  on('ui.open', ($, e) => {
    opens.push(e)
    isOpen = true
    return { value: { isPlaced: true } }
  })
  on('ui.close', () => {
    closeCount += 1
    isOpen = false
    return { value: undefined }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

  const runOrigin = { kind: 'composer' as const }
  const runPresentation = { isFullscreen: true, columns: 100 }

  const opened = await $.command.run({ command: 'k-mods', args: '', origin: runOrigin, presentation: runPresentation })
  expect(opened).toEqual({})
  expect(opens.length).toBe(1)
  expect(opens[0]!.focus).toBe(true)
  expect(opens[0]!.closeOnEscape).toBe(true)
  expect(isOpen).toBe(true)

  const closed = await $.command.run({ command: 'k-mods', args: '', origin: runOrigin, presentation: runPresentation })
  expect(closed).toEqual({})
  expect(closeCount).toBe(1)
  expect(isOpen).toBe(false)
})
