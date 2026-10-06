import { expect, test } from 'claude-code/testing'
import type { SessionContextBreakdown } from 'claude-code'

import { snapshotPayload, tempDirFrom } from '../hooks/paths'

test('tempDirFrom: TMPDIR + USER, the common macOS case', () => {
  expect(tempDirFrom('/tmp/x', 'rd')).toBe('/tmp/x/ctx-strip-rd')
})

test('tempDirFrom: trailing slash on TMPDIR is trimmed', () => {
  expect(tempDirFrom('/tmp/x/', 'rd')).toBe('/tmp/x/ctx-strip-rd')
})

test('tempDirFrom: missing TMPDIR falls back to /tmp', () => {
  expect(tempDirFrom(undefined, 'rd')).toBe('/tmp/ctx-strip-rd')
})

test('tempDirFrom: missing user falls back to "user"', () => {
  expect(tempDirFrom('/tmp', undefined)).toBe('/tmp/ctx-strip-user')
})

// statusline 모드가 쓰는 스냅샷은 fs.write로 나가기 직전의 "무엇을 쓸지"가 핵심 로직이다.
// $.fs.write/$.process.run 자체는 register.ts의 최상위 함수(tempDir/ensureDir/openPath)가
// $ 그대로 받아서 부르므로(정적 분석 규칙상 $.fs 같은 네임스페이스를 값으로 못 넘긴다), 여기서는
// 그 호출에 "무엇을 넘길지"를 결정하는 순수 로직만 검증한다.
const BREAKDOWN: SessionContextBreakdown = {
  categories: [
    { name: 'Messages', tokens: 400, color: 'claude', isDeferred: false, kind: 'used' },
    { name: 'System tools', tokens: 100, color: 'suggestion', isDeferred: false, kind: 'used' },
    { name: 'Free space', tokens: 500, color: 'inactive', isDeferred: false, kind: 'free' },
  ],
  totalTokens: 500,
  maxTokens: 1000,
  rawMaxTokens: 1000,
  autocompactSource: 'auto',
  percentage: 50,
  gridRows: [],
  model: 'claude-opus-5-5',
  memoryFiles: [],
  mcpTools: [],
  agents: [],
  isAutoCompactEnabled: true,
  autoCompactThreshold: 800,
  apiUsage: null,
}

test('snapshotPayload: keeps only used categories with tokens, and echoes delta', () => {
  expect(snapshotPayload(BREAKDOWN, 3700)).toEqual({
    palette: 'dark',
    percentage: 50,
    totalTokens: 500,
    maxTokens: 1000,
    autoCompactThreshold: 800,
    delta: 3700,
    categories: [
      { name: 'Messages', tokens: 400 },
      { name: 'System tools', tokens: 100 },
    ],
  })
})

test('snapshotPayload: autoCompactThreshold is null when auto-compact is off', () => {
  const off = { ...BREAKDOWN, isAutoCompactEnabled: false }
  expect(snapshotPayload(off, null).autoCompactThreshold).toBeNull()
})
