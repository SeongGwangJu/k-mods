import { describe, expect, test } from 'claude-code/testing'

import { deepMaskValue } from '../hooks/mask/deep'

// 테스트 전용: 글자 그대로의 문자열을 "*"로 바꾸는 단순한 mask 함수
const star = (s: string) => '*'.repeat(s.length)

describe('deepMaskValue', () => {
  test('문자열은 그대로 가린다', () => {
    expect(deepMaskValue('secret', star)).toBe('******')
  })

  test('숫자·불리언·null은 건드리지 않는다', () => {
    expect(deepMaskValue(42, star)).toBe(42)
    expect(deepMaskValue(true, star)).toBe(true)
    expect(deepMaskValue(null, star)).toBe(null)
    expect(deepMaskValue(undefined, star)).toBe(undefined)
  })

  test('배열은 모양을 유지하며 문자열만 가린다', () => {
    expect(deepMaskValue(['a', 1, 'bb'], star)).toEqual(['*', 1, '**'])
  })

  test('객체는 키를 유지하며 문자열 값만 가린다', () => {
    expect(deepMaskValue({ cmd: 'ls', timeout: 30 }, star)).toEqual({ cmd: '**', timeout: 30 })
  })

  test('중첩된 객체·배열도 재귀적으로 가린다', () => {
    const input = {
      stdout: 'hello',
      meta: { nested: ['x', { deep: 'y' }] },
    }
    expect(deepMaskValue(input, star)).toEqual({
      stdout: '*****',
      meta: { nested: ['*', { deep: '*' }] },
    })
  })

  test('아주 깊은 중첩에서도 멈추지 않고 원본을 돌려준다(방어적 깊이 제한)', () => {
    let deep: unknown = 'bottom'
    for (let i = 0; i < 30; i++) {
      deep = { next: deep }
    }
    // 에러 없이 끝나기만 하면 충분하다 (깊이 제한을 넘으면 그 아래는 원본 그대로)
    expect(() => deepMaskValue(deep, star)).not.toThrow()
  })
})
