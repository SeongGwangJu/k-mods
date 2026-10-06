// 사업자등록번호 체크섬 가중치 (앞 9자리에 각각 곱하는 값). 길이 9 고정이라
// 아래에서 i가 0~8일 때의 접근은 항상 안전하다 (non-null 단언으로 그 점을 밝힌다).
const WEIGHTS = [1, 3, 7, 1, 3, 7, 1, 3, 5] as const

/**
 * 사업자등록번호 체크섬을 검증한다 (국세청이 쓰는 공개 알고리즘).
 *
 * 앞 9자리에 가중치를 곱해 더하고, 9번째 자리를 5배 해서 10으로 나눈 몫을 더한 뒤,
 * `(10 - 합계 % 10) % 10`이 마지막 10번째 자리와 같으면 유효하다.
 *
 * @param digits10 하이픈을 뺀, 숫자 10자리 문자열
 */
export function isValidBusinessNumber(digits10: string): boolean {
  if (!/^\d{10}$/.test(digits10)) {
    return false
  }

  const digit = (index: number) => digits10.charCodeAt(index) - 48

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digit(i) * WEIGHTS[i]!
  }
  sum += Math.floor((digit(8) * 5) / 10)

  const check = (10 - (sum % 10)) % 10
  return check === digit(9)
}
