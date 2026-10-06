import { describe, expect, test } from 'claude-code/testing'

import { createMaskCache } from '../hooks/mask/cache'

describe('createMaskCache', () => {
  test('넣은 값을 그대로 돌려준다', () => {
    const cache = createMaskCache(10)
    cache.set('a', 'A')
    expect(cache.get('a')).toBe('A')
  })

  test('없는 키는 undefined', () => {
    const cache = createMaskCache(10)
    expect(cache.get('nope')).toBeUndefined()
  })

  test('상한을 넘으면 가장 오래전에 쓴 항목부터 지운다(LRU)', () => {
    const cache = createMaskCache(2)
    cache.set('a', 'A')
    cache.set('b', 'B')
    cache.set('c', 'C') // 'a'가 가장 오래됐으므로 밀려난다

    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('B')
    expect(cache.get('c')).toBe('C')
    expect(cache.size).toBe(2)
  })

  test('읽으면 최근 사용으로 옮겨져 더 오래 살아남는다', () => {
    const cache = createMaskCache(2)
    cache.set('a', 'A')
    cache.set('b', 'B')
    cache.get('a') // a를 최근 사용으로 옮긴다
    cache.set('c', 'C') // 이제 가장 오래된 건 'b'

    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe('A')
    expect(cache.get('c')).toBe('C')
  })

  test('같은 키를 다시 넣으면 값을 덮어쓴다', () => {
    const cache = createMaskCache(10)
    cache.set('a', 'A1')
    cache.set('a', 'A2')
    expect(cache.get('a')).toBe('A2')
    expect(cache.size).toBe(1)
  })
})
