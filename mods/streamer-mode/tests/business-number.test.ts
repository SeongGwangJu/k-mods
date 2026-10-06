import { describe, expect, test } from 'claude-code/testing'

import { isValidBusinessNumber } from '../hooks/mask/business-number'

describe('isValidBusinessNumber', () => {
  test('체크섬이 맞는 10자리는 통과한다', () => {
    expect(isValidBusinessNumber('1234567891')).toBe(true)
  })

  test('체크섬이 맞는 다른 10자리도 통과한다', () => {
    expect(isValidBusinessNumber('2208170716')).toBe(true)
  })

  test('마지막 체크 자리만 틀리면 false', () => {
    expect(isValidBusinessNumber('1234567892')).toBe(false)
  })

  test('가운데 자리가 바뀌어도 체크섬이 깨진다', () => {
    expect(isValidBusinessNumber('1234567981')).toBe(false)
  })

  test('길이가 10이 아니면 false', () => {
    expect(isValidBusinessNumber('123456789')).toBe(false)
    expect(isValidBusinessNumber('12345678901')).toBe(false)
  })

  test('숫자가 아닌 문자가 섞이면 false', () => {
    expect(isValidBusinessNumber('12345-6789')).toBe(false)
  })
})
