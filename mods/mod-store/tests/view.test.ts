// hooks/view.ts의 paneView()를 $ 없이 직접 부르는 순수 렌더링 테스트.
// 진짜 UI 엘리먼트 대신, {type, props}만 돌려주는 가짜 Kit으로 트리를 조립해서
// 중첩된 children을 펼쳐(flatten) 텍스트·버튼을 찾는다.
//
// 카탈로그는 전부 이 파일 안의 fixture를 쓴다 — scripts/build.mjs가 나중에 실제
// 카탈로그 항목을 바꿔도 이 테스트는 영향을 받지 않는다.

import { expect, test } from 'claude-code/testing'

import type { CatalogEntry } from '../hooks/catalog'
import type { Banner } from '../hooks/lib'
import { type Kit, type StoreActions, type StoreModel, paneView } from '../hooks/view'

type Node = { type: string; props: Record<string, unknown> }

function fakeKit(): Kit {
  const make = (type: string) => (props: Record<string, unknown>) => ({ type, props })
  return { Box: make('Box'), Text: make('Text'), Button: make('Button'), Link: make('Link') } as unknown as Kit
}

function flatten(node: unknown): Node[] {
  if (node === null || node === undefined) return []
  if (Array.isArray(node)) return node.flatMap(flatten)
  if (typeof node !== 'object') return []
  const typed = node as Node
  const children = (typed.props as { children?: unknown }).children
  return [typed, ...flatten(children)]
}

function textOf(node: Node): string {
  const children = (node.props as { children?: unknown }).children
  if (Array.isArray(children)) {
    return children.map(child => (typeof child === 'string' ? child : '')).join('')
  }
  return typeof children === 'string' ? children : ''
}

function entry(overrides: Partial<CatalogEntry>): CatalogEntry {
  return {
    name: 'fixture',
    displayName: '픽스처 모드',
    summary: '요약 문장입니다',
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

function noopActions(): StoreActions {
  return {
    setTab: () => {},
    toggleDetail: () => {},
    install: () => {},
    uninstall: () => {},
    applyReload: () => {},
    copyCommand: () => {},
    dismissBanner: () => {},
  }
}

function baseModel(overrides: Partial<StoreModel>): StoreModel {
  return {
    tab: 'all',
    expanded: null,
    installed: new Set(),
    busy: new Set(),
    banner: { kind: 'none' },
    justInstalled: null,
    tier: 'wide',
    ...overrides,
  }
}

function textsOf(tree: unknown): string[] {
  return flatten(tree)
    .filter(node => node.type === 'Text')
    .map(textOf)
}

function buttonsOf(tree: unknown): Node[] {
  return flatten(tree).filter(node => node.type === 'Button')
}

test('넓은 화면에서는 요약을 보여준다', () => {
  const tree = paneView(fakeKit(), [entry({})], baseModel({ tier: 'wide' }), noopActions())
  expect(textsOf(tree).some(text => text.includes('요약 문장입니다'))).toBe(true)
})

test('좁은 화면에서는 요약을 생략한다', () => {
  const tree = paneView(fakeKit(), [entry({})], baseModel({ tier: 'narrow' }), noopActions())
  expect(textsOf(tree).some(text => text.includes('요약 문장입니다'))).toBe(false)
})

test('kind 칩 라벨 네 가지가 모두 표시된다', () => {
  const catalog = [
    entry({ name: 'a', kind: 'original' }),
    entry({ name: 'b', kind: 'patched' }),
    entry({ name: 'c', kind: 'upstream' }),
    entry({ name: 'd', kind: 'bundle' }),
  ]
  const texts = textsOf(paneView(fakeKit(), catalog, baseModel({}), noopActions()))
  expect(texts.some(text => text.includes('오리지널'))).toBe(true)
  expect(texts.some(text => text.includes('수정판'))).toBe(true)
  expect(texts.some(text => text.includes('원본'))).toBe(true)
  expect(texts.some(text => text.includes('묶음'))).toBe(true)
})

test('설치된 항목은 "설치됨 · 제거" 버튼을 보여준다', () => {
  const tree = paneView(fakeKit(), [entry({ name: 'a' })], baseModel({ installed: new Set(['a']) }), noopActions())
  expect(buttonsOf(tree).some(button => button.props.label === '설치됨 · 제거')).toBe(true)
})

test('설치 안 된 항목은 "설치" 버튼을 보여준다', () => {
  const tree = paneView(fakeKit(), [entry({ name: 'a' })], baseModel({}), noopActions())
  expect(buttonsOf(tree).some(button => button.props.label === '설치')).toBe(true)
})

test('설치·제거 중에는 버튼 글자가 바뀐다', () => {
  const tree = paneView(fakeKit(), [entry({ name: 'a' })], baseModel({ busy: new Set(['a']) }), noopActions())
  expect(buttonsOf(tree).some(button => button.props.label === '설치 중…')).toBe(true)
})

test('자세히를 펼치면 제작자·라이선스·명령이 보인다', () => {
  const tree = paneView(
    fakeKit(),
    [entry({ name: 'a', author: '지은이', license: 'Apache-2.0', commands: ['/foo'] })],
    baseModel({ expanded: 'a' }),
    noopActions(),
  )
  const texts = textsOf(tree)
  expect(texts.some(text => text.includes('지은이') && text.includes('Apache-2.0'))).toBe(true)
  expect(texts.some(text => text.includes('/foo'))).toBe(true)
})

test('접혀 있으면 자세히 내용이 안 보인다', () => {
  const tree = paneView(
    fakeKit(),
    [entry({ name: 'a', author: '지은이' })],
    baseModel({ expanded: null }),
    noopActions(),
  )
  expect(textsOf(tree).some(text => text.includes('지은이'))).toBe(false)
})

test('마켓플레이스 없음 배너에 복사 버튼과 추가 명령이 보인다', () => {
  const banner: Banner = { kind: 'no-marketplace', addCommand: '/plugin marketplace add SeongGwangJu/k-mods' }
  const tree = paneView(fakeKit(), [entry({})], baseModel({ banner }), noopActions())
  expect(buttonsOf(tree).some(button => button.props.key === 'banner-copy')).toBe(true)
  expect(textsOf(tree).some(text => text.includes('/plugin marketplace add SeongGwangJu/k-mods'))).toBe(true)
})

test('오류 배너에 복사·닫기 버튼이 보인다', () => {
  const banner: Banner = { kind: 'error', text: '명령이 실패했어요: boom', copyText: 'claude plugin install a@k-mods' }
  const tree = paneView(fakeKit(), [entry({})], baseModel({ banner }), noopActions())
  const buttons = buttonsOf(tree)
  expect(buttons.some(button => button.props.key === 'banner-copy')).toBe(true)
  expect(buttons.some(button => button.props.key === 'banner-dismiss')).toBe(true)
})

test('배너가 없으면 복사 버튼도 없다', () => {
  const tree = paneView(fakeKit(), [entry({})], baseModel({ banner: { kind: 'none' } }), noopActions())
  expect(buttonsOf(tree).some(button => button.props.key === 'banner-copy')).toBe(false)
})

test('방금 설치했으면 "지금 적용" 버튼이 보인다', () => {
  const tree = paneView(fakeKit(), [entry({ name: 'a' })], baseModel({ justInstalled: 'a' }), noopActions())
  expect(buttonsOf(tree).some(button => button.props.key === 'apply-reload')).toBe(true)
})

test('방금 설치한 게 없으면 "지금 적용" 버튼도 없다', () => {
  const tree = paneView(fakeKit(), [entry({ name: 'a' })], baseModel({ justInstalled: null }), noopActions())
  expect(buttonsOf(tree).some(button => button.props.key === 'apply-reload')).toBe(false)
})

test('항목이 없는 카테고리는 안내 문구를 보여준다', () => {
  const tree = paneView(fakeKit(), [entry({ category: 'tool' })], baseModel({ tab: 'guard' }), noopActions())
  expect(textsOf(tree).some(text => text.includes('이 카테고리에는 아직 항목이 없어요'))).toBe(true)
})

test('제목과 바닥글이 항상 보인다', () => {
  const tree = paneView(fakeKit(), [entry({})], baseModel({}), noopActions())
  const texts = textsOf(tree)
  expect(texts.some(text => text.includes('k-mods 모드 상점'))).toBe(true)
  expect(texts.some(text => text.includes('Tab 이동 · Enter 누르기 · Esc 닫기'))).toBe(true)
})
