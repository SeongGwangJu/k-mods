import { describe, expect, test } from 'claude-code/testing'

import { createSessionCounter } from '../hooks/mask/session-counter'

describe('createSessionCounter', () => {
  test('처음 보는 키는 세고 true를 돌려준다', () => {
    const counter = createSessionCounter()
    expect(counter.record('a')).toBe(true)
    expect(counter.count).toBe(1)
  })

  test('같은 키를 또 기록하면 세지 않는다', () => {
    const counter = createSessionCounter()
    counter.record('a')
    expect(counter.record('a')).toBe(false)
    expect(counter.count).toBe(1)
  })

  test('서로 다른 키는 각각 센다', () => {
    const counter = createSessionCounter()
    counter.record('a')
    counter.record('b')
    counter.record('c')
    expect(counter.count).toBe(3)
  })

  test('시작할 땐 0이다', () => {
    expect(createSessionCounter().count).toBe(0)
  })
})
