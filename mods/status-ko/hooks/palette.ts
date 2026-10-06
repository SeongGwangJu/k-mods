// status-ko의 색 팔레트.
//
// 원본(메인테이너 전용 모드)은 회색 배경(#bdbec6)에서 읽히도록 고른 고정 색을 썼다.
// 공개판 기본값("dark")은 어두운 터미널 기준 파스텔이고, "theme"은 테마 키로 사용자의 테마를 따라가며(밝은 터미널),
// "gray"를 고르면 원본과 똑같은 16진수 색으로 돌아간다.
//
// theme 쪽은 색상(hue)이 아니라 "의미"로 테마 키를 골랐다:
//   aborted(사용자가 중단시킴, 실패 아님) → warning
//   failed(모델 오류·거절, 실제 실패)   → error
// 그래서 원본에서 더 붉던 ABORT 색이 theme 모드에서는 error가 아니라 warning에 대응한다.
export type Palette = {
  mark: string
  text: string
  subtle: string
  aborted: string
  failed: string
}

// 어두운 터미널 기준 파스텔 (기본). ctx-strip과 같은 톤을 쓴다.
const DARK: Palette = {
  mark: '#C3B1F5',
  text: '#E8EAED',
  subtle: '#8A909B',
  aborted: '#F0C987',
  failed: '#F28B9B',
}

const THEME: Palette = {
  mark: 'claude',
  text: 'text',
  subtle: 'subtle',
  aborted: 'warning',
  failed: 'error',
}

const GRAY: Palette = {
  mark: '#6a52d0',
  text: '#374151',
  subtle: '#5b6070',
  aborted: '#9f1239',
  failed: '#7c4a03',
}

export function paletteOf(name: unknown): Palette {
  return name === 'gray' ? GRAY : name === 'theme' ? THEME : DARK
}
