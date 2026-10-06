#!/usr/bin/env node
// 카탈로그 항목의 코드를 받아 `claude plugin validate --json`으로 정적 분석하고
// 이 mod가 내 컴퓨터에서 하는 일(권한 라벨)을 registry/_audit/<name>.json 에 기록한다.
//
//   node scripts/audit.mjs              전체
//   node scripts/audit.mjs spinner ...  일부
//
// 외부 항목은 registry에 고정된 커밋(sha)을 .cache/audit/ 에 받아서 본다. 코드는 실행하지 않는다.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, loadRegistry, permissionsFrom } from './lib/catalog.mjs'

const CC = path.join(ROOT, 'scripts', 'cc.sh')
const CACHE = path.join(ROOT, '.cache', 'audit')
const OUT = path.join(ROOT, 'registry', '_audit')

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, ...opts })
}

function checkout(url, sha, subPath) {
  const slug = url.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '').replace('/', '__')
  const dest = path.join(CACHE, `${slug}@${sha.slice(0, 12)}`)
  if (!fs.existsSync(path.join(dest, '.git'))) {
    fs.mkdirSync(dest, { recursive: true })
    sh('git', ['init', '-q'], { cwd: dest })
    sh('git', ['remote', 'add', 'origin', url], { cwd: dest })
    sh('git', ['fetch', '-q', '--depth', '1', 'origin', sha], { cwd: dest })
    sh('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: dest })
  }
  return subPath ? path.join(dest, subPath) : dest
}

function pluginDir(entry) {
  const src = entry.source
  if (typeof src === 'string') return path.join(ROOT, src)
  if (src.source === 'github') return checkout(`https://github.com/${src.repo}.git`, src.sha)
  if (src.source === 'git-subdir') {
    const url = /^https?:/.test(src.url) ? src.url : `https://github.com/${src.url}.git`
    return checkout(url, src.sha, src.path)
  }
  throw new Error(`알 수 없는 source: ${JSON.stringify(src)}`)
}

// "a, b{x=1, y=2}, c" → ["a", "b{x=1, y=2}", "c"]
function splitTop(list) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of list) {
    if (ch === '{' || ch === '[' || ch === '(') depth++
    if (ch === '}' || ch === ']' || ch === ')') depth--
    if (ch === ',' && depth === 0) {
      if (cur.trim()) out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

function parseValidate(json) {
  const result = { success: Boolean(json.success), errors: [], warnings: [], hooks: [], calls: [], envReads: [], envWrites: [], ungatedCatch: [] }
  const blocks = [json.manifest, ...(json.contents ?? [])].filter(Boolean)
  for (const b of blocks) {
    result.errors.push(...(b.errors ?? []).map(String))
    result.warnings.push(...(b.warnings ?? []).map(String))
    for (const note of b.notes ?? []) {
      const m = String(note).match(/^\S+\s+(hooks|calls|env reads|env writes|gating hook without \.catch):\s*(.*)$/)
      if (!m) continue
      const items = splitTop(m[2]).map((s) => s.replace(/\s*\(via [^)]*\)$/, ''))
      if (m[1] === 'hooks') result.hooks.push(...items)
      if (m[1] === 'calls') result.calls.push(...items)
      if (m[1] === 'env reads') result.envReads.push(...items)
      if (m[1] === 'env writes') result.envWrites.push(...items)
      if (m[1].startsWith('gating')) result.ungatedCatch.push(...items)
    }
  }
  for (const k of ['hooks', 'calls', 'envReads', 'envWrites', 'ungatedCatch']) result[k] = [...new Set(result[k])].sort()
  return result
}

function sourceFiles(dir) {
  const files = []
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      if (name === 'node_modules' || name === '.git' || name === 'types' || name === 'tests') continue
      const p = path.join(d, name)
      const st = fs.statSync(p)
      if (st.isDirectory()) walk(p)
      else if (/\.(m|c)?(j|t)sx?$/.test(name) && !/\.test\./.test(name) && !name.endsWith('.d.ts')) files.push(p)
    }
  }
  const hooks = path.join(dir, 'hooks')
  if (fs.existsSync(hooks)) walk(hooks)
  return files
}

function scanSource(dir) {
  const commands = new Set()
  const urls = new Set()
  const programs = new Set()
  for (const file of sourceFiles(dir)) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/\$\.command\.register\(\s*\{[^}]*?name:\s*['"`]([^'"`]+)['"`]/gs)) commands.add('/' + m[1])
    for (const m of text.matchAll(/https?:\/\/[^\s'"`)<>\\]+/g)) {
      const u = m[0].replace(/[.,;]+$/, '')
      if (!/^https?:\/\/(github\.com|code\.claude\.com|docs\.anthropic\.com|www\.apache\.org|opensource\.org)\b/.test(u)) urls.add(u)
    }
    for (const m of text.matchAll(/\$\.process\.(?:run|spawn)\(\s*\[\s*['"`]([^'"`]+)['"`]/g)) programs.add(m[1])
  }
  return { commands: [...commands].sort(), urls: [...urls].sort().slice(0, 30), programs: [...programs].sort() }
}

function findLicense(dir) {
  let d = dir
  for (let i = 0; i < 4; i++) {
    const hit = fs.existsSync(d) ? fs.readdirSync(d).find((f) => /^(LICEN[CS]E|COPYING)(\.|$)/i.test(f)) : null
    if (hit) return path.relative(dir, path.join(d, hit)) || hit
    const up = path.dirname(d)
    if (up === d || !up.startsWith(CACHE) && !up.startsWith(ROOT)) break
    d = up
  }
  return null
}

const wanted = new Set(process.argv.slice(2))
const entries = loadRegistry().filter((e) => e.kind !== 'bundle' && (wanted.size === 0 || wanted.has(e.name)))
fs.mkdirSync(OUT, { recursive: true })
let failed = 0

for (const entry of entries) {
  process.stdout.write(`· ${entry.name} … `)
  try {
    const dir = pluginDir(entry)
    let raw
    try {
      raw = sh(CC, ['plugin', 'validate', '--json', dir])
    } catch (err) {
      raw = err.stdout ?? ''
    }
    const start = raw.indexOf('{')
    const parsed = parseValidate(JSON.parse(raw.slice(start)))
    const scan = scanSource(dir)
    const audit = {
      name: entry.name,
      source: typeof entry.source === 'string' ? entry.source : { ...entry.source },
      auditedWith: sh(CC, ['--version']).trim().split(' ')[0],
      validate: { success: parsed.success, errors: parsed.errors, warnings: parsed.warnings },
      hooks: parsed.hooks,
      calls: parsed.calls,
      envReads: parsed.envReads,
      envWrites: parsed.envWrites,
      gatingWithoutCatch: parsed.ungatedCatch,
      commands: scan.commands,
      programs: scan.programs,
      urls: scan.urls,
      license: findLicense(dir),
      permissions: permissionsFrom(parsed),
    }
    fs.writeFileSync(path.join(OUT, `${entry.name}.json`), JSON.stringify(audit, null, 2) + '\n')
    console.log(parsed.success ? `통과 · ${audit.permissions.join(', ') || '화면만'}` : `검증 실패: ${parsed.errors.join(' / ')}`)
    if (!parsed.success) failed++
  } catch (err) {
    failed++
    console.log(`오류: ${err.message.split('\n')[0]}`)
  }
}
process.exit(failed ? 1 : 0)
