// 순수 로직 단위 테스트. $/on 없이 hooks/lib.ts, hooks/catalog.ts의 함수만 부른다.
// 카탈로그 "항목"은 scripts/build.mjs가 나중에 바꿀 수 있으므로, 여기서는 특정
// seed 항목(예: status-ko)을 전제하지 않고 이 파일 안의 fixture만 쓴다.

import { expect, test } from 'claude-code/testing'

import type { CatalogEntry } from '../hooks/catalog'
import { CATALOG, CATEGORIES } from '../hooks/catalog'
import {
  categoryCounts,
  filterByTab,
  firstVersionToken,
  installArgsFor,
  installedNamesFrom,
  isVersionAtLeast,
  mostSensitivePermission,
  parseInstallOutcome,
  parseUninstallOutcome,
  permissionDisplayOf,
  sortFeaturedFirst,
  uninstallArgsFor,
  visibleCatalog,
  widthTierOf,
} from '../hooks/lib'

function entry(overrides: Partial<CatalogEntry>): CatalogEntry {
  return {
    name: 'fixture',
    displayName: '픽스처',
    summary: '테스트용 항목',
    category: 'tool',
    kind: 'original',
    author: 'tester',
    license: 'MIT',
    commands: [],
    requires: [],
    notes: [],
    permissions: ['화면만'],
    ...overrides,
  }
}

// --- 정렬·필터 -------------------------------------------------------------

test('featured 항목이 앞으로 온다', () => {
  const catalog = [entry({ name: 'a' }), entry({ name: 'b', featured: true }), entry({ name: 'c' })]
  expect(sortFeaturedFirst(catalog).map(item => item.name)).toEqual(['b', 'a', 'c'])
})

test('featured가 없으면 원래 순서를 지킨다 (안정 정렬)', () => {
  const catalog = [entry({ name: 'a' }), entry({ name: 'b' }), entry({ name: 'c' })]
  expect(sortFeaturedFirst(catalog).map(item => item.name)).toEqual(['a', 'b', 'c'])
})

test('탭으로 카테고리를 거른다', () => {
  const catalog = [entry({ name: 'a', category: 'tool' }), entry({ name: 'b', category: 'guard' })]
  expect(filterByTab(catalog, 'guard').map(item => item.name)).toEqual(['b'])
  expect(filterByTab(catalog, 'all').map(item => item.name)).toEqual(['a', 'b'])
})

test('카테고리별 개수를 센다', () => {
  const catalog = [entry({ category: 'tool' }), entry({ category: 'tool' }), entry({ category: 'guard' })]
  const counts = categoryCounts(catalog)
  expect(counts.all).toBe(3)
  expect(counts.tool).toBe(2)
  expect(counts.guard).toBe(1)
})

test('자기 자신 이름을 목록에서 뺀다', () => {
  const catalog = [entry({ name: 'mod-store' }), entry({ name: 'memo-pad' })]
  expect(visibleCatalog(catalog, 'mod-store').map(item => item.name)).toEqual(['memo-pad'])
})

// 실제 CATALOG/CATEGORIES에 대한 구조적(제너릭) 점검. 어떤 항목이 있는지는 가정하지
// 않고, "항상 성립해야 할 규칙"만 확인한다 — scripts/build.mjs가 CATALOG를 다시
// 만들어도 이 테스트는 그대로 통과해야 한다.
test('실제 카탈로그: 이름이 전부 유일하다', () => {
  const names = CATALOG.map(item => item.name)
  expect(new Set(names).size).toBe(names.length)
})

test('실제 카탈로그: 모든 항목의 category가 CATEGORIES 안에 있다', () => {
  const ids = new Set(CATEGORIES.map(category => category.id))
  expect(CATALOG.every(item => ids.has(item.category))).toBe(true)
})

test('실제 카탈로그: bundle 항목은 dependencies를 가진다', () => {
  const bundles = CATALOG.filter(item => item.kind === 'bundle')
  expect(bundles.every(item => Array.isArray(item.dependencies) && item.dependencies.length > 0)).toBe(true)
})

test('실제 카탈로그: featured 정렬 후에도 featured가 항상 앞쪽에 모인다', () => {
  const sorted = sortFeaturedFirst(CATALOG)
  const firstNonFeatured = sorted.findIndex(item => item.featured !== true)
  if (firstNonFeatured !== -1) {
    expect(sorted.slice(0, firstNonFeatured).every(item => item.featured === true)).toBe(true)
  }
})

// --- 폭 3단계 ---------------------------------------------------------------

test('폭 3단계: 넓음(>=100)·보통(70~99)·좁음(<70)', () => {
  expect(widthTierOf(110)).toBe('wide')
  expect(widthTierOf(100)).toBe('wide')
  expect(widthTierOf(99)).toBe('normal')
  expect(widthTierOf(70)).toBe('normal')
  expect(widthTierOf(69)).toBe('narrow')
  expect(widthTierOf(40)).toBe('narrow')
})

// --- 권한 칩 ----------------------------------------------------------------

test('가장 민감한 권한을 고른다', () => {
  expect(mostSensitivePermission(['화면만', '네트워크', '파일 읽기'])).toBe('네트워크')
  expect(mostSensitivePermission(['파일 읽기', '화면만'])).toBe('파일 읽기')
  expect(mostSensitivePermission([])).toBe('화면만')
})

test('좁은 화면에서는 권한을 하나만 보여준다', () => {
  const perms = ['화면만', '네트워크', '파일 읽기']
  expect(permissionDisplayOf(perms, 'narrow')).toEqual({ primary: '네트워크', extra: [] })
})

test('넓은 화면에서는 나머지 권한도 함께 보여준다', () => {
  const perms = ['화면만', '네트워크', '파일 읽기']
  const wide = permissionDisplayOf(perms, 'wide')
  expect(wide.primary).toBe('네트워크')
  expect(wide.extra.length).toBe(2)
  expect(wide.extra.includes('화면만')).toBe(true)
  expect(wide.extra.includes('파일 읽기')).toBe(true)
})

// --- claude 버전 비교 --------------------------------------------------------

test('claude 버전이 최소 버전 이상인지 비교한다', () => {
  expect(isVersionAtLeast('2.1.291', '2.1.287')).toBe(true)
  expect(isVersionAtLeast('2.1.287', '2.1.287')).toBe(true)
  expect(isVersionAtLeast('2.0.9', '2.1.287')).toBe(false)
  expect(isVersionAtLeast('2.1.9', '2.1.287')).toBe(false)
  expect(isVersionAtLeast('3.0.0', '2.1.287')).toBe(true)
})

test('출력 문자열에서 버전 토큰을 뽑는다', () => {
  expect(firstVersionToken('2.1.291 (Claude Code)')).toBe('2.1.291')
  expect(firstVersionToken('command not found')).toBe(null)
})

// --- 설치 명령 조립·결과 해석 -------------------------------------------------

test('설치·제거 argv를 조립한다', () => {
  expect(installArgsFor('memo-pad')).toEqual([
    'claude',
    'plugin',
    'install',
    'memo-pad@k-mods',
    '--scope',
    'user',
  ])
  expect(uninstallArgsFor('memo-pad')).toEqual([
    'claude',
    'plugin',
    'uninstall',
    'memo-pad@k-mods',
    '--scope',
    'user',
  ])
})

test('설치 결과를 해석한다: 성공·이미 설치됨·마켓플레이스 없음·실패', () => {
  expect(
    parseInstallOutcome({
      exitCode: 0,
      stdout: 'Successfully installed plugin: memo-pad@k-mods (scope: user)',
      stderr: '',
    }).kind,
  ).toBe('installed')
  expect(
    parseInstallOutcome({
      exitCode: 0,
      stdout: 'Plugin "memo-pad@k-mods" is already installed (scope: user)',
      stderr: '',
    }).kind,
  ).toBe('already')
  expect(
    parseInstallOutcome({ exitCode: 1, stdout: '', stderr: 'Marketplace "k-mods" not found' }).kind,
  ).toBe('marketplace-missing')
  expect(parseInstallOutcome({ exitCode: 1, stdout: '', stderr: 'boom' }).kind).toBe('failed')
})

test('제거 결과를 해석한다: 성공·실패', () => {
  expect(
    parseUninstallOutcome({
      exitCode: 0,
      stdout: 'Successfully uninstalled plugin: memo-pad (scope: user)',
      stderr: '',
    }).kind,
  ).toBe('uninstalled')
  expect(parseUninstallOutcome({ exitCode: 1, stdout: '', stderr: 'boom' }).kind).toBe('failed')
})

// --- 설치 상태 읽기 -----------------------------------------------------------

test('enabledPlugins에서 설치된 이름을 읽는다', () => {
  const catalog = [entry({ name: 'memo-pad' }), entry({ name: 'ctx-strip' })]
  const settings = { enabledPlugins: { 'memo-pad@k-mods': true, 'ctx-strip@k-mods': false } }
  const names = installedNamesFrom(settings, catalog)
  expect(names.has('memo-pad')).toBe(true)
  expect(names.has('ctx-strip')).toBe(false)
})

test('enabledPlugins이 없으면 빈 집합을 돌려준다', () => {
  const catalog = [entry({ name: 'memo-pad' })]
  expect(installedNamesFrom({}, catalog).size).toBe(0)
})
