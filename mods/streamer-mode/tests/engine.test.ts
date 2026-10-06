import { describe, expect, test } from 'claude-code/testing'

import { createMaskCache } from '../hooks/mask/cache'
import { applyMatches, maskForDisplay, resolveOverlaps } from '../hooks/mask/engine'
import { findSecrets } from '../hooks/mask/secrets'
import { createSessionCounter } from '../hooks/mask/session-counter'
import type { MaskConfig } from '../hooks/mask/types'

const FULL_CONFIG: MaskConfig = {
  maskSecrets: true,
  maskKoreanId: true,
  maskContact: true,
  maskIp: true,
  maskHome: true,
  customWords: [],
  style: 'label',
}

describe('resolveOverlaps', () => {
  test('겹치면 우선순위가 높은 쪽이 남는다', () => {
    const accepted = resolveOverlaps([
      { start: 0, end: 10, category: 'secret', priority: 80 },
      { start: 0, end: 10, category: 'secret', priority: 90, isAssignmentValue: true },
    ])
    expect(accepted).toHaveLength(1)
    expect(accepted[0]).toMatchObject({ priority: 90 })
  })

  test('우선순위가 같으면 더 긴 쪽이 남는다', () => {
    const accepted = resolveOverlaps([
      { start: 0, end: 5, category: 'secret', priority: 80 },
      { start: 0, end: 10, category: 'secret', priority: 80 },
    ])
    expect(accepted).toHaveLength(1)
    expect(accepted[0]).toMatchObject({ end: 10 })
  })

  test('겹치지 않으면 둘 다 남고 위치 순으로 정렬된다', () => {
    const accepted = resolveOverlaps([
      { start: 20, end: 25, category: 'ip', priority: 40 },
      { start: 0, end: 5, category: 'email', priority: 50 },
    ])
    expect(accepted.map(m => m.start)).toEqual([0, 20])
  })

  test('key=value의 값이 동시에 이름 있는 토큰 모양이면 대입문 쪽이 이긴다', () => {
    const text = 'API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789'
    const accepted = resolveOverlaps(findSecrets(text))
    expect(accepted).toHaveLength(1)
    expect(accepted[0]).toMatchObject({ isAssignmentValue: true })

    const output = applyMatches(text, accepted, 'label')
    expect(output).toBe('API_KEY=[값 가림]')
  })
})

describe('applyMatches', () => {
  test('매치가 없으면 원문 그대로', () => {
    expect(applyMatches('hello', [], 'label')).toBe('hello')
  })

  test('여러 매치를 순서대로 치환한다', () => {
    const text = 'a@b.com 그리고 c@d.com'
    const firstStart = text.indexOf('a@b.com')
    const secondStart = text.indexOf('c@d.com')
    const output = applyMatches(
      text,
      [
        { start: firstStart, end: firstStart + 'a@b.com'.length, category: 'email', priority: 50 },
        { start: secondStart, end: secondStart + 'c@d.com'.length, category: 'email', priority: 50 },
      ],
      'label',
    )
    expect(output).toBe('[이메일 가림] 그리고 [이메일 가림]')
  })
})

describe('maskForDisplay', () => {
  test('같은 문자열은 캐시에서 그대로 돌려주고, 서로 다른 항목으로 중복 집계하지 않는다', () => {
    const cache = createMaskCache(500)
    const counter = createSessionCounter()
    const text = '제 이메일은 kim.dev@gmail.com 입니다'

    const first = maskForDisplay(text, FULL_CONFIG, cache, counter)
    const second = maskForDisplay(text, FULL_CONFIG, cache, counter)

    expect(first).toBe(second)
    expect(counter.count).toBe(1) // 두 번 불렀지만 같은 이메일, 한 번만 집계
  })

  test('서로 다른 비밀은 서로 다르게 집계된다', () => {
    const cache = createMaskCache(500)
    const counter = createSessionCounter()

    maskForDisplay('kim@gmail.com', FULL_CONFIG, cache, counter)
    maskForDisplay('lee@gmail.com', FULL_CONFIG, cache, counter)

    expect(counter.count).toBe(2)
  })

  test('빈 문자열은 그대로 돌려주고 캐시에 남기지 않는다', () => {
    const cache = createMaskCache(500)
    const counter = createSessionCounter()
    expect(maskForDisplay('', FULL_CONFIG, cache, counter)).toBe('')
    expect(cache.size).toBe(0)
  })

  test('꺼진 그룹은 가리지 않는다', () => {
    const cache = createMaskCache(500)
    const counter = createSessionCounter()
    const onlyEmail: MaskConfig = { ...FULL_CONFIG, maskContact: false }
    const text = 'kim.dev@gmail.com'
    expect(maskForDisplay(text, onlyEmail, cache, counter)).toBe(text)
  })

  test('style이 dots면 종류와 무관하게 점으로만 가린다', () => {
    const cache = createMaskCache(500)
    const counter = createSessionCounter()
    const dotsConfig: MaskConfig = { ...FULL_CONFIG, style: 'dots' }
    expect(maskForDisplay('kim.dev@gmail.com', dotsConfig, cache, counter)).toBe('●●●●●●')
  })
})
