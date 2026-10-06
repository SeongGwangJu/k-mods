import type { Engine } from 'claude-code/testing'
import { describe, expect, test } from 'claude-code/testing'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => unknown

function makeStoreStubs(on: (event: string, handler: AnyFn) => void, initial: Record<string, unknown> = {}) {
  const store = new Map<string, unknown>(Object.entries(initial))
  const setCalls: Array<{ key: string; value: unknown }> = []

  on('store.get', (_: unknown, e: { key: string }) => ({ value: store.get(e.key) }))
  on('store.set', (_: unknown, e: { key: string; value: unknown }) => {
    store.set(e.key, e.value)
    setCalls.push(e)
    return { value: undefined }
  })

  return { store, setCalls }
}

function makeUiStubs(on: (event: string, handler: AnyFn) => void) {
  const toasts: string[] = []
  const invalidateCalls: unknown[] = []

  // 내 훅이 session.start를 next(e)로 넘기므로, 그 뒤를 답해 줄 스텁이 있어야 한다.
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: undefined }))
  on('ui.toast', (_: unknown, e: { text: string }) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.invalidate', () => ({ value: undefined }))

  return { toasts, invalidateCalls }
}

async function startSession($: Engine): Promise<void> {
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
}

// 테스트의 $.command.run은 실제 이벤트를 그대로 흉내 내므로(엔진 자리),
// 평소엔 엔진이 채워 주는 origin/presentation도 직접 넣어야 한다.
async function runStreamerCommand($: Engine, args: string): Promise<{ text?: string }> {
  return $.command.run({
    command: 'streamer',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })
}

describe('/streamer 명령', () => {
  test('설치 기본값(start_on=true)이면 처음엔 켜져 있다', async ($, on) => {
    makeStoreStubs(on)
    const { toasts } = makeUiStubs(on)
    await startSession($)

    const result = await runStreamerCommand($, 'status')
    expect(result.text).toContain('켜짐')
    expect(toasts).toEqual([]) // status는 토스트를 띄우지 않는다
  })

  test('인자 없이 쓰면 켜고 끄기를 토글한다', async ($, on) => {
    const { setCalls } = makeStoreStubs(on)
    const { toasts } = makeUiStubs(on)
    await startSession($)

    await runStreamerCommand($, '')

    expect(toasts).toEqual(['스트리머 모드 껐어요'])
    expect(setCalls).toEqual([{ key: 'isOn', value: false }])
  })

  test('꺼진 상태에서 /streamer off 를 또 쓰면 "이미 꺼져 있어요" 안내만 한다', async ($, on) => {
    const { setCalls } = makeStoreStubs(on)
    const { toasts } = makeUiStubs(on)
    await startSession($)

    await runStreamerCommand($, 'off')
    toasts.length = 0
    setCalls.length = 0

    await runStreamerCommand($, 'off')
    expect(toasts).toEqual(['이미 꺼져 있어요'])
    expect(setCalls).toEqual([])
  })

  test('/streamer on 으로 다시 켤 수 있다', async ($, on) => {
    const { setCalls } = makeStoreStubs(on)
    const { toasts } = makeUiStubs(on)
    await startSession($)

    await runStreamerCommand($, 'off')
    await runStreamerCommand($, 'on')

    expect(toasts.at(-1)).toBe('스트리머 모드 켰어요')
    expect(setCalls.at(-1)).toEqual({ key: 'isOn', value: true })
  })

  test('알 수 없는 인자는 사용법을 안내하고 상태를 바꾸지 않는다', async ($, on) => {
    const { setCalls } = makeStoreStubs(on)
    makeUiStubs(on)
    await startSession($)

    const result = await runStreamerCommand($, '이상한값')
    expect(result.text).toContain('사용법')
    expect(setCalls).toEqual([])
  })

  test('이전 세션에서 꺼 뒀으면 새 세션도 꺼진 채로 시작한다', async ($, on) => {
    makeStoreStubs(on, { isOn: false })
    const { toasts } = makeUiStubs(on)
    await startSession($)

    const result = await runStreamerCommand($, 'status')
    expect(result.text).toContain('꺼짐')
    expect(toasts).toEqual([])
  })
})
