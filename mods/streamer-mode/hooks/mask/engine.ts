import type { MaskCache } from './cache'
import { findContacts } from './contact'
import { cheapHash } from './hash'
import { findCustomWords } from './custom-words'
import { findPublicIps } from './ip'
import { findHomePaths } from './home'
import { findKoreanIds } from './korean-id'
import { findSecrets } from './secrets'
import type { SessionCounter } from './session-counter'
import { replacementFor } from './style'
import type { MaskConfig, RawMatch } from './types'

/** 설정에서 켜진 그룹만 돌려 원시 탐지 결과를 모은다 */
function collectRawMatches(text: string, config: MaskConfig): RawMatch[] {
  const all: RawMatch[] = []

  if (config.maskSecrets) all.push(...findSecrets(text))
  if (config.maskKoreanId) all.push(...findKoreanIds(text))
  if (config.maskContact) all.push(...findContacts(text))
  if (config.maskIp) all.push(...findPublicIps(text))
  if (config.maskHome) all.push(...findHomePaths(text))
  if (config.customWords.length > 0) all.push(...findCustomWords(text, config.customWords))

  return all
}

/**
 * 겹치는 구간 중 하나만 고른다: 우선순위가 높은 것, 같으면 더 긴 것, 그래도
 * 같으면 앞에 있는 것을 채택한다. (예: key=value의 값이 동시에 sk-ant- 토큰
 * 모양이면 "대입문" 쪽이 우선순위가 높아 "[값 가림]"으로 남는다.)
 */
export function resolveOverlaps(matches: readonly RawMatch[]): RawMatch[] {
  const sorted = [...matches].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    const lenDiff = b.end - b.start - (a.end - a.start)
    if (lenDiff !== 0) return lenDiff
    return a.start - b.start
  })

  const accepted: RawMatch[] = []
  for (const m of sorted) {
    const overlaps = accepted.some(a => m.start < a.end && a.start < m.end)
    if (!overlaps) accepted.push(m)
  }

  return accepted.sort((a, b) => a.start - b.start)
}

/** 확정된 구간들을 원본 문자열에 적용해 가려진 문자열을 만든다 */
export function applyMatches(text: string, matches: readonly RawMatch[], style: MaskConfig['style']): string {
  if (matches.length === 0) {
    return text
  }

  let out = ''
  let cursor = 0

  for (const m of matches) {
    out += text.slice(cursor, m.start)
    out += replacementFor(m.category, style, m.isAssignmentValue === true)
    cursor = m.end
  }
  out += text.slice(cursor)

  return out
}

/** 위험을 각오하고 실제 처리를 하는 부분. 절대 원본 값을 담지 않는다. */
function maskPlain(text: string, config: MaskConfig, counter: SessionCounter): string {
  const matches = resolveOverlaps(collectRawMatches(text, config))

  for (const m of matches) {
    // 원본 값 자체가 아니라 해시만 기록한다 (개수 집계용)
    counter.record(`${m.category}:${cheapHash(text.slice(m.start, m.end))}`)
  }

  return applyMatches(text, matches, config.style)
}

/**
 * 화면에 보여줄 문자열을 가린다. 같은 문자열은 캐시에서 바로 돌려주고, 탐지
 * 로직이 예기치 않게 실패하면(버그) 원문을 그대로 보여주는 대신 전체를 가린
 * 자리표시자를 돌려준다 — 가리는 기능의 버그가 비밀을 노출시키는 것보다는,
 * 엉뚱한 텍스트까지 가리는 쪽이 안전하다.
 *
 * @param text 화면에 그릴 원본 문자열
 * @param config 세션 동안 고정된 설정 (userConfig에서 만든 값)
 * @param cache 원문→결과 캐시 (register.ts가 모듈 수준에서 하나만 만들어 재사용)
 * @param counter 이번 세션에 가린 서로 다른 항목 수를 세는 카운터
 */
export function maskForDisplay(
  text: string,
  config: MaskConfig,
  cache: MaskCache,
  counter: SessionCounter,
): string {
  if (text === '') {
    return text
  }

  const cached = cache.get(text)
  if (cached !== undefined) {
    return cached
  }

  let result: string
  try {
    result = maskPlain(text, config, counter)
  } catch {
    // 가리는 로직 자체가 깨지면 "실패 열림"(원문 노출)이 아니라 "실패 닫힘"
    // (전부 가림)으로 답한다. 원문은 어디에도 남기지 않는다.
    result = '[가림: 표시 오류]'
  }

  cache.set(text, result)
  return result
}
