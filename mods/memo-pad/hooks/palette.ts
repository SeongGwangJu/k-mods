// memo-pad의 색 팔레트.
//
// 원본(메인테이너 전용 모드)은 색을 전혀 쓰지 않는 무채색 패널이었다. 공개판은 다른 두 k-mods
// 모드와 같은 모양으로 palette 옵션을 두되, 솔직하게: 패널 위쪽에 "메모 N" 배지 칩 하나만
// 테마 색으로 강조한다(CONTRIBUTING.md 화면 원칙 #2의 칩 패턴). "gray"는 원본처럼 색이 아예 없다.
export type Palette = {
  badgeBg: string | undefined
  badgeFg: string | undefined
}

// 어두운 터미널 기준 파스텔 칩 (기본)
const DARK: Palette = { badgeBg: '#E3C56A', badgeFg: '#1E2127' }
const THEME: Palette = { badgeBg: 'remember', badgeFg: 'inverseText' }
const GRAY: Palette = { badgeBg: undefined, badgeFg: undefined }

export function paletteOf(name: unknown): Palette {
  return name === 'gray' ? GRAY : name === 'theme' ? THEME : DARK
}
