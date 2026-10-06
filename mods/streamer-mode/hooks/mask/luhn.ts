/**
 * Luhn 체크섬 (카드번호 검증에 쓰는 표준 알고리즘). 숫자로만 된 문자열을 받는다.
 *
 * @param digits 하이픈·공백을 뺀, 숫자로만 된 문자열
 * @returns 체크섬이 맞으면 true
 */
export function isLuhnValid(digits: string): boolean {
  if (digits.length === 0) {
    return false
  }

  let sum = 0
  let shouldDouble = false

  for (let i = digits.length - 1; i >= 0; i--) {
    const code = digits.charCodeAt(i) - 48
    if (code < 0 || code > 9) {
      return false
    }

    let value = code
    if (shouldDouble) {
      value *= 2
      if (value > 9) {
        value -= 9
      }
    }

    sum += value
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
