// /ctx가 여는 HTML 상세 리포트. 원본 register.mjs의 writeReport를 그대로 옮긴 것으로,
// 브라우저에서 보는 별도 페이지라 터미널 팔레트(palette.ts)를 타지 않고 원본 색을 그대로 쓴다.
import type { SessionContextBreakdown, SessionMessage } from 'claude-code'

import { describe, esc, est, k, oneLine } from './format'
import { LONG_LABEL } from './categories'

// 흰 배경 브라우저용 색(회색 터미널용 파스텔과는 다른, 원본 register.mjs의 고정 색).
const REPORT_COLOR: Record<string, string> = {
  Messages: '#166534',
  'System tools': '#1d4ed8',
  Skills: '#9a3412',
  'Memory files': '#a21caf',
  'System prompt': '#475569',
  'MCP tools': '#6d28d9',
  'Custom agents': '#0f766e',
  'MCP server instructions': '#5b21b6',
}

export type HeavyItem = { kind: string; label: string; tokens: number }

type ToolUseLike = { tool: string; input?: unknown; text?: string }

/** 대화 기록에서 글자 수로 추정해 가장 큰 항목 15개를 고른다(토큰 ≈ 글자 수 / 3.5). */
export function heaviestItems(messages: ReadonlyArray<SessionMessage>): HeavyItem[] {
  const items: HeavyItem[] = []
  for (const m of messages) {
    if (m.text) items.push({ kind: m.role === 'user' ? '내 메시지' : 'Claude 답변', label: oneLine(m.text, 90), tokens: est(m.text) })
    for (const u of (m.toolUses ?? []) as ToolUseLike[]) {
      const size = est(JSON.stringify(u.input ?? {})) + est(u.text ?? '')
      items.push({ kind: `도구 · ${u.tool}`, label: describe(u), tokens: size })
    }
  }
  return items.sort((x, y) => y.tokens - x.tokens).slice(0, 15)
}

/** HOME 아래 경로를 ~로 줄인다. */
export function shortenHome(path: string, home: string | undefined): string {
  return home && path.startsWith(home) ? '~' + path.slice(home.length) : path
}

export function buildReportHtml(b: SessionContextBreakdown, heavy: HeavyItem[], home: string | undefined): string {
  const max = b.rawMaxTokens || b.maxTokens || 1
  const used = b.categories.filter((c) => c.kind === 'used' && c.tokens > 0)
  const short = (p: string) => shortenHome(p, home)
  const pct = (n: number) => `${((n / max) * 100).toFixed(n / max >= 0.1 ? 0 : 1)}%`

  const bar = used
    .map((c) => `<span style="width:${(c.tokens / max) * 100}%;background:${REPORT_COLOR[c.name] ?? '#374151'}" title="${esc(c.name)}"></span>`)
    .join('')
  const mark = b.isAutoCompactEnabled && b.autoCompactThreshold ? `<i style="left:${(b.autoCompactThreshold / max) * 100}%"></i>` : ''

  const rows = <T,>(list: readonly T[], cols: Array<{ head: string; num?: boolean; get: (r: T) => string | number }>) =>
    list.map((r) => `<tr>${cols.map((c) => `<td${c.num ? ' class="n"' : ''}>${c.get(r)}</td>`).join('')}</tr>`).join('')
  const table = <T,>(title: string, list: readonly T[], cols: Array<{ head: string; num?: boolean; get: (r: T) => string | number }>) =>
    list.length === 0 ? '' : `<h2>${title}</h2><table><tr>${cols.map((c) => `<th${c.num ? ' class="n"' : ''}>${c.head}</th>`).join('')}</tr>${rows(list, cols)}</table>`
  const tok = { head: '토큰', num: true, get: (r: { tokens: number }) => k(r.tokens) }
  const share = { head: '창 대비', num: true, get: (r: { tokens: number }) => pct(r.tokens) }

  const mcpByServer = Object.values(
    (b.mcpTools ?? []).reduce<Record<string, { name: string; tokens: number; count: number }>>((acc, t) => {
      const key = t.serverName
      acc[key] = acc[key] ?? { name: key, tokens: 0, count: 0 }
      acc[key].tokens += t.tokens
      acc[key].count += 1
      return acc
    }, {}),
  ).sort((x, y) => y.tokens - x.tokens)

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="refresh" content="15">
<title>컨텍스트 ${b.percentage}%</title><style>
body{font:14px/1.5 -apple-system,"Apple SD Gothic Neo",sans-serif;background:#eceef2;color:#1f2937;max-width:880px;margin:24px auto;padding:0 16px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:28px 0 8px}.sub{color:#4b5563;font-size:13px}
.bar{position:relative;display:flex;height:22px;background:#c9cbd3;border-radius:6px;overflow:hidden;margin:14px 0 6px}
.bar span{display:block;height:100%}.bar i{position:absolute;top:0;bottom:0;width:2px;background:#9f1239}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden}
th,td{padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}th{background:#f3f4f6;font-weight:600;font-size:12px;color:#4b5563}
td.n,th.n{text-align:right;white-space:nowrap}.dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
code{font:12px ui-monospace,Menlo,monospace;color:#374151;word-break:break-all}
</style></head><body>
<h1>컨텍스트 ${b.percentage}% <span class="sub">${k(b.totalTokens)} / ${k(max)} · ${esc(b.model)}</span></h1>
<div class="sub">${new Date().toLocaleString('ko-KR')} 기준 · /ctx를 다시 실행하면 갱신 · 값은 추정치(/context의 summary 방식)${b.isAutoCompactEnabled && b.autoCompactThreshold ? ` · 빨간 선 = 자동 압축 지점(${k(b.autoCompactThreshold)})` : ''}</div>
<div class="bar">${bar}${mark}</div>
${table(
  '분류별',
  used,
  [
    { head: '분류', get: (r) => `<span class="dot" style="background:${REPORT_COLOR[r.name] ?? '#374151'}"></span>${esc(LONG_LABEL[r.name] ?? r.name)}` },
    tok,
    share,
  ],
)}
${table('대화에서 가장 큰 항목 (추정)', heavy, [{ head: '종류', get: (r) => esc(r.kind) }, { head: '내용', get: (r) => `<code>${esc(r.label)}</code>` }, tok])}
${table('메모리 파일', [...(b.memoryFiles ?? [])].sort((x, y) => y.tokens - x.tokens), [{ head: '경로', get: (r) => `<code>${esc(short(r.path))}</code>` }, tok])}
${table('MCP 서버', mcpByServer, [{ head: '서버', get: (r) => esc(r.name) }, { head: '도구 수', num: true, get: (r) => r.count }, tok])}
${table(
  '스킬 (상위 15)',
  [...(b.skills?.skillFrontmatter ?? [])].sort((x, y) => y.tokens - x.tokens).slice(0, 15),
  [{ head: '스킬', get: (r) => esc(r.name) }, { head: '출처', get: (r) => esc(r.pluginName ?? r.source) }, tok],
)}
${table('에이전트', [...(b.agents ?? [])].sort((x, y) => y.tokens - x.tokens), [{ head: '에이전트', get: (r) => esc(r.agentType) }, { head: '출처', get: (r) => esc(r.source) }, tok])}
</body></html>`
}
