import { describe, expect, test } from 'claude-code/testing'

import { findContacts, findEmails, findPhoneNumbers } from '../hooks/mask/contact'
import { maskWith } from './fixtures/mask-simple'

function masked(text: string): string {
  return maskWith(text, findContacts(text))
}

describe('findPhoneNumbers', () => {
  test('휴대폰 번호(하이픈)를 찾는다', () => {
    expect(masked('010-1234-5678로 연락')).toBe('[전화번호 가림]로 연락')
  })

  test('휴대폰 번호(점 구분)를 찾는다', () => {
    expect(findPhoneNumbers('010.1234.5678')).toHaveLength(1)
  })

  test('휴대폰 번호(구분자 없음)를 찾는다', () => {
    expect(findPhoneNumbers('01012345678')).toHaveLength(1)
  })

  test('옛 번호대(016/017/018/019)도 찾는다', () => {
    expect(findPhoneNumbers('016-123-4567')).toHaveLength(1)
    expect(findPhoneNumbers('019-1234-5678')).toHaveLength(1)
  })

  test('서울 지역번호(02)를 찾는다', () => {
    expect(findPhoneNumbers('02-1234-5678')).toHaveLength(1)
  })

  test('그 외 지역번호(031, 051 등)를 찾는다', () => {
    expect(findPhoneNumbers('031-123-4567')).toHaveLength(1)
    expect(findPhoneNumbers('051-123-4567')).toHaveLength(1)
  })

  test('인터넷 전화(070)를 찾는다', () => {
    expect(findPhoneNumbers('070-1234-5678')).toHaveLength(1)
  })

  test('날짜는 전화번호로 보지 않는다', () => {
    expect(findPhoneNumbers('2026-10-06')).toHaveLength(0)
  })

  test('더 긴 숫자 나열 안에 전화번호 모양이 있어도 찾지 않는다', () => {
    expect(findPhoneNumbers('99990101234567888')).toHaveLength(0)
  })

  test('포트 번호 같은 짧은 숫자는 찾지 않는다', () => {
    expect(findPhoneNumbers('8080')).toHaveLength(0)
  })
})

describe('findEmails', () => {
  test('일반 이메일을 찾는다', () => {
    expect(masked('kim.dev@gmail.com 로 보내요')).toBe('[이메일 가림] 로 보내요')
  })

  test('회사 도메인 이메일도 찾는다', () => {
    expect(findEmails('contact@my-company.co.kr')).toHaveLength(1)
  })

  test('plus 주소(gmail +태그)도 찾는다', () => {
    expect(findEmails('user+tag@example.co')).toHaveLength(1)
  })

  test('git@github.com 같은 SSH 원격 주소는 가리지 않는다', () => {
    expect(findEmails('git@github.com:foo/bar.git')).toHaveLength(0)
  })

  test('noreply 메일은 가리지 않는다', () => {
    expect(findEmails('noreply@github.com')).toHaveLength(0)
    expect(findEmails('42+user@users.noreply.github.com')).toHaveLength(0)
  })

  test('example.com/.org/.net 메일은 가리지 않는다', () => {
    expect(findEmails('jane@example.com')).toHaveLength(0)
    expect(findEmails('jane@example.org')).toHaveLength(0)
    expect(findEmails('jane@example.net')).toHaveLength(0)
  })
})

describe('findContacts', () => {
  test('전화번호와 이메일을 함께 찾는다', () => {
    const text = '연락처 kim.dev@gmail.com 010-1234-5678'
    const categories = findContacts(text).map(m => m.category).sort()
    expect(categories).toEqual(['email', 'phone'])
  })
})
