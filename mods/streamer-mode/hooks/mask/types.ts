/** 가릴 수 있는 항목의 종류. 라벨 문구와 우선순위를 정하는 데 쓴다. */
export type Category =
  | 'secret'
  | 'rrn'
  | 'license'
  | 'business'
  | 'card'
  | 'phone'
  | 'email'
  | 'ip'
  | 'home'
  | 'custom'

export type MaskStyle = 'label' | 'dots'

/** userConfig 값을 그대로 옮긴, 세션 동안 바뀌지 않는 설정 */
export interface MaskConfig {
  readonly maskSecrets: boolean
  readonly maskKoreanId: boolean
  readonly maskContact: boolean
  readonly maskIp: boolean
  readonly maskHome: boolean
  readonly customWords: readonly string[]
  readonly style: MaskStyle
}

/**
 * 겹침 해소 전의 원시 탐지 결과. 아직 스타일(label/dots)을 입히지 않은 상태다.
 * start/end는 원본 문자열 기준 [start, end) 범위.
 */
export interface RawMatch {
  readonly start: number
  readonly end: number
  readonly category: Category
  readonly priority: number
  /** key=value 대입문의 값 부분이면 true. 라벨 대신 "[값 가림]"/dots를 쓴다. */
  readonly isAssignmentValue?: boolean
}

/**
 * 겹치는 구간을 고를 때 쓰는 우선순위. 숫자가 클수록 먼저 채택된다.
 *
 * 일반 `Record<string, number>`로 선언하면(색인 시그니처) 프로젝트의
 * `noUncheckedIndexedAccess` 설정 때문에 `PRIORITY.phone` 같은 접근도 전부
 * `number | undefined`가 되어 버린다. `as const` 객체 리터럴로 선언해 각 키를
 * 정확히 아는 속성으로 만든다.
 */
export const PRIORITY = {
  custom: 100,
  secretAssignment: 90,
  secret: 80,
  rrn: 70,
  business: 70,
  card: 65,
  license: 60,
  phone: 55,
  email: 50,
  ip: 40,
  home: 30,
} as const
