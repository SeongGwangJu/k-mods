import { PRIORITY, type RawMatch } from './types'

// 휴대폰: 01[016789] + 3~4자리 + 4자리, 구분자는 -, ., 공백, 또는 없음
const MOBILE_RE = /(?<!\d)01[016789][-. ]?\d{3,4}[-. ]?\d{4}(?!\d)/g

// 일반전화: 02 / 0[3-6][1-5] (지역번호) / 070 + 3~4자리 + 4자리
const LANDLINE_RE = /(?<!\d)(?:02|0[3-6][1-5]|070)[-. ]?\d{3,4}[-. ]?\d{4}(?!\d)/g

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

const EXAMPLE_DOMAIN_RE = /(?:^|\.)example\.(com|org|net)$/i

/**
 * git@github.com 같은 SSH 원격 주소, noreply 메일, example.com류는 "이메일"이
 * 아니라 흔한 비(非)개인정보 관용구이므로 가리지 않는다.
 */
function isExcludedEmail(localPart: string, domain: string): boolean {
  const local = localPart.toLowerCase()
  const host = domain.toLowerCase()

  if (local === 'git') {
    return true
  }
  if (local === 'noreply' || local === 'no-reply') {
    return true
  }
  if (host.endsWith('users.noreply.github.com')) {
    return true
  }
  if (EXAMPLE_DOMAIN_RE.test(host)) {
    return true
  }

  return false
}

export function findPhoneNumbers(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const re of [MOBILE_RE, LANDLINE_RE]) {
    for (const m of text.matchAll(re)) {
      if (m.index === undefined) continue
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        category: 'phone',
        priority: PRIORITY.phone,
      })
    }
  }

  return matches
}

export function findEmails(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(EMAIL_RE)) {
    if (m.index === undefined) continue
    const [whole] = m
    const at = whole.indexOf('@')
    const localPart = whole.slice(0, at)
    const domain = whole.slice(at + 1)

    if (isExcludedEmail(localPart, domain)) continue

    matches.push({
      start: m.index,
      end: m.index + whole.length,
      category: 'email',
      priority: PRIORITY.email,
    })
  }

  return matches
}

/** mask_contact 그룹: 전화번호(휴대폰+일반전화) + 이메일 */
export function findContacts(text: string): RawMatch[] {
  return [...findPhoneNumbers(text), ...findEmails(text)]
}
