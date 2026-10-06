// ctx-strip의 색 팔레트.
//
// 기본값("dark")은 어두운 터미널 기준 파스텔이다. 분류끼리 색이 겹치지 않게 원본
// statusline-ctx.py의 파스텔을 그대로 쓰고, 빈 구간은 배경보다 살짝 밝은 옅은 홈으로 둔다.
// "theme"은 Claude Code 테마 키를 따라가고(밝은 터미널용), "gray"는 회색 배경(#bdbec6)용 원본 색이다.
// HTML 상세 리포트(report.ts)는 브라우저에서 보는 별도 페이지라 팔레트를 타지 않고
// 원본 색을 그대로 쓴다 — 화면 원칙(테마 키)은 터미널·Desktop UI에만 해당된다.
export type CtxPalette = {
  category: Record<string, string>
  fallback: readonly string[]
  track: string
  mark: string
  chipInk: string
  dim: string
  bright: string
  warn: string
  danger: string
  /** 서브에이전트 줄의 "⎇ N" 표시 색(원본 AGENT). */
  agentAccent: string
  /** 서브에이전트 줄에서 끝난 항목 색(원본 DONE). */
  agentDone: string
}

// 원본 파스텔. dark와 gray가 함께 쓴다.
const PASTEL: Record<string, string> = {
  'System prompt': '#86A0DC',
  'System tools': '#8EC5CC',
  'MCP tools': '#9F8FF2',
  'MCP server instructions': '#B9AEF5',
  'Custom agents': '#A8C98A',
  'Memory files': '#E3C56A',
  Skills: '#E8A6C4',
  Messages: '#DE8E62',
}

const DARK: CtxPalette = {
  category: PASTEL,
  fallback: ['#C8C8C8', '#9CD3B0', '#D9B38C'],
  track: '#3A3E47',
  mark: '#F28B9B',
  chipInk: '#1E2127',
  dim: '#8A909B',
  bright: '#E8EAED',
  warn: '#F0C987',
  danger: '#F28B9B',
  agentAccent: '#C3B1F5',
  agentDone: '#A8C98A',
}

const THEME: CtxPalette = {
  category: {
    Messages: 'claude',
    'System tools': 'suggestion',
    Skills: 'warning',
    'Memory files': 'remember',
    'System prompt': 'inactive',
    'MCP tools': 'permission',
    'Custom agents': 'success',
    'MCP server instructions': 'planMode',
  },
  fallback: ['subtle'],
  track: 'inactive',
  mark: 'error',
  chipInk: 'inverseText',
  dim: 'subtle',
  bright: 'text',
  warn: 'warning',
  danger: 'error',
  agentAccent: 'claude',
  agentDone: 'success',
}

// 원본 statusline-ctx.py의 PASTEL/TRACK/MARK/CHIP_INK/DIM/BRIGHT/WARN/DANGER 그대로.
const GRAY: CtxPalette = {
  category: PASTEL,
  fallback: ['#C8C8C8', '#9CD3B0', '#D9B38C'],
  track: '#AEB0BA',
  mark: '#9F1239',
  chipInk: '#1F232E',
  dim: '#5B6070',
  bright: '#111827',
  warn: '#7C4A03',
  danger: '#9F1239',
  agentAccent: '#5B21B6',
  agentDone: '#166534',
}

export type PaletteName = 'dark' | 'theme' | 'gray'

export function paletteName(name: unknown): PaletteName {
  return name === 'gray' || name === 'theme' ? name : 'dark'
}

export function paletteOf(name: unknown): CtxPalette {
  const n = paletteName(name)
  return n === 'gray' ? GRAY : n === 'theme' ? THEME : DARK
}

/** 분류 이름의 색. 모르는 분류면 fallback을 순서대로 돌려 쓴다. */
export function categoryColor(palette: CtxPalette, name: string, index: number): string {
  return palette.category[name] ?? palette.fallback[index % palette.fallback.length] ?? palette.dim
}
