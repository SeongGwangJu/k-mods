#!/usr/bin/env node
// registry/*.json 하나하나가 카탈로그 항목이다. 이 스크립트가 거기서 아래를 만든다.
//
//   .claude-plugin/marketplace.json          마켓플레이스 (사용자가 /plugin marketplace add 로 받는 파일)
//   bundles/<name>/.claude-plugin/plugin.json 묶음 설치 플러그인
//   docs/mods/<name>.md                       mod별 안내 페이지
//   README.md, README.en.md 의 생성 구간      <!-- BEGIN:x --> … <!-- END:x -->
//   mods/mod-store/hooks/catalog.ts           모드 상점이 보여 주는 목록
//
//   node scripts/build.mjs           생성
//   node scripts/build.mjs --check   생성물이 최신인지만 확인 (CI)
import fs from 'node:fs'
import path from 'node:path'
import {
  CATEGORIES,
  KINDS,
  MARKETPLACE,
  OWNER,
  PERMISSIONS,
  REPO,
  REPO_URL,
  ROOT,
  SCREEN_ONLY,
  entryHomepage,
  loadAudit,
  loadRegistry,
  permissionMeta,
  sortEntries,
  upstreamUrl,
} from './lib/catalog.mjs'

const CHECK = process.argv.includes('--check')
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version
const outputs = new Map() // 상대 경로 → 내용
const problems = []

// ---- 항목 검사 ---------------------------------------------------------------

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/
const SHA_RE = /^[0-9a-f]{40}$/
const REQUIRED = ['name', 'displayName', 'summary', 'summaryEn', 'category', 'kind', 'source', 'author', 'license', 'review']

function validateEntry(e, names) {
  const where = e.__file
  for (const k of REQUIRED) if (e[k] === undefined) problems.push(`${where}: '${k}'가 없어요`)
  if (!NAME_RE.test(e.name ?? '')) problems.push(`${where}: name 형식이 틀렸어요`)
  if (`registry/${e.name}.json` !== where) problems.push(`${where}: 파일 이름과 name이 달라요`)
  if (!CATEGORIES.some((c) => c.id === e.category)) problems.push(`${where}: category '${e.category}'를 몰라요`)
  if (!KINDS[e.kind]) problems.push(`${where}: kind '${e.kind}'를 몰라요`)
  if ((e.summary ?? '').length > 120) problems.push(`${where}: summary가 120자를 넘어요`)
  if ((e.displayName ?? '').length > 40) problems.push(`${where}: displayName이 40자를 넘어요`)
  const src = e.source
  if (e.kind === 'upstream') {
    if (typeof src !== 'object' || !['github', 'git-subdir'].includes(src.source)) problems.push(`${where}: upstream은 github/git-subdir source여야 해요`)
    else if (!SHA_RE.test(src.sha ?? '')) problems.push(`${where}: upstream source에는 40자 sha가 필요해요 (검토한 커밋 고정)`)
    if (!e.upstream) problems.push(`${where}: upstream 정보가 없어요`)
  }
  if (e.kind === 'original' || e.kind === 'patched') {
    if (src !== `./mods/${e.name}`) problems.push(`${where}: source는 ./mods/${e.name} 여야 해요`)
    else if (!fs.existsSync(path.join(ROOT, 'mods', e.name, '.claude-plugin', 'plugin.json'))) problems.push(`${where}: mods/${e.name}/.claude-plugin/plugin.json 이 없어요`)
    if (e.kind === 'patched' && !e.upstream) problems.push(`${where}: 수정판은 upstream(원본) 정보가 필요해요`)
  }
  if (e.kind === 'bundle') {
    if (src !== `./bundles/${e.name}`) problems.push(`${where}: source는 ./bundles/${e.name} 여야 해요`)
    if (!Array.isArray(e.dependencies) || e.dependencies.length === 0) problems.push(`${where}: 묶음에는 dependencies가 필요해요`)
    for (const d of e.dependencies ?? []) if (!names.has(d)) problems.push(`${where}: dependencies의 '${d}'가 카탈로그에 없어요`)
  }
  const r = e.review ?? {}
  for (const k of ['date', 'by', 'claudeCode', 'method']) if (r[k] === undefined) problems.push(`${where}: review.${k}가 없어요`)
}

// ---- 데이터 모으기 -------------------------------------------------------------

const raw = loadRegistry()
const names = new Set(raw.map((e) => e.name))
for (const e of raw) validateEntry(e, names)
const entries = sortEntries(raw)
const byName = new Map(entries.map((e) => [e.name, e]))

function permissionsOf(entry, seen = new Set()) {
  if (entry.kind === 'bundle') {
    const ids = new Set()
    for (const d of entry.dependencies ?? []) {
      if (seen.has(d) || !byName.has(d)) continue
      seen.add(d)
      for (const id of permissionsOf(byName.get(d), seen) ?? []) ids.add(id)
    }
    return PERMISSIONS.map((p) => p.id).filter((id) => ids.has(id))
  }
  const audit = loadAudit(entry.name)
  return audit ? audit.permissions : null
}

function permLabels(ids) {
  if (ids === null) return ['검토 전']
  if (ids.length === 0) return [SCREEN_ONLY.label]
  return ids.map((id) => permissionMeta(id).label)
}

function sourceLabel(e, lang = 'ko') {
  const author = e.author?.url ? `[${e.author.name}](${e.author.url})` : e.author?.name ?? ''
  if (e.kind === 'original') return lang === 'ko' ? '🇰🇷 k-mods' : '🇰🇷 k-mods'
  if (e.kind === 'patched') return lang === 'ko' ? `🔧 ${author} 원작 · 한국 수정판` : `🔧 ${author} · patched`
  if (e.kind === 'bundle') return lang === 'ko' ? '📦 묶음' : '📦 bundle'
  return author
}

// ---- marketplace.json --------------------------------------------------------

const marketplace = {
  $schema: 'https://json.schemastore.org/claude-code-marketplace.json',
  name: MARKETPLACE,
  owner: { name: OWNER, url: `https://github.com/${OWNER}` },
  description: '한국어로 고르고 한 줄로 설치하는 Claude Code mods 모음. 검토한 커밋만 설치돼요.',
  version: VERSION,
  plugins: entries.map((e) => {
    const cat = CATEGORIES.find((c) => c.id === e.category)
    const plugin = {
      name: e.name,
      source: e.source,
      displayName: e.displayName,
      description: e.summary,
      category: cat ? cat.label : e.category,
      tags: e.tags ?? [],
      author: e.author,
      homepage: entryHomepage(e),
      license: e.license,
    }
    if (e.upstream) plugin.repository = `https://github.com/${e.upstream.repo}`
    else plugin.repository = REPO_URL
    if (e.kind === 'bundle') plugin.dependencies = e.dependencies
    return plugin
  }),
}
// JSON Schema Store에 없는 주소라 넣지 않는다 (편집기 경고 방지)
delete marketplace.$schema
outputs.set('.claude-plugin/marketplace.json', JSON.stringify(marketplace, null, 2) + '\n')

// ---- 묶음 플러그인 -------------------------------------------------------------

for (const e of entries.filter((x) => x.kind === 'bundle')) {
  const manifest = {
    name: e.name,
    version: VERSION,
    description: e.summary,
    author: e.author,
    homepage: entryHomepage(e),
    repository: REPO_URL,
    license: e.license,
    dependencies: e.dependencies,
  }
  outputs.set(`bundles/${e.name}/.claude-plugin/plugin.json`, JSON.stringify(manifest, null, 2) + '\n')
  outputs.set(
    `bundles/${e.name}/README.md`,
    [
      `# ${e.displayName}`,
      '',
      e.summary,
      '',
      '이 플러그인에는 코드가 없어요. 설치하면 아래 mod가 함께 설치돼요.',
      '',
      ...e.dependencies.map((d) => `- [${byName.get(d)?.displayName ?? d}](../../docs/mods/${d}.md) \`${d}\``),
      '',
      '```',
      `/plugin marketplace add ${REPO}`,
      `/plugin install ${e.name}@${MARKETPLACE}`,
      '```',
      '',
    ].join('\n'),
  )
}

// ---- README 생성 구간 ----------------------------------------------------------

function catalogTables(lang) {
  const lines = []
  for (const cat of CATEGORIES) {
    const list = entries.filter((e) => e.category === cat.id)
    if (list.length === 0) continue
    lines.push(`### ${cat.emoji} ${lang === 'ko' ? cat.label : cat.en}`, '')
    if (lang === 'ko' && cat.desc) lines.push(cat.desc, '')
    if (lang === 'ko') lines.push('| mod | 무엇을 해 주나요 | 출처 |', '| --- | --- | --- |')
    else lines.push('| mod | What it does | Source |', '| --- | --- | --- |')
    for (const e of list) {
      const title = lang === 'ko' ? e.displayName : e.name
      const star = e.featured ? ' ⭐' : ''
      const doc = `docs/mods/${e.name}.md`
      const summary = lang === 'ko' ? e.summary : e.summaryEn
      lines.push(`| [**${title}**](${doc})${star}<br>\`${e.name}\` | ${summary} | ${sourceLabel(e, lang)} |`)
    }
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}

function featured(lang) {
  const list = entries.filter((e) => e.featured)
  if (list.length === 0) return ''
  const rows = list.map((e) => {
    const summary = lang === 'ko' ? e.summary : e.summaryEn
    const title = lang === 'ko' ? e.displayName : e.name
    const img = e.preview ? `<br><img src="${e.preview}" alt="${title}" width="420">` : ''
    return `| [**${title}**](docs/mods/${e.name}.md)<br>\`/plugin install ${e.name}@${MARKETPLACE}\`${img} | ${summary} |`
  })
  const head = lang === 'ko' ? ['| 먼저 써 보세요 | |', '| --- | --- |'] : ['| Start here | |', '| --- | --- |']
  return [...head, ...rows].join('\n')
}

const COUNT = String(entries.filter((e) => e.kind !== 'bundle').length)
const sections = {
  ko: { count: COUNT, featured: featured('ko'), catalog: catalogTables('ko') },
  en: { count: COUNT, featured: featured('en'), catalog: catalogTables('en') },
}

function fillMarkers(file, values) {
  const full = path.join(ROOT, file)
  if (!fs.existsSync(full)) return
  let text = fs.readFileSync(full, 'utf8')
  for (const [key, value] of Object.entries(values)) {
    const re = new RegExp(`(<!-- BEGIN:${key} -->)[\\s\\S]*?(<!-- END:${key} -->)`, 'g')
    const inline = key === 'count'
    text = text.replace(re, (_, a, b) => (inline ? `${a}${value}${b}` : `${a}\n${value}\n${b}`))
  }
  outputs.set(file, text)
}
fillMarkers('README.md', sections.ko)
fillMarkers('README.en.md', sections.en)

// ---- docs/mods/<name>.md -----------------------------------------------------

function surfaceText(list) {
  if (!list || list.length === 0) return '터미널'
  return list.map((s) => (s === 'terminal' ? '터미널' : '데스크톱 앱')).join(' · ')
}

function docPage(e) {
  const cat = CATEGORIES.find((c) => c.id === e.category)
  const perms = permissionsOf(e)
  const audit = e.kind === 'bundle' ? null : loadAudit(e.name)
  const author = e.author?.url ? `[${e.author.name}](${e.author.url})` : e.author?.name
  const up = upstreamUrl(e)
  const out = [`# ${e.displayName}`, '', `> ${e.summary}`, '']
  if (e.preview) out.push(`<img src="${/^https?:/.test(e.preview) ? e.preview : '../../' + e.preview}" alt="${e.displayName}" width="640">`, '')
  out.push('| | |', '| --- | --- |')
  out.push(`| 설치 이름 | \`${e.name}\` |`)
  out.push(`| 종류 | ${KINDS[e.kind].label}${e.kind === 'upstream' ? ' (검토한 커밋 고정)' : ''} |`)
  out.push(`| 만든 사람 | ${author} |`)
  out.push(`| 라이선스 | ${e.license} |`)
  if (up) out.push(`| 원본 | [${e.upstream.repo}${e.upstream.path ? '/' + e.upstream.path : ''} @ \`${e.upstream.commit.slice(0, 7)}\`](${up}) |`)
  out.push(`| 유형 | ${cat ? `${cat.emoji} ${cat.label}` : e.category} |`)
  out.push(`| 보이는 곳 | ${surfaceText(e.surfaces)} |`)
  out.push(`| 명령어 | ${e.commands && e.commands.length ? e.commands.map((c) => `\`${c}\``).join(' ') : '없음 (설치하면 알아서 동작해요)'} |`)
  if (e.requires && e.requires.length) out.push(`| 준비물 | ${e.requires.join(', ')} |`)
  out.push(`| 권한 | ${permLabels(perms).map((l, i) => `${perms && perms.length ? permissionMeta(perms[i]).emoji : perms === null ? '⏳' : SCREEN_ONLY.emoji} ${l}`).join(' · ')} |`)
  out.push('')
  out.push('## 설치', '', 'Claude Code 안에서:', '', '```', `/plugin marketplace add ${REPO}`, `/plugin install ${e.name}@${MARKETPLACE}`, '```', '')
  out.push('터미널에서:', '', '```sh', `claude plugin marketplace add ${REPO}`, `claude plugin install ${e.name}@${MARKETPLACE}`, '```', '')
  out.push('이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.', '')
  if (e.kind === 'bundle') {
    out.push('## 함께 설치되는 mod', '')
    for (const d of e.dependencies) out.push(`- [${byName.get(d)?.displayName ?? d}](${d}.md) \`${d}\`: ${byName.get(d)?.summary ?? ''}`)
    out.push('')
  }
  if (e.settings && e.settings.length) {
    out.push('## 추천 설정', '', '`/plugin configure ' + e.name + '@' + MARKETPLACE + '` 또는 `/config`에서 바꿀 수 있어요.', '', '| 설정 | 값 | 이유 |', '| --- | --- | --- |')
    for (const s of e.settings) out.push(`| \`${s.key}\` | \`${JSON.stringify(s.value)}\` | ${s.why} |`)
    out.push('')
  }
  if (e.conflicts && e.conflicts.length) {
    out.push('## 함께 쓸 때', '')
    for (const c of e.conflicts) out.push(`- **${byName.get(c.with)?.displayName ?? c.with}** (\`${c.with}\`): ${c.note}`)
    out.push('')
  }
  if (e.notes && e.notes.length) {
    out.push('## 알아 둘 점', '')
    for (const n of e.notes) out.push(`- ${n}`)
    out.push('')
  }
  out.push('## 이 mod가 내 컴퓨터에서 하는 일', '')
  if (e.kind === 'bundle') {
    out.push('코드가 없는 묶음이에요. 위 mod들의 권한을 합치면 아래와 같아요.', '')
  }
  if (perms === null) out.push('아직 자동 검사 전이에요.', '')
  else if (perms.length === 0) out.push(`- ${SCREEN_ONLY.emoji} **화면만**: 파일·프로그램·네트워크·모델을 쓰지 않고 Claude Code 화면만 바꿔요.`, '')
  else {
    for (const id of perms) {
      const p = permissionMeta(id)
      let detail = ''
      if (audit && id === 'network' && audit.urls?.length) detail = ` 코드에 있는 주소: ${audit.urls.slice(0, 6).map((u) => `\`${u}\``).join(', ')}`
      if (audit && id === 'process' && audit.programs?.length) detail = ` 실행하는 프로그램: ${audit.programs.map((p2) => `\`${p2}\``).join(', ')}`
      out.push(`- ${p.emoji} **${p.label}**.${detail}`)
    }
    out.push('')
  }
  if (audit) {
    out.push('<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>', '')
    out.push(`- 검사한 Claude Code: ${audit.auditedWith}`)
    out.push(`- 결과: ${audit.validate.success ? '통과' : '실패'}`)
    out.push(`- 다루는 이벤트: ${audit.hooks.map((h) => `\`${h}\``).join(', ') || '없음'}`)
    out.push(`- 부르는 API: ${audit.calls.map((c) => `\`${c}\``).join(', ') || '없음'}`)
    if (audit.envReads?.length) out.push(`- 읽는 환경 변수: ${audit.envReads.map((x) => `\`${x}\``).join(', ')}`)
    out.push('', '</details>', '')
  }
  const r = e.review
  const methods = { validate: '정적 검사', 'code-read': '코드 읽기', 'unit-test': '테스트', 'live-session': '실제 세션 확인' }
  out.push('## 검토 기록', '')
  out.push(`- ${r.date} · ${r.by} · Claude Code ${r.claudeCode} · ${r.method.map((m) => methods[m] ?? m).join(', ')}`)
  if (e.kind === 'upstream') out.push('- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.')
  out.push('')
  if (r.findings && r.findings.length) {
    out.push(`<details><summary>검토 노트 ${r.findings.length}개 (코드를 읽으며 확인한 것)</summary>`, '')
    for (const f of r.findings) out.push(`- ${f}`)
    out.push('', '</details>', '')
  }
  out.push('## 더 보기', '')
  if (e.kind === 'original' || e.kind === 'patched') out.push(`- [mod 설명서](../../mods/${e.name}/README.md)`)
  if (e.kind === 'bundle') out.push(`- [묶음 설명](../../bundles/${e.name}/README.md)`)
  if (up) out.push(`- [원본 저장소](${up})`)
  out.push(`- [카탈로그로 돌아가기](../../README.md#mod-목록)`)
  out.push('')
  return out.join('\n')
}

for (const e of entries) outputs.set(`docs/mods/${e.name}.md`, docPage(e))

// ---- 모드 상점 목록 ------------------------------------------------------------

if (fs.existsSync(path.join(ROOT, 'mods', 'mod-store', 'hooks'))) {
  const items = entries.map((e) => {
      const item = {
        name: e.name,
        displayName: e.displayName,
        summary: e.summary,
        category: e.category,
        kind: e.kind,
        author: e.author?.name ?? '',
        license: e.license,
        homepage: entryHomepage(e) ?? undefined,
        commands: e.commands ?? [],
        requires: e.requires ?? [],
        notes: e.notes ?? [],
        permissions: permLabels(permissionsOf(e)),
      }
      if (e.featured) item.featured = true
      if (e.kind === 'bundle') item.dependencies = e.dependencies
      return item
    })
  const ts = [
    '// 생성 파일: node scripts/build.mjs 가 registry/*.json 으로 만든다. 직접 고치지 말 것.',
    '',
    "export type CategoryId = 'korean' | 'look' | 'fun' | 'meter' | 'safety' | 'workflow' | 'integration' | 'bundle'",
    "export type Kind = 'upstream' | 'patched' | 'original' | 'bundle'",
    'export type CatalogEntry = {',
    '  name: string',
    '  displayName: string',
    '  summary: string',
    '  category: CategoryId',
    '  kind: Kind',
    '  author: string',
    '  license: string',
    '  homepage?: string',
    '  commands: string[]',
    '  requires: string[]',
    '  notes: string[]',
    '  permissions: string[]',
    '  featured?: boolean',
    '  dependencies?: string[]',
    '}',
    '',
    `export const MARKETPLACE = '${MARKETPLACE}'`,
    `export const CATALOG_VERSION = '${VERSION}'`,
    '',
    '// 상점 자신은 목록에서 숨긴다',
    "export const SELF_NAME = 'mod-store'",
    '',
    '// 권한 라벨, 민감한 것부터',
    `export const PERMISSION_ORDER: readonly string[] = ${JSON.stringify([...PERMISSIONS.map((p) => p.label), SCREEN_ONLY.label])}`,
    '',
    `export const CATEGORIES: { id: CategoryId; label: string }[] = ${JSON.stringify(CATEGORIES.map((c) => ({ id: c.id, label: c.label })), null, 2)}`,
    '',
    `export const CATALOG: CatalogEntry[] = ${JSON.stringify(items, null, 2)}`,
    '',
  ].join('\n')
  outputs.set('mods/mod-store/hooks/catalog.ts', ts)
}

// ---- 쓰기 / 확인 -------------------------------------------------------------

if (problems.length) {
  console.error('registry 문제:\n' + problems.map((p) => '  - ' + p).join('\n'))
  process.exit(1)
}

let stale = 0
for (const [rel, content] of outputs) {
  const full = path.join(ROOT, rel)
  const current = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null
  if (current === content) continue
  if (CHECK) {
    console.error(`최신이 아님: ${rel}`)
    stale++
  } else {
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
    console.log(`썼어요: ${rel}`)
  }
}
// 카탈로그에서 빠진 항목의 문서 정리
const docDir = path.join(ROOT, 'docs', 'mods')
if (fs.existsSync(docDir)) {
  for (const f of fs.readdirSync(docDir)) {
    if (f.endsWith('.md') && !byName.has(f.replace(/\.md$/, ''))) {
      if (CHECK) {
        console.error(`남은 문서: docs/mods/${f}`)
        stale++
      } else {
        fs.unlinkSync(path.join(docDir, f))
        console.log(`지웠어요: docs/mods/${f}`)
      }
    }
  }
}
if (CHECK && stale) {
  console.error(`\n생성물이 최신이 아니에요. node scripts/build.mjs 를 돌려 주세요.`)
  process.exit(1)
}
console.log(`${CHECK ? '확인 완료' : '완료'}: 항목 ${entries.length}개`)
