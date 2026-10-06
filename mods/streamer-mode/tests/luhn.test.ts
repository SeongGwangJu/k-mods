import { describe, expect, test } from 'claude-code/testing'

import { isLuhnValid } from '../hooks/mask/luhn'

describe('isLuhnValid', () => {
  test('카드사 테스트 번호(체크섬이 맞는 16자리)는 통과한다', () => {
    expect(isLuhnValid('4111111111111111')).toBe(true)
  })

  test('13자리 Luhn 유효 번호도 통과한다', () => {
    expect(isLuhnValid('4111111111119')).toBe(true)
  })

  test('19자리 Luhn 유효 번호도 통과한다', () => {
    expect(isLuhnValid('4111111111111111110')).toBe(true)
  })

  test('마지막 자리만 틀리면 체크섬이 깨진다', () => {
    expect(isLuhnValid('4111111111111112')).toBe(false)
  })

  test('숫자가 하나도 없으면 false', () => {
    expect(isLuhnValid('')).toBe(false)
  })

  test('숫자가 아닌 문자가 섞이면 false', () => {
    expect(isLuhnValid('411111111111111a')).toBe(false)
  })
})
