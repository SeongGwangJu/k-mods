import { applyMatches, resolveOverlaps } from '../../hooks/mask/engine'
import type { MaskStyle, RawMatch } from '../../hooks/mask/types'

/**
 * detector가 돌려준 원시 매치 목록을 곧장 문자열로 바꾼다. 캐시·카운터 없이
 * 탐지 + 겹침 해소 + 스타일 적용만 거치는, 테스트 전용 가벼운 파이프라인이다.
 */
export function maskWith(text: string, matches: RawMatch[], style: MaskStyle = 'label'): string {
  return applyMatches(text, resolveOverlaps(matches), style)
}
