import { isValidBusinessNumber } from './business-number'
import { isLuhnValid } from './luhn'
import { PRIORITY, type RawMatch } from './types'

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function daysInMonth(year: number, month: number): number {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const
  // month는 호출부에서 1~12로 이미 검증됐으므로 month - 1(0~11)은 항상 범위 안이다.
  return days[month - 1]!
}

/** 주민등록번호/외국인등록번호 뒷자리 첫 숫자로 세기(1900년대/2000년대)를 가늠한다 */
function centuryOf(genderDigit: number): number {
  // 1,2,5,6 -> 1900년대 (내국인/외국인), 3,4,7,8 -> 2000년대
  return genderDigit === 1 || genderDigit === 2 || genderDigit === 5 || genderDigit === 6
    ? 1900
    : 2000
}

/** YYMMDD + 성별 숫자가 실제로 있을 수 있는 날짜인지 (2월 29일 등 윤년까지) 검증한다 */
function isValidBirthDate(yy: string, mm: string, dd: string, genderDigit: string): boolean {
  const month = Number(mm)
  const day = Number(dd)
  const year = centuryOf(Number(genderDigit)) + Number(yy)

  if (month < 1 || month > 12) {
    return false
  }
  return day >= 1 && day <= daysInMonth(year, month)
}

// 주민등록번호/외국인등록번호: YYMMDD-[1-8]XXXXXX, 하이픈 있어도 없어도 됨
const RRN_RE = /(?<!\d)(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])-?([1-8])\d{6}(?!\d)/g

/** 주민등록번호/외국인등록번호를 찾는다 (월/일이 실제로 있는 날짜일 때만) */
export function findResidentNumbers(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(RRN_RE)) {
    if (m.index === undefined) continue
    // 네 그룹 모두 선택적(`?`)이 아니므로 전체 매치가 있으면 항상 들어 있다.
    const yy = m[1]!
    const mm = m[2]!
    const dd = m[3]!
    const gender = m[4]!
    if (!isValidBirthDate(yy, mm, dd, gender)) continue

    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      category: 'rrn',
      priority: PRIORITY.rrn,
    })
  }

  return matches
}

// 운전면허번호: NN-NN-NNNNNN-NN (체크섬 없음, 모양만 본다)
const LICENSE_RE = /(?<!\d)\d{2}-\d{2}-\d{6}-\d{2}(?!\d)/g

export function findLicenseNumbers(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(LICENSE_RE)) {
    if (m.index === undefined) continue
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      category: 'license',
      priority: PRIORITY.license,
    })
  }

  return matches
}

// 사업자등록번호: NNN-NN-NNNNN (하이픈 필수, 체크섬으로 검증)
const BUSINESS_RE = /(?<!\d)(\d{3})-(\d{2})-(\d{5})(?!\d)/g

export function findBusinessNumbers(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(BUSINESS_RE)) {
    if (m.index === undefined) continue
    const digits10 = m[1]! + m[2]! + m[3]!
    if (!isValidBusinessNumber(digits10)) continue

    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      category: 'business',
      priority: PRIORITY.business,
    })
  }

  return matches
}

// 카드번호: 13~19자리 숫자, 공백·하이픈으로 묶여 있어도 없어도 됨. Luhn으로 검증해
// 길게 이어진 다른 숫자(주문번호 등)를 카드번호로 잘못 보지 않게 한다.
const CARD_CANDIDATE_RE = /(?<![\d-])\d(?:[ -]?\d){12,18}(?!\d)/g

export function findCardNumbers(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(CARD_CANDIDATE_RE)) {
    if (m.index === undefined) continue
    const digitsOnly = m[0].replace(/[ -]/g, '')
    if (digitsOnly.length < 13 || digitsOnly.length > 19) continue
    if (!isLuhnValid(digitsOnly)) continue

    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      category: 'card',
      priority: PRIORITY.card,
    })
  }

  return matches
}

export function findKoreanIds(text: string): RawMatch[] {
  return [
    ...findResidentNumbers(text),
    ...findLicenseNumbers(text),
    ...findBusinessNumbers(text),
    ...findCardNumbers(text),
  ]
}
