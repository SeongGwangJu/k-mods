import { describe, expect, test } from 'claude-code/testing'

import {
  findBusinessNumbers,
  findCardNumbers,
  findKoreanIds,
  findLicenseNumbers,
  findResidentNumbers,
} from '../hooks/mask/korean-id'

describe('findResidentNumbers (주민등록번호)', () => {
  test('하이픈이 있는 유효한 생년월일은 찾는다', () => {
    const matches = findResidentNumbers('주민 900101-1234567 입니다')
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({ category: 'rrn' })
  })

  test('하이픈이 없어도 찾는다', () => {
    expect(findResidentNumbers('9001011234567')).toHaveLength(1)
  })

  test('윤년 2월 29일(2004년, gender=3 -> 2000년대)은 유효하다', () => {
    expect(findResidentNumbers('040229-3234567')).toHaveLength(1)
  })

  test('평년 2월 29일(2005년)은 날짜가 없으므로 찾지 않는다', () => {
    expect(findResidentNumbers('050229-3234567')).toHaveLength(0)
  })

  test('2월 30일처럼 없는 날짜는 찾지 않는다', () => {
    expect(findResidentNumbers('040230-3234567')).toHaveLength(0)
  })

  test('월이 13이면 모양 자체가 안 맞아 찾지 않는다', () => {
    expect(findResidentNumbers('901301-1234567')).toHaveLength(0)
  })

  test('성별 자리가 1~8 밖이면 찾지 않는다', () => {
    expect(findResidentNumbers('900101-9234567')).toHaveLength(0)
    expect(findResidentNumbers('900101-0234567')).toHaveLength(0)
  })
})

describe('findLicenseNumbers (운전면허번호)', () => {
  test('NN-NN-NNNNNN-NN 모양을 찾는다', () => {
    const matches = findLicenseNumbers('면허 12-34-567890-12')
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({ category: 'license' })
  })

  test('가운데 묶음 길이가 다르면 찾지 않는다', () => {
    expect(findLicenseNumbers('12-34-5678-12')).toHaveLength(0)
  })

  test('하이픈이 없으면 찾지 않는다 (사업자번호 등과 헷갈리지 않도록)', () => {
    expect(findLicenseNumbers('1234567890 12')).toHaveLength(0)
  })
})

describe('findBusinessNumbers (사업자등록번호)', () => {
  test('체크섬이 맞는 NNN-NN-NNNNN은 찾는다', () => {
    const matches = findBusinessNumbers('사업자 123-45-67891')
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({ category: 'business' })
  })

  test('체크섬이 틀리면 찾지 않는다', () => {
    expect(findBusinessNumbers('123-45-67892')).toHaveLength(0)
  })

  test('하이픈이 없으면 찾지 않는다 (사업자번호는 하이픈이 필수)', () => {
    expect(findBusinessNumbers('1234567891')).toHaveLength(0)
  })
})

describe('findCardNumbers (카드번호)', () => {
  test('Luhn이 맞는 16자리(공백 없음)를 찾는다', () => {
    expect(findCardNumbers('카드 4111111111111111 결제')).toHaveLength(1)
  })

  test('4-4-4-4로 띄어 쓴 카드번호도 찾는다', () => {
    expect(findCardNumbers('4111 1111 1111 1111')).toHaveLength(1)
  })

  test('하이픈으로 묶은 카드번호도 찾는다', () => {
    expect(findCardNumbers('4111-1111-1111-1111')).toHaveLength(1)
  })

  test('13자리·19자리 Luhn 유효 번호도 찾는다', () => {
    expect(findCardNumbers('4111111111119')).toHaveLength(1)
    expect(findCardNumbers('4111111111111111110')).toHaveLength(1)
  })

  test('Luhn이 틀리면 16자리 숫자여도 찾지 않는다', () => {
    expect(findCardNumbers('4111111111111112')).toHaveLength(0)
  })

  test('12자리(너무 짧음)는 찾지 않는다', () => {
    expect(findCardNumbers('411111111111')).toHaveLength(0)
  })
})

describe('findKoreanIds', () => {
  test('네 가지를 한 번에 합쳐서 찾는다', () => {
    const text = [
      '주민 900101-1234567',
      '면허 12-34-567890-12',
      '사업자 123-45-67891',
      '카드 4111111111111111',
    ].join(', ')

    const matches = findKoreanIds(text)
    const categories = matches.map(m => m.category).sort()
    expect(categories).toEqual(['business', 'card', 'license', 'rrn'])
  })
})
