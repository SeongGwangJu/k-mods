// The hold flow, tested as its separate, pure-ish pieces rather than one end-to-end
// press through a live $.tool.call hold: mounting this plugin's own Pane while its
// tool.call hook is concurrently polling $.process.run in a `while` loop resolves only
// after that loop's many stubbed calls settle (seconds, and timing-sensitive with it),
// which is far too slow and flaky for a unit test; and an inline test plugin's register()
// is self-contained (it closes over nothing in this file, so it can't share a `state`
// object or call this file's imported `draw` either). Each piece below is deterministic:
//
// - draw() itself, called directly as a plain function against hand-built Box/Text/Button
//   factories that just record their props as plain data (the same shape $.ui.resolve
//   would hand a real hook) — so its rendering and its buttons' onPress wiring (does
//   Proceed set decision to "proceed") are checked with no $, no mount, no hold.
// - denyText(), the text for every decision but "proceed", as a pure function.
// - handleToolCallFailure(), the .catch handler, with a fake `next` carrying `.called`.
// - the real tool.call hook, for the one path that needs no hold at all: a command
//   classify() doesn't flag runs straight through to next().
import { expect, test } from 'claude-code/testing'

import { denyText, draw, handleToolCallFailure } from '../hooks/register.mjs'

type Node = { type: string; props: Record<string, unknown>; children: Leaf[] }
type Leaf = Node | string | number | null | undefined

// Box/Text/Button as draw() calls them: one props object, `children` among its keys,
// a string, a single element, an array of either, or nested arrays of those (map()
// results). Records exactly what was passed, as plain data, like a real element.
function element(type: string) {
  return (props: Record<string, unknown>): Node => {
    const { children, ...rest } = props
    const kids = (Array.isArray(children) ? children : [children]) as Leaf[]

    return { type, props: rest, children: kids.flat(4) }
  }
}

const t = { Box: element('Box'), Text: element('Text'), Button: element('Button') } as never

const isNode = (leaf: Leaf): leaf is Node => typeof leaf === 'object' && leaf !== null

function flatten(leaf: Leaf, out: Node[] = []): Node[] {
  if (!isNode(leaf)) {
    return out
  }

  out.push(leaf)
  for (const child of leaf.children) {
    flatten(child, out)
  }

  return out
}

const byKey = (tree: Node, key: string): Node | undefined => flatten(tree).find(n => n.props.key === key)

// A node's own text: its string/number leaves, joined (an element's children can mix
// nested Text elements and plain strings, as `sum`'s and `title`'s do above).
const ownText = (node: Node): string =>
  node.children.map(child => (isNode(child) ? ownText(child) : child === undefined || child === null ? '' : String(child))).join('')

const hasText = (tree: Node, pattern: string | RegExp): boolean =>
  flatten(tree).some(n => {
    const text = ownText(n)

    return typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text)
  })

type Risk = { kind: string; label: string }
type Report = { summary: string; lines: string[]; note?: string; more?: number }
type Held = { command: string; risk: Risk; report: Report; decision: string | null; where: 'pane' | 'band' }

const THEME_COLORS = { title: 'warning', summary: 'error' }
const GRAY_COLORS = { title: '#7c4a03', summary: '#9f1239' }

const stateOf = (over: Partial<Held> = {}): Held => ({
  command: 'rm -rf dummy.txt',
  risk: { kind: 'rm', label: 'rm -rf' },
  report: { summary: '파일 1개 삭제 (약 7 B)', lines: ['dummy.txt'], note: '경로: dummy.txt' },
  decision: null,
  where: 'pane',
  ...over,
})

test('the pane names the risk, the command and what it would do, with Proceed and Cancel buttons', async () => {
  const state = stateOf()
  const tree = draw(t, state, THEME_COLORS) as Node

  expect(hasText(tree, '⚠ 위험 명령 확인 · rm -rf')).toBe(true)
  expect(hasText(tree, '파일 1개 삭제 (약 7 B)')).toBe(true)
  expect(hasText(tree, 'rm -rf dummy.txt')).toBe(true)
  expect(hasText(tree, 'dummy.txt')).toBe(true)

  const proceed = byKey(tree, 'proceed')
  const cancel = byKey(tree, 'cancel')
  expect(proceed?.props.label).toBe('실행')
  expect(proceed?.props.hotkey).toBe('1')
  expect(cancel?.props.label).toBe('취소')
  expect(cancel?.props.hotkey).toBe('2')
  expect(cancel?.props.autoFocus).toBe(true) // Enter, with no other key pressed, cancels
  // Theme colours (the default), not the fixed hex "gray" reproduces.
  expect(tree.props.borderColor).toBe('warning')
})

test('pressing Proceed (calling its onPress) sets the decision once; a second press changes nothing', async () => {
  const state = stateOf()
  const tree = draw(t, state, THEME_COLORS) as Node

  const press = byKey(tree, 'proceed')?.props.onPress as () => void
  press()
  expect(state.decision).toBe('proceed')

  const cancelPress = byKey(tree, 'cancel')?.props.onPress as () => void
  cancelPress() // the hold already answered; a later press is ignored
  expect(state.decision).toBe('proceed')
})

test('pressing Cancel sets the decision to cancel', async () => {
  const state = stateOf()
  const tree = draw(t, state, THEME_COLORS) as Node

  const press = byKey(tree, 'cancel')?.props.onPress as () => void
  press()
  expect(state.decision).toBe('cancel')
})

test('a home path is shortened to ~, so the command and note read clean and a little more private', async () => {
  const state = stateOf({
    command: 'rm -rf /Users/sgj/work/build',
    report: { summary: '파일 3개 삭제 (약 1.2 KB)', lines: [], note: '경로: /Users/sgj/work/build' },
  })
  const tree = draw(t, state, THEME_COLORS) as Node

  expect(hasText(tree, 'rm -rf ~/work/build')).toBe(true)
  expect(hasText(tree, '경로: ~/work/build')).toBe(true)
  expect(hasText(tree, '/Users/sgj')).toBe(false)
})

test('the band caps its file list to 3 and counts the rest; the pane (tested above) shows up to 10', async () => {
  const state = stateOf({
    where: 'band',
    report: { summary: '파일 5개 삭제', lines: Array.from({ length: 5 }, (_, i) => `file-${i}.txt`) },
  })
  const tree = draw(t, state, THEME_COLORS) as Node

  expect(hasText(tree, 'file-0.txt')).toBe(true)
  expect(hasText(tree, 'file-2.txt')).toBe(true)
  expect(hasText(tree, 'file-3.txt')).toBe(false)
  expect(hasText(tree, '외 2개')).toBe(true)
})

test('the "gray" palette uses the fixed hex this mod was first tuned with, not the theme keys', async () => {
  const tree = draw(t, stateOf(), GRAY_COLORS) as Node

  expect(tree.props.borderColor).toBe('#7c4a03')
  expect(hasText(tree, '⚠ 위험 명령 확인')).toBe(true)
})

test('denyText names why for cancel, timeout, interrupted and error, and what would have run', async () => {
  expect(denyText('cancel', '파일 1개 삭제')).toContain('사용자가 취소를 눌렀습니다')
  expect(denyText('timeout', '파일 1개 삭제')).toContain('10분 안에 응답이 없었습니다')
  expect(denyText('interrupted', '파일 1개 삭제')).toContain('턴이 중단됐습니다')
  expect(denyText('error', '파일 1개 삭제')).toContain('확인 중 오류를 만났습니다')
  expect(denyText('cancel', '파일 1개 삭제')).toContain('실행했다면: 파일 1개 삭제')
  expect(denyText('unknown', 'x')).toContain('응답이 기록되지 않았습니다')
})

test('the .catch handler: once next() was reached it retries next(), otherwise it fails closed', async () => {
  // next.called === true: the main hook already reached `return next(e)` (proceed, or a
  // non-risky pass-through) and that call itself failed. Retry it instead of denying a
  // command that may already be running.
  let retries = 0
  const afterNext = Object.assign(
    async () => {
      retries += 1

      return { result: 'ok (retry)' }
    },
    { called: true },
  )

  expect(await handleToolCallFailure(undefined as never, undefined as never, afterNext as never)).toEqual({ result: 'ok (retry)' })
  expect(retries).toBe(1)

  // next.called === false: the failure happened before next() was ever reached
  // (classifying, queueing, measuring, or waiting for a press). Fail closed.
  const beforeNext = Object.assign(
    () => {
      throw new Error('must not be called')
    },
    { called: false },
  )

  const result = await handleToolCallFailure(undefined as never, undefined as never, beforeNext as never)
  expect(result.deny).toContain('실행하지 않았습니다')
  expect(result.deny).toContain('사용자에게 확인을 요청하세요')
})

test('a non-risky command is never held: next() runs straight away', async ($, on) => {
  on('tool.call', () => ({ result: 'ok' }))

  expect(await $.tool.call({ tool: 'Bash', command: 'git status' })).toEqual({ result: 'ok' })
})
