// ctx-strip의 표시용 순수 함수. $를 받지 않아 테스트하기 쉽다.

/** 1200 → "1.2k", 125000 → "125k". 1000 밑이면 그대로. */
export function k(n: number): string {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
}

/** HTML에 안전하게 넣을 수 있게 &<>" 를 이스케이프한다. */
export function esc(text: unknown): string {
  return String(text ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch)
}

/** 공백을 한 칸으로 줄이고, n자를 넘으면 자른 뒤 … 를 붙인다. */
export function oneLine(text: unknown, n: number): string {
  const t = String(text).replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

/** 글자 수 ÷ 3.5 반올림 — 토큰 수 추정. */
export function est(text: unknown): number {
  return Math.round(String(text).length / 3.5)
}

/** 도구 호출 한 줄 설명(대화 기록에서 가장 큰 항목 표에 쓴다). */
export function describe(toolUse: { tool: string; input?: unknown }): string {
  const i = (toolUse.input ?? {}) as Record<string, unknown>
  const target = i.file_path ?? i.path ?? i.command ?? i.pattern ?? i.url ?? i.description ?? i.query ?? i.prompt ?? ''
  return oneLine(target, 90) || toolUse.tool
}

/** 밀리초를 "M:SS" 시계 표시로(서브에이전트 경과 시간). */
export function clockMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
