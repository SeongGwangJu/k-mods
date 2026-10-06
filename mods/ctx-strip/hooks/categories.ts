// 컨텍스트 분류 이름(엔진이 주는 영어 이름) → 한국어 표시.
// SHORT는 띠(band)의 범례 칩에, LONG은 /ctx가 여는 HTML 상세 리포트에 쓴다.

export const SHORT_LABEL: Record<string, string> = {
  'System prompt': '시스템',
  'System tools': '도구',
  'MCP tools': 'MCP',
  'MCP server instructions': 'MCP 안내',
  'Custom agents': '에이전트',
  'Memory files': '메모리',
  Skills: '스킬',
  Messages: '대화',
}

export const LONG_LABEL: Record<string, string> = {
  'System prompt': '시스템 프롬프트',
  'System tools': '내장 도구',
  'MCP tools': 'MCP 도구',
  'Memory files': '메모리 파일 (CLAUDE.md 등)',
  Skills: '스킬 목록',
  'Custom agents': '에이전트 목록',
  Messages: '대화',
  'MCP server instructions': 'MCP 서버 안내문',
}
