// $를 받지 않는 순수 함수만 모아 둔 파일. register.ts가 이 함수들을 가져다 쓴다.
// 테스트하기 쉽도록 $, UI 엘리먼트, 부수효과를 전혀 참조하지 않는다.

import { MARKETPLACE, PERMISSION_ORDER, type CatalogEntry, type CategoryId } from './catalog'

// ---------------------------------------------------------------------------
// 카탈로그: 필터·정렬·숨김
// ---------------------------------------------------------------------------

/** 상점 자신(selfName)을 목록에서 뺀 카탈로그를 돌려준다. */
export function visibleCatalog(
  catalog: readonly CatalogEntry[],
  selfName: string,
): CatalogEntry[] {
  return catalog.filter(entry => entry.name !== selfName)
}

/** 탭(카테고리)으로 거른다. 'all'이면 전체를 그대로 돌려준다. */
export function filterByTab(
  catalog: readonly CatalogEntry[],
  tab: CategoryId | 'all',
): CatalogEntry[] {
  return tab === 'all' ? [...catalog] : catalog.filter(entry => entry.category === tab)
}

/** featured 항목을 앞으로 보낸다. 나머지는 원래 순서를 지킨다(안정 정렬). */
export function sortFeaturedFirst(catalog: readonly CatalogEntry[]): CatalogEntry[] {
  return [...catalog].sort((a, b) => Number(b.featured === true) - Number(a.featured === true))
}

/** 탭 버튼에 보일 개수. 'all' 키에 전체 개수가 들어간다. */
export function categoryCounts(
  catalog: readonly CatalogEntry[],
): Record<'all' | CategoryId, number> {
  const counts = { all: catalog.length } as Record<'all' | CategoryId, number>
  for (const entry of catalog) {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1
  }
  return counts
}

// ---------------------------------------------------------------------------
// 폭 3단계
// ---------------------------------------------------------------------------

export type WidthTier = 'wide' | 'normal' | 'narrow'

/** 넓음(>=100) · 보통(70~99) · 좁음(<70). CONTRIBUTING.md 화면 원칙 3번. */
export function widthTierOf(columns: number): WidthTier {
  if (columns >= 100) return 'wide'
  if (columns >= 70) return 'normal'
  return 'narrow'
}

// ---------------------------------------------------------------------------
// 권한 칩: 가장 민감한 권한을 고른다
// ---------------------------------------------------------------------------

// 민감도 높은 순. 네트워크 > 명령 실행 > 파일 쓰기 > 대화 읽기 > ... > 화면만(가장 약함).
// 민감한 것부터. scripts/build.mjs가 catalog.ts에 생성하는 순서를 그대로 쓴다
export const PERMISSION_PRIORITY: readonly string[] = PERMISSION_ORDER

function permissionRank(permission: string): number {
  const index = PERMISSION_PRIORITY.indexOf(permission)
  return index === -1 ? PERMISSION_PRIORITY.length : index
}

/** 목록 중 가장 민감한 권한 라벨 하나를 돌려준다. 비어 있으면 '화면만'. */
export function mostSensitivePermission(permissions: readonly string[]): string {
  if (permissions.length === 0) return '화면만'
  return permissions.reduce((best, current) =>
    permissionRank(current) < permissionRank(best) ? current : best,
  )
}

export type PermissionDisplay = {
  primary: string
  extra: string[]
}

/**
 * 폭 단계에 맞춰 보여줄 권한을 고른다. 좁은 화면에서는 가장 민감한 것 하나만,
 * 넓은 화면에서는 전부, 보통 화면에서는 최대 2개까지 추가로 보여준다.
 */
export function permissionDisplayOf(
  permissions: readonly string[],
  tier: WidthTier,
): PermissionDisplay {
  if (permissions.length === 0) return { primary: '화면만', extra: [] }
  const primary = mostSensitivePermission(permissions)
  if (tier === 'narrow') return { primary, extra: [] }
  const rest = permissions.filter(permission => permission !== primary)
  const maxExtra = tier === 'wide' ? rest.length : Math.min(rest.length, 2)
  return { primary, extra: rest.slice(0, maxExtra) }
}

// ---------------------------------------------------------------------------
// kind 칩 라벨·색
// ---------------------------------------------------------------------------

export type ChipColor = 'claude' | 'warning' | 'subtle' | 'success' | 'permission' | 'error' | 'suggestion'

export const KIND_LABEL: Record<CatalogEntry['kind'], string> = {
  upstream: '원본',
  patched: '수정판',
  original: '오리지널',
  bundle: '묶음',
}

export const KIND_COLOR: Record<CatalogEntry['kind'], ChipColor> = {
  upstream: 'subtle',
  patched: 'warning',
  original: 'claude',
  bundle: 'success',
}

// ---------------------------------------------------------------------------
// claude 버전 비교
// ---------------------------------------------------------------------------

export const MIN_CLAUDE_VERSION = '2.1.287'

/** "2.1.291" 같은 점 구분 숫자 버전을 비교 가능한 튜플로 바꾼다. */
export function parseVersionTuple(version: string): number[] {
  return version
    .trim()
    .split('.')
    .map(part => {
      const n = Number.parseInt(part, 10)
      return Number.isFinite(n) ? n : 0
    })
}

/** version이 min 이상이면 true. 자리 수가 달라도(2.1 vs 2.1.0) 부족한 자리는 0으로 본다. */
export function isVersionAtLeast(version: string, min: string): boolean {
  const v = parseVersionTuple(version)
  const m = parseVersionTuple(min)
  const length = Math.max(v.length, m.length)
  for (let i = 0; i < length; i++) {
    const a = v[i] ?? 0
    const b = m[i] ?? 0
    if (a !== b) return a > b
  }
  return true
}

/** "2.1.291 (Claude Code)" 같은 출력에서 첫 x.y.z 버전 토큰을 뽑는다. */
export function firstVersionToken(text: string): string | null {
  const match = /(\d+\.\d+\.\d+)/.exec(text)
  return match?.[1] ?? null
}

// ---------------------------------------------------------------------------
// 설치 명령 조립
// ---------------------------------------------------------------------------

export function installArgsFor(name: string): string[] {
  return ['claude', 'plugin', 'install', `${name}@${MARKETPLACE}`, '--scope', 'user']
}

export function uninstallArgsFor(name: string): string[] {
  return ['claude', 'plugin', 'uninstall', `${name}@${MARKETPLACE}`, '--scope', 'user']
}

export function commandLineFor(argv: readonly string[]): string {
  return argv.join(' ')
}

export const MARKETPLACE_ADD_COMMAND = `/plugin marketplace add SeongGwangJu/${MARKETPLACE}`

// ---------------------------------------------------------------------------
// $.process.run 결과 해석
// ---------------------------------------------------------------------------

export type ProcessResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export type InstallOutcome =
  | { kind: 'installed'; message: string }
  | { kind: 'already'; message: string }
  | { kind: 'marketplace-missing'; message: string }
  | { kind: 'failed'; message: string }

function isMarketplaceMissing(text: string): boolean {
  return /marketplace/i.test(text) && /not found/i.test(text)
}

export function parseInstallOutcome(result: ProcessResult): InstallOutcome {
  const text = `${result.stdout}\n${result.stderr}`.trim()
  if (isMarketplaceMissing(text)) return { kind: 'marketplace-missing', message: text }
  if (result.exitCode === 0) {
    return /already installed/i.test(text)
      ? { kind: 'already', message: text }
      : { kind: 'installed', message: text }
  }
  return { kind: 'failed', message: text || `종료 코드 ${result.exitCode}` }
}

export type UninstallOutcome =
  | { kind: 'uninstalled'; message: string }
  | { kind: 'failed'; message: string }

export function parseUninstallOutcome(result: ProcessResult): UninstallOutcome {
  const text = `${result.stdout}\n${result.stderr}`.trim()
  if (result.exitCode === 0) return { kind: 'uninstalled', message: text }
  return { kind: 'failed', message: text || `종료 코드 ${result.exitCode}` }
}

// ---------------------------------------------------------------------------
// 설치 상태 읽기
// ---------------------------------------------------------------------------

/**
 * $.settings.read()가 돌려준 값에서 enabledPlugins를 읽어, 카탈로그 중
 * "<name>@k-mods": true 로 적힌 이름만 설치됨으로 본다.
 */
export function installedNamesFrom(
  settings: Record<string, unknown>,
  catalog: readonly CatalogEntry[],
): Set<string> {
  const result = new Set<string>()
  const enabled = settings.enabledPlugins
  if (enabled === null || typeof enabled !== 'object') return result
  const map = enabled as Record<string, unknown>
  for (const entry of catalog) {
    if (map[`${entry.name}@${MARKETPLACE}`] === true) result.add(entry.name)
  }
  return result
}

// ---------------------------------------------------------------------------
// 배너(오류 안내)
// ---------------------------------------------------------------------------

export type Banner =
  | { kind: 'none' }
  | { kind: 'no-marketplace'; addCommand: string }
  | { kind: 'error'; text: string; copyText: string }

export function errorBannerOf(argv: readonly string[], message: string): Banner {
  const short = message.length > 160 ? `${message.slice(0, 160)}…` : message
  return {
    kind: 'error',
    text: short === '' ? '명령이 실패했어요.' : `명령이 실패했어요: ${short}`,
    copyText: commandLineFor(argv),
  }
}

export function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}
