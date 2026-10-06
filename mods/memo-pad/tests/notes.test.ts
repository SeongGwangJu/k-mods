import { expect, test } from 'claude-code/testing'

import { hintTail, storeKeyFor } from '../hooks/notes'
import { paletteOf } from '../hooks/palette'

test('storeKeyFor: prefixes the working directory', () => {
  expect(storeKeyFor('/work')).toBe('notes:/work')
  expect(storeKeyFor('/Users/rd/proj')).toBe('notes:/Users/rd/proj')
})

test('hintTail: exact wording for a few counts', () => {
  expect(hintTail(1)).toBe('✎ 메모 1 (/m)')
  expect(hintTail(3)).toBe('✎ 메모 3 (/m)')
})

test('paletteOf: gray has no color at all, matching the original', () => {
  expect(paletteOf('gray')).toEqual({ badgeBg: undefined, badgeFg: undefined })
})

test('paletteOf: theme uses the remember/inverseText chip, anything else falls back to dark', () => {
  expect(paletteOf('theme')).toEqual({ badgeBg: 'remember', badgeFg: 'inverseText' })
  const dark = { badgeBg: '#E3C56A', badgeFg: '#1E2127' }
  expect(paletteOf('dark')).toEqual(dark)
  expect(paletteOf(undefined)).toEqual(dark)
  expect(paletteOf('nonsense')).toEqual(dark)
})
