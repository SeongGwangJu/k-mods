import { expect, test } from 'claude-code/testing'

import { targetOf, duration, clockTime, modelName } from '../hooks/format'
import { paletteOf } from '../hooks/palette'

test('targetOf: file_path keeps only the basename', () => {
  expect(targetOf({ file_path: '/a/b/page.tsx' })).toBe('page.tsx')
})

test('targetOf: notebook_path keeps only the basename', () => {
  expect(targetOf({ notebook_path: '/a/b/nb.ipynb' })).toBe('nb.ipynb')
})

test('targetOf: path without a pattern is basenamed', () => {
  expect(targetOf({ path: '/a/b/c' })).toBe('c')
})

test('targetOf: pattern is kept whole, not basenamed', () => {
  // path는 pattern보다 먼저 집히므로(피크 순서), pattern만 홀로 왔을 때(Grep/Glob처럼
  // path 없이 pattern만 올 때)를 본다. path+pattern이 함께 오면 path가 통째로 쓰인다.
  expect(targetOf({ pattern: '**/*.ts' })).toBe('**/*.ts')
})

test('targetOf: path together with a pattern is kept whole too (path wins the pick, not basenamed)', () => {
  expect(targetOf({ path: '/a/b', pattern: '**/*.ts' })).toBe('/a/b')
})

test('targetOf: url drops the protocol', () => {
  expect(targetOf({ url: 'https://example.com/page' })).toBe('example.com/page')
})

test('targetOf: long text is truncated to 39 chars plus an ellipsis', () => {
  const long = 'x'.repeat(60)
  const out = targetOf({ command: long })
  expect(out).toBe('x'.repeat(39) + '…')
  expect(out.length).toBe(40)
})

test('targetOf: nothing matches is empty', () => {
  expect(targetOf({})).toBe('')
})

test('duration: seconds', () => {
  expect(duration(19000)).toBe('19초')
  expect(duration(59000)).toBe('59초')
})

test('duration: minutes', () => {
  expect(duration(60000)).toBe('1분 0초')
  expect(duration(82000)).toBe('1분 22초')
  expect(duration(3599000)).toBe('59분 59초')
})

test('duration: hours', () => {
  expect(duration(3600000)).toBe('1시간 0분')
  expect(duration(5400000)).toBe('1시간 30분')
})

test('clockTime: zero-padded HH:MM', () => {
  const d = new Date(2026, 0, 1, 9, 5)
  expect(clockTime(d.getTime())).toBe('09:05')
})

test('modelName: claude-opus-5-5 becomes Opus 5.5', () => {
  expect(modelName('claude-opus-5-5')).toBe('Opus 5.5')
})

test('modelName: an id that already reads fine loses a trailing parenthetical', () => {
  expect(modelName('Custom Model (preview)')).toBe('Custom Model')
})

test('paletteOf: gray reproduces the original hex colors exactly', () => {
  expect(paletteOf('gray')).toEqual({
    mark: '#6a52d0',
    text: '#374151',
    subtle: '#5b6070',
    aborted: '#9f1239',
    failed: '#7c4a03',
  })
})

test('paletteOf: theme resolves to theme keys, anything else falls back to dark pastels', () => {
  expect(paletteOf('theme')).toEqual({ mark: 'claude', text: 'text', subtle: 'subtle', aborted: 'warning', failed: 'error' })
  const dark = { mark: '#C3B1F5', text: '#E8EAED', subtle: '#8A909B', aborted: '#F0C987', failed: '#F28B9B' }
  expect(paletteOf('dark')).toEqual(dark)
  expect(paletteOf(undefined)).toEqual(dark)
  expect(paletteOf('not-a-real-option')).toEqual(dark)
})
