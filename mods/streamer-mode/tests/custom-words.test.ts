import { describe, expect, test } from 'claude-code/testing'

import { findCustomWords } from '../hooks/mask/custom-words'
import { maskWith } from './fixtures/mask-simple'

function masked(text: string, words: readonly string[]): string {
  return maskWith(text, findCustomWords(text, words))
}

describe('findCustomWords', () => {
  test('등록한 단어를 가린다', () => {
    expect(masked('Acme 사와 계약했어요', ['Acme'])).toBe('[가림] 사와 계약했어요')
  })

  test('대소문자를 가리지 않고 찾는다', () => {
    expect(findCustomWords('ACME, acme, AcMe', ['Acme'])).toHaveLength(3)
  })

  test('여러 단어를 한 번에 등록할 수 있다', () => {
    const categories = findCustomWords('Acme와 김철수', ['Acme', '김철수']).map(m => m.category)
    expect(categories).toEqual(['custom', 'custom'])
  })

  test('짧은 단어가 긴 단어를 가로채지 않는다 (긴 단어부터 시도)', () => {
    expect(masked('AcmeCorp 소속입니다', ['Acme', 'AcmeCorp'])).toBe('[가림] 소속입니다')
  })

  test('빈 문자열·공백만 있는 항목은 무시한다', () => {
    expect(findCustomWords('아무 글자나', ['', '   '])).toHaveLength(0)
  })

  test('정규식 특수문자가 있는 단어도 글자 그대로 찾는다', () => {
    expect(findCustomWords('회사(주)', ['회사(주)'])).toHaveLength(1)
    expect(findCustomWords('AT&T', ['AT&T'])).toHaveLength(1)
  })

  test('등록하지 않은 단어는 건드리지 않는다', () => {
    expect(findCustomWords('이 문장은 평범해요', ['Acme'])).toHaveLength(0)
  })

  test('단어 목록이 비어 있으면 아무것도 찾지 않는다', () => {
    expect(findCustomWords('Acme 언급', [])).toHaveLength(0)
  })
})
