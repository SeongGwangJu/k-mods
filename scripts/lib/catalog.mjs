// 카탈로그 공용 정의: 분류, 종류, 권한 라벨, registry 읽기
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const MARKETPLACE = 'k-mods'
export const OWNER = 'SeongGwangJu'
export const REPO = `${OWNER}/k-mods`
export const REPO_URL = `https://github.com/${REPO}`

export const CATEGORIES = [
  { id: 'localize', label: '한국어화', emoji: '🇰🇷', en: 'Korean UI', desc: '메뉴·설정·안내 문구를 한국어로 바꿔요' },
  { id: 'theme', label: '테마', emoji: '🎨', en: 'Themes', desc: '대화·도구 호출 결과·표·코드의 표시 방식을 바꿔요' },
  { id: 'animation', label: '애니메이션', emoji: '🐾', en: 'Animation & fun', desc: 'Claude가 일하는 동안 애니메이션이나 게임을 표시해요' },
  { id: 'statusline', label: '상태줄', emoji: '📊', en: 'Status lines', desc: '컨텍스트·사용량·작업 상태를 항상 표시해요' },
  { id: 'tool', label: '도구', emoji: '🧰', en: 'Tools', desc: '패널·명령으로 직접 쓰는 기능이에요' },
  { id: 'automation', label: '자동화', emoji: '⚡', en: 'Automation', desc: '알림, 대화 전환, 프롬프트 입력을 자동으로 처리해요' },
  { id: 'guard', label: '지킴이', emoji: '🛡️', en: 'Guards', desc: '위험한 명령을 차단하고 민감한 정보를 가려요' },
  { id: 'integration', label: '연동', emoji: '🔗', en: 'Integrations', desc: 'GitHub·Linear 같은 외부 서비스의 상태와 작업을 Claude Code에 표시해요' },
  { id: 'bundle', label: '묶음', emoji: '📦', en: 'Bundles', desc: '여러 mod를 한 번에 설치해요' },
]

export const KINDS = {
  original: { label: '오리지널', en: 'k-mods original' },
  patched: { label: '한국 수정판', en: 'k-mods patched' },
  upstream: { label: '원본', en: 'upstream' },
  bundle: { label: '묶음', en: 'bundle' },
}

// 위험한 것부터. validate가 알려 주는 hooks/calls로 판정한다.
export const PERMISSIONS = [
  { id: 'network', label: '네트워크', emoji: '🌐', en: 'network', calls: [/^\$\.http\./, /^\$\.mcp\./] },
  { id: 'process', label: '프로그램 실행', emoji: '⚙️', en: 'runs programs', calls: [/^\$\.process\./] },
  { id: 'fs-write', label: '파일 쓰기', emoji: '✏️', en: 'writes files', calls: [/^\$\.fs\.write\b/] },
  { id: 'model', label: '모델 호출', emoji: '🤖', en: 'calls a model', calls: [/^\$\.model\./] },
  { id: 'gate', label: '도구 호출 제어', emoji: '🛡️', en: 'can hold/answer tool calls', hooks: [/^tool\.(call|check)\b/] },
  { id: 'prompt', label: '프롬프트 입력', emoji: '💬', en: 'submits prompts', calls: [/^\$\.prompt\.(submit|fill)\b/] },
  { id: 'chat', label: '대화 읽기', emoji: '👀', en: 'reads conversation', calls: [/^\$\.session\.messages\b/], hooks: [/^prompt\.submit\b/, /^turn\.complete\b/, /^session\.append\b/, /component=(AssistantMessage|UserMessage|ToolResult|ToolUse|ToolGroup|CommandOutput)/] },
  { id: 'env', label: '환경·설정 읽기', emoji: '🔑', en: 'reads env/settings', calls: [/^\$\.env\./, /^\$\.settings\./] },
  { id: 'fs-read', label: '파일 읽기', emoji: '📂', en: 'reads files', calls: [/^\$\.fs\.(read|list|exists|stat|ancestors)\b/] },
  { id: 'message', label: '세션 메시지', emoji: '📨', en: 'messages sessions', calls: [/^\$\.session\.send\b/] },
  { id: 'sound', label: '소리', emoji: '🔊', en: 'plays sound', calls: [/^\$\.audio\./] },
]
export const SCREEN_ONLY = { id: 'screen', label: '화면만', emoji: '🎨', en: 'UI only' }

export function permissionsFrom({ hooks = [], calls = [] }) {
  const ids = []
  for (const p of PERMISSIONS) {
    const byCall = (p.calls ?? []).some((re) => calls.some((c) => re.test(c)))
    const byHook = (p.hooks ?? []).some((re) => hooks.some((h) => re.test(h)))
    if (byCall || byHook) ids.push(p.id)
  }
  return ids
}

export function permissionMeta(id) {
  return PERMISSIONS.find((p) => p.id === id) ?? SCREEN_ONLY
}

export function loadRegistry() {
  const dir = path.join(ROOT, 'registry')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  const entries = files.map((f) => {
    const entry = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    entry.__file = `registry/${f}`
    return entry
  })
  return entries
}

export function loadAudit(name) {
  const file = path.join(ROOT, 'registry', '_audit', `${name}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const ORDER = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]))
const KIND_ORDER = { original: 0, patched: 1, upstream: 2, bundle: 3 }

export function sortEntries(entries) {
  return [...entries].sort(
    (a, b) =>
      (ORDER[a.category] ?? 99) - (ORDER[b.category] ?? 99) ||
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) ||
      a.name.localeCompare(b.name),
  )
}

// 원본 저장소 링크 (커밋 고정)
export function upstreamUrl(entry) {
  const up = entry.upstream
  if (!up) return null
  const sub = up.path ? `/tree/${up.commit}/${up.path}` : `/tree/${up.commit}`
  return `https://github.com/${up.repo}${sub}`
}

export function entryHomepage(entry) {
  if (entry.homepage) return entry.homepage
  if (typeof entry.source === 'string') return `${REPO_URL}/tree/main/${entry.source.replace(/^\.\//, '')}`
  return upstreamUrl(entry)
}
