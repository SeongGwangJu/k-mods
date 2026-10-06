import { expect, test } from 'claude-code/testing'

import { barSegments, deltaText, legendChips, pctText, percentSeverity, widthTier } from '../hooks/bar'

test('widthTier: boundaries at 70 and 100 (CONTRIBUTING.md 화면 원칙)', () => {
  expect(widthTier(69)).toBe('narrow')
  expect(widthTier(70)).toBe('medium')
  expect(widthTier(99)).toBe('medium')
  expect(widthTier(100)).toBe('wide')
  expect(widthTier(150)).toBe('wide')
})

test('barSegments: an even split fills proportional cells', () => {
  const runs = barSegments([{ name: 'A', tokens: 50 }, { name: 'B', tokens: 50 }], 10, 100, null)
  expect(runs).toEqual([
    { key: 'A', length: 5, hasMark: false },
    { key: 'B', length: 5, hasMark: false },
  ])
})

test('barSegments: a tiny category that would round to 0 cells still gets at least 1, when there is room left', () => {
  // A: 500/1000 -> 5 cells. B: +10/1000 -> cumulative share still rounds to cell 5
  // (no new cell by plain rounding), but the "at least 1" rule bumps it to 1 cell,
  // since C still has 4 cells' worth of room after it.
  const runs = barSegments(
    [
      { name: 'A', tokens: 500 },
      { name: 'B', tokens: 10 },
      { name: 'C', tokens: 490 },
    ],
    10,
    1000,
    null,
  )
  expect(runs).toEqual([
    { key: 'A', length: 5, hasMark: false },
    { key: 'B', length: 1, hasMark: false },
    { key: 'C', length: 4, hasMark: false },
  ])
})

test('barSegments: unused space becomes track (null key)', () => {
  const runs = barSegments([{ name: 'A', tokens: 30 }], 10, 100, null)
  expect(runs).toEqual([
    { key: 'A', length: 3, hasMark: false },
    { key: null, length: 7, hasMark: false },
  ])
})

test('barSegments: the auto-compact mark isolates one track cell without changing total width', () => {
  const runs = barSegments([{ name: 'A', tokens: 30 }], 10, 100, 80)
  const total = runs.reduce((sum, r) => sum + r.length, 0)
  expect(total).toBe(10)
  const marked = runs.filter((r) => r.hasMark)
  expect(marked).toEqual([{ key: null, length: 1, hasMark: true }])
})

test('barSegments: a mark that falls inside already-filled cells does not show (filled color wins)', () => {
  // usage already covers columns 0..7 (80%), threshold at 50% falls inside the filled part
  const runs = barSegments([{ name: 'A', tokens: 80 }], 10, 100, 50)
  expect(runs.some((r) => r.hasMark)).toBe(false)
})

test('barSegments: empty categories is all track', () => {
  const runs = barSegments([], 5, 100, null)
  expect(runs).toEqual([{ key: null, length: 5, hasMark: false }])
})

test('pctText: thresholds at 10% and 0.1%', () => {
  expect(pctText(10, 100)).toBe('10%')
  expect(pctText(33, 100)).toBe('33%')
  expect(pctText(1, 1000)).toBe('0.1%')
  expect(pctText(0.5, 1000)).toBe('<0.1%')
})

test('legendChips: sorted descending by tokens, limit slices to top-N', () => {
  const cats = [
    { name: 'Small', tokens: 10 },
    { name: 'Big', tokens: 80 },
    { name: 'Medium', tokens: 30 },
  ]
  expect(legendChips(cats, 120).map((c) => c.name)).toEqual(['Big', 'Medium', 'Small'])
  expect(legendChips(cats, 120, 2).map((c) => c.name)).toEqual(['Big', 'Medium'])
})

test('deltaText: below 1000 tokens is suppressed', () => {
  expect(deltaText(null)).toEqual({ text: '', isBig: false })
  expect(deltaText(500)).toEqual({ text: '', isBig: false })
  expect(deltaText(-999)).toEqual({ text: '', isBig: false })
})

test('deltaText: sign and k() formatting', () => {
  expect(deltaText(3700)).toEqual({ text: '+3.7k', isBig: false })
  expect(deltaText(-3700)).toEqual({ text: '−3.7k', isBig: false })
})

test('deltaText: isBig is asymmetric — only a big *increase* warns, a big drop (post-compaction) does not', () => {
  expect(deltaText(20000)).toEqual({ text: '+20.0k', isBig: true })
  expect(deltaText(-50000)).toEqual({ text: '−50.0k', isBig: false })
})

test('percentSeverity: thresholds at 70 and 85', () => {
  expect(percentSeverity(10)).toBe('bright')
  expect(percentSeverity(70)).toBe('warn')
  expect(percentSeverity(84)).toBe('warn')
  expect(percentSeverity(85)).toBe('danger')
})
