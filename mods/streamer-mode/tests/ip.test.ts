import { describe, expect, test } from 'claude-code/testing'

import { findPublicIps } from '../hooks/mask/ip'
import { maskWith } from './fixtures/mask-simple'

function masked(text: string): string {
  return maskWith(text, findPublicIps(text))
}

describe('findPublicIps — IPv4', () => {
  test('공인 IP를 가린다', () => {
    expect(masked('서버는 8.8.8.8 입니다')).toBe('서버는 [IP 가림] 입니다')
  })

  test('다른 공인 IP도 가린다', () => {
    expect(findPublicIps('1.1.1.1')).toHaveLength(1)
  })

  test('127.0.0.1(루프백)은 가리지 않는다', () => {
    expect(findPublicIps('127.0.0.1')).toHaveLength(0)
  })

  test('0.0.0.0(미지정)은 가리지 않는다', () => {
    expect(findPublicIps('0.0.0.0')).toHaveLength(0)
  })

  test('사설 대역(10.x, 172.16-31.x, 192.168.x)은 가리지 않는다', () => {
    expect(findPublicIps('10.0.0.5')).toHaveLength(0)
    expect(findPublicIps('172.20.0.3')).toHaveLength(0)
    expect(findPublicIps('192.168.1.1')).toHaveLength(0)
  })

  test('링크로컬(169.254.x)은 가리지 않는다', () => {
    expect(findPublicIps('169.254.1.1')).toHaveLength(0)
  })

  test(
    '알려진 한계: 1.2.3.4 같은 4묶음 버전 문자열은 IP와 모양이 같아 가려질 수 있다 (README에 적어 둠)',
    () => {
      expect(findPublicIps('1.2.3.4')).toHaveLength(1)
    },
  )

  test('3묶음짜리 일반 버전 번호(2.1.291)는 애초에 IPv4 모양이 아니라 가리지 않는다', () => {
    expect(findPublicIps('2.1.291')).toHaveLength(0)
  })
})

describe('findPublicIps — IPv6', () => {
  test('전체 표기 공인 IPv6을 가린다', () => {
    expect(findPublicIps('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toHaveLength(1)
  })

  test('압축 표기(::) IPv6도 가린다', () => {
    expect(findPublicIps('2001:db8::8a2e:370:7334')).toHaveLength(1)
  })

  test('::1(루프백)은 가리지 않는다', () => {
    expect(findPublicIps('::1')).toHaveLength(0)
  })

  test('링크로컬(fe80::/10)은 가리지 않는다', () => {
    expect(findPublicIps('fe80::1ff:fe23:4567:890a')).toHaveLength(0)
  })

  test('유니크로컬(fc00::/7, fd00::/8)은 가리지 않는다', () => {
    expect(findPublicIps('fd12:3456:789a:1::1')).toHaveLength(0)
  })

  test('평범한 글자는 IPv6으로 보지 않는다', () => {
    expect(findPublicIps('not an ipv6 address at all')).toHaveLength(0)
  })
})
