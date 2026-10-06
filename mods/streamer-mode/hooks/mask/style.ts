import type { Category, MaskStyle } from './types'

/** "label" 스타일에서 쓰는 분류별 한글 이름 (대괄호 라벨의 가운데 글자) */
const CATEGORY_NAME: Record<Category, string> = {
  secret: '토큰',
  rrn: '주민번호',
  license: '면허번호',
  business: '사업자번호',
  card: '카드번호',
  phone: '전화번호',
  email: '이메일',
  ip: 'IP',
  home: '',
  custom: '',
}

/** dots 스타일에서 쓰는 고정 문자열 (일반 가림) */
const DOTS = '●●●●●●'

/** 홈 폴더 사용자 이름은 스타일과 무관하게 항상 이 모양으로 가린다 (예: /Users/●●●) */
const HOME_DOTS = '●●●'

/**
 * 탐지된 구간 하나를 대체할 문구를 만든다.
 *
 * @param category 탐지된 분류
 * @param style 사용자가 고른 가림 모양
 * @param isAssignmentValue `key=value` 대입문의 값 부분이면 true (키는 그대로 두고 값만 이 문구로 바꾼다)
 */
export function replacementFor(
  category: Category,
  style: MaskStyle,
  isAssignmentValue: boolean,
): string {
  if (category === 'home') {
    return HOME_DOTS
  }

  if (isAssignmentValue) {
    return style === 'dots' ? DOTS : '[값 가림]'
  }

  if (style === 'dots') {
    return DOTS
  }

  if (category === 'custom') {
    return '[가림]'
  }

  return `[${CATEGORY_NAME[category]} 가림]`
}
