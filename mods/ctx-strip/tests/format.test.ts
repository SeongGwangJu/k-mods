import { expect, test } from 'claude-code/testing'

import { clockMs, describe, esc, est, k, oneLine } from '../hooks/format'

test('k: under 1000 is plain, under 100k keeps one decimal, 100k+ is whole', () => {
  expect(k(340)).toBe('340')
  expect(k(1200)).toBe('1.2k')
  expect(k(125000)).toBe('125k')
})

test('esc: escapes & < > "', () => {
  expect(esc('<b>a & "b"</b>')).toBe('&lt;b&gt;a &amp; &quot;b&quot;&lt;/b&gt;')
})

test('oneLine: collapses whitespace and truncates with an ellipsis', () => {
  expect(oneLine('a   b\nc', 90)).toBe('a b c')
  const long = 'x'.repeat(100)
  expect(oneLine(long, 90)).toBe('x'.repeat(90) + '…')
})

test('est: roughly chars / 3.5, rounded', () => {
  expect(est('x'.repeat(7))).toBe(2)
  expect(est('')).toBe(0)
})

test('describe: picks the most relevant field from a tool call', () => {
  expect(describe({ tool: 'Read', input: { file_path: '/a/b.ts' } })).toBe('/a/b.ts')
  expect(describe({ tool: 'Bash', input: { command: 'ls -la' } })).toBe('ls -la')
  expect(describe({ tool: 'Weird', input: {} })).toBe('Weird')
})

test('clockMs: M:SS', () => {
  expect(clockMs(5000)).toBe('0:05')
  expect(clockMs(65000)).toBe('1:05')
})
