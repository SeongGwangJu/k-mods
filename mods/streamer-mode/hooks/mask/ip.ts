import { PRIORITY, type RawMatch } from './types'

const OCTET = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)'
const IPV4_RE = new RegExp(`(?<!\\d)(?:${OCTET}\\.){3}${OCTET}(?!\\d)`, 'g')

// 흔히 쓰는 모든 형태(전체형·압축형 "::")를 넓게 잡는, 잘 알려진 IPv6 정규식.
// RFC 전체를 완벽히 따르진 않지만(예: "::ffff:1.2.3.4" 같은 내장 IPv4 꼬리는
// 다루지 않음) 일반적인 주소는 충분히 잡는다 — README에 한계로 적어 둔다.
const IPV6_RE =
  /(?<![\w:])(?:(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|(?:[A-Fa-f0-9]{1,4}:){1,6}:[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,5}(?::[A-Fa-f0-9]{1,4}){1,2}|(?:[A-Fa-f0-9]{1,4}:){1,4}(?::[A-Fa-f0-9]{1,4}){1,3}|(?:[A-Fa-f0-9]{1,4}:){1,3}(?::[A-Fa-f0-9]{1,4}){1,4}|(?:[A-Fa-f0-9]{1,4}:){1,2}(?::[A-Fa-f0-9]{1,4}){1,5}|[A-Fa-f0-9]{1,4}:(?:(?::[A-Fa-f0-9]{1,4}){1,6})|:(?:(?::[A-Fa-f0-9]{1,4}){1,7}|:))(?![\w:])/g

/** 루프백·사설·링크로컬 대역은 "공인" IP가 아니므로 가리지 않는다 */
function isPublicIpv4(address: string): boolean {
  // IPV4_RE가 항상 점 3개로 나뉜 4묶음만 매치하므로 길이 4가 보장된다.
  const [a, b] = address.split('.').map(Number) as [number, number, number, number]

  if (a === 127) return false // 루프백
  if (a === 0) return false // 미지정
  if (a === 10) return false // 사설 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return false // 사설 172.16.0.0/12
  if (a === 192 && b === 168) return false // 사설 192.168.0.0/16
  if (a === 169 && b === 254) return false // 링크로컬 169.254.0.0/16

  return true
}

function isPublicIpv6(address: string): boolean {
  const lower = address.toLowerCase()

  if (lower === '::1' || lower === '::') return false // 루프백·미지정
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return false // 링크로컬 fe80::/10
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return false // 유니크로컬 fc00::/7

  return true
}

export function findPublicIps(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(IPV4_RE)) {
    if (m.index === undefined) continue
    if (!isPublicIpv4(m[0])) continue
    matches.push({ start: m.index, end: m.index + m[0].length, category: 'ip', priority: PRIORITY.ip })
  }

  for (const m of text.matchAll(IPV6_RE)) {
    if (m.index === undefined) continue
    if (!isPublicIpv6(m[0])) continue
    matches.push({ start: m.index, end: m.index + m[0].length, category: 'ip', priority: PRIORITY.ip })
  }

  return matches
}
