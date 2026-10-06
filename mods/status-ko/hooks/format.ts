// status-ko의 표시용 순수 함수. $를 받지 않아 테스트하기 쉽다.

export const MODE_LABELS: Record<string, string> = {
  thinking: '생각 중',
  requesting: '요청 중',
  responding: '작성 중',
  'tool-input': '도구 준비 중',
  'tool-use': '도구 실행 중',
}

export const TOOL_LABELS: Record<string, string> = {
  Bash: '실행 중',
  Read: '읽는 중',
  Edit: '수정 중',
  MultiEdit: '수정 중',
  Write: '작성 중',
  NotebookEdit: '수정 중',
  Grep: '검색 중',
  Glob: '찾는 중',
  WebFetch: '웹 읽는 중',
  WebSearch: '웹 검색 중',
  Agent: '에이전트 실행 중',
  Skill: '스킬 실행 중',
  ToolSearch: '도구 불러오는 중',
}

/**
 * 도구 호출 이벤트에서 "지금 무엇을 대상으로" 하는지 짧게 뽑아낸다.
 * file_path/notebook_path/path(패턴 없을 때)는 파일 이름만, url은 프로토콜을 떼고,
 * 나머지(pattern·query·subagent_type·skill·command·description)는 통째로 쓴다.
 */
export function targetOf(e: Record<string, unknown>): string {
  const pick =
    e.file_path ??
    e.notebook_path ??
    e.path ??
    e.pattern ??
    e.query ??
    e.url ??
    e.subagent_type ??
    e.skill ??
    e.command ??
    e.description
  if (pick === undefined || pick === null) return ''
  let text = String(pick)
  if (e.file_path || e.notebook_path || (e.path && !e.pattern)) {
    text = text.split('/').filter(Boolean).pop() ?? text
  }
  if (e.url) text = text.replace(/^https?:\/\//, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text.length > 40 ? text.slice(0, 39) + '…' : text
}

/** 밀리초를 한국식("1시간 12분", "3분 4초", "19초")으로. */
export function duration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}초`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}분 ${s % 60}초`
  return `${Math.floor(m / 60)}시간 ${m % 60}분`
}

/** 자정 이후 밀리초를 "HH:MM"으로. */
export function clockTime(epochMs: number): string {
  const d = new Date(epochMs)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** claude-opus-5-5 → Opus 5.5. 이미 사람이 읽기 좋은 이름이면 꼬리의 괄호만 뗀다. */
export function modelName(id: unknown): string {
  const m = String(id).match(/claude-([a-z]+)-(\d+)-(\d+)/i)
  if (!m) return String(id).replace(/\s*\(.*\)$/, '')
  const [, kind, major, minor] = m as [string, string, string, string]
  return `${kind.charAt(0).toUpperCase()}${kind.slice(1)} ${major}.${minor}`
}
