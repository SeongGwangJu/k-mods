// 패널 화면을 순수하게 조립하는 함수들. $를 전혀 참조하지 않는다 — register.ts가
// $.ui.resolve(e)로 얻은 엘리먼트(kit)와 모델, 콜백(actions)만 건네준다.

import type {
  BoxProps,
  ButtonProps,
  ElementConstructor,
  LinkProps,
  RenderElement,
  RenderSurface,
  TextProps,
} from 'claude-code'

import { CATEGORIES, type CatalogEntry, type CategoryId } from './catalog'
import {
  type Banner,
  KIND_COLOR,
  KIND_LABEL,
  categoryCounts,
  filterByTab,
  permissionDisplayOf,
  sortFeaturedFirst,
  type WidthTier,
} from './lib'

export type Kit = {
  Box: ElementConstructor<BoxProps>
  Text: ElementConstructor<TextProps>
  Button: ElementConstructor<ButtonProps>
  Link: ElementConstructor<LinkProps>
}

export type StoreModel = {
  tab: CategoryId | 'all'
  expanded: string | null
  installed: ReadonlySet<string>
  busy: ReadonlySet<string>
  banner: Banner
  justInstalled: string | null
  tier: WidthTier
}

export type StoreActions = {
  setTab: (tab: CategoryId | 'all') => void
  toggleDetail: (name: string) => void
  install: (name: string) => void
  uninstall: (name: string) => void
  applyReload: () => void
  copyCommand: (text: string, surface: RenderSurface) => void
  dismissBanner: () => void
}

/** 상점 패널 전체를 그린다. catalog는 이미 자기 자신(mod-store)을 뺀 목록이어야 한다. */
export function paneView(
  kit: Kit,
  catalog: readonly CatalogEntry[],
  model: StoreModel,
  actions: StoreActions,
): RenderElement {
  const { Box, Text } = kit
  const counts = categoryCounts(catalog)
  const shown = filterByTab(sortFeaturedFirst(catalog), model.tab)

  return Box({
    flexDirection: 'column',
    children: [
      Text({ bold: true, children: ['k-mods 모드 상점'] }),
      ...bannerRows(kit, model, actions),
      ...justInstalledRows(kit, model, actions),
      Text({ children: [' '] }),
      tabsRow(kit, model, actions, counts),
      Text({ children: [' '] }),
      ...(shown.length === 0
        ? [Text({ dimColor: true, children: ['이 카테고리에는 아직 항목이 없어요.'] })]
        : shown.flatMap(entry => entryRows(kit, entry, model, actions))),
      Text({ dimColor: true, children: ['Tab 이동 · Enter 누르기 · Esc 닫기'] }),
    ],
  })
}

function bannerRows(kit: Kit, model: StoreModel, actions: StoreActions): RenderElement[] {
  const { Box, Text, Button } = kit
  if (model.banner.kind === 'none') return []

  // 세로로 쌓는다: row로 두면 좁은 화면에서 Text마다 따로 줄바꿈되어 글자가 뒤섞인다
  // (실제 세션에서 확인한 문제 — 한 줄짜리 문장이 Box 폭에 맞춰 조각나 보였다).
  if (model.banner.kind === 'no-marketplace') {
    const banner = model.banner
    return [
      Box({
        flexDirection: 'column',
        children: [
          Text({ color: 'warning', children: ['마켓플레이스가 아직 없어요.'] }),
          Box({
            flexDirection: 'row',
            columnGap: 1,
            children: [
              Text({ dimColor: true, children: [banner.addCommand] }),
              Button({
                key: 'banner-copy',
                label: '복사',
                plain: true,
                onPress: press => actions.copyCommand(banner.addCommand, press.surface),
              }),
            ],
          }),
        ],
      }),
    ]
  }

  const banner = model.banner
  return [
    Box({
      flexDirection: 'column',
      children: [
        Text({ color: 'error', children: [banner.text] }),
        Box({
          flexDirection: 'row',
          columnGap: 2,
          children: [
            Button({
              key: 'banner-copy',
              label: '복사',
              plain: true,
              onPress: press => actions.copyCommand(banner.copyText, press.surface),
            }),
            Button({ key: 'banner-dismiss', label: '닫기', plain: true, onPress: () => actions.dismissBanner() }),
          ],
        }),
      ],
    }),
  ]
}

function justInstalledRows(kit: Kit, model: StoreModel, actions: StoreActions): RenderElement[] {
  if (model.justInstalled === null) return []
  const { Box, Text, Button } = kit
  return [
    Box({
      flexDirection: 'row',
      columnGap: 1,
      children: [
        Text({ color: 'success', children: ['설치했어요.'] }),
        Button({ key: 'apply-reload', label: '지금 적용', onPress: () => actions.applyReload() }),
      ],
    }),
  ]
}

function tabsRow(
  kit: Kit,
  model: StoreModel,
  actions: StoreActions,
  counts: Record<'all' | CategoryId, number>,
): RenderElement {
  const { Box, Button } = kit
  const tabs: { id: CategoryId | 'all'; label: string; hotkey: string }[] = [
    { id: 'all', label: '전체', hotkey: '0' },
    ...CATEGORIES.map((category, index) => ({
      id: category.id,
      label: category.label,
      hotkey: String(index + 1),
    })),
  ]

  return Box({
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 2,
    children: tabs.map(item =>
      Button({
        // plain + hotkey가 이미 "숫자: 라벨" 형태로 그려 주므로 라벨에 다시 적지 않는다
        key: `tab-${item.id}`,
        label: `${item.label} (${counts[item.id] ?? 0})`,
        hotkey: item.hotkey,
        plain: true,
        dimColor: model.tab !== item.id,
        onPress: () => actions.setTab(item.id),
      }),
    ),
  })
}

function entryRows(
  kit: Kit,
  entry: CatalogEntry,
  model: StoreModel,
  actions: StoreActions,
): RenderElement[] {
  const { Box, Text, Button } = kit
  const isInstalled = model.installed.has(entry.name)
  const isBusy = model.busy.has(entry.name)
  const isExpanded = model.expanded === entry.name
  const permissions = permissionDisplayOf(entry.permissions, model.tier)

  const nameLine = Box({
    flexDirection: 'row',
    columnGap: 1,
    children: [
      Text({
        backgroundColor: KIND_COLOR[entry.kind],
        color: 'inverseText',
        children: [` ${KIND_LABEL[entry.kind]} `],
      }),
      Text({ bold: true, children: [entry.displayName] }),
      ...(isInstalled
        ? [Text({ backgroundColor: 'success', color: 'inverseText', children: [' 설치됨 '] })]
        : []),
    ],
  })

  const summaryLine = Text({ dimColor: true, children: [entry.summary] })

  const permissionTexts: RenderElement[] = [Text({ color: 'permission', children: [permissions.primary] })]
  if (permissions.extra.length > 0) {
    permissionTexts.push(Text({ dimColor: true, children: [' · ' + permissions.extra.join(' · ')] }))
  }

  const installLabel = isBusy
    ? isInstalled
      ? '제거 중…'
      : '설치 중…'
    : isInstalled
      ? '설치됨 · 제거'
      : '설치'

  const installButton = Button({
    key: `install-${entry.name}`,
    label: installLabel,
    dimColor: isBusy,
    onPress: () => {
      if (isBusy) return
      if (isInstalled) actions.uninstall(entry.name)
      else actions.install(entry.name)
    },
  })

  const detailButton = Button({
    key: `detail-${entry.name}`,
    label: isExpanded ? '접기' : '자세히',
    plain: true,
    onPress: () => actions.toggleDetail(entry.name),
  })

  const actionLines: RenderElement[] =
    model.tier === 'narrow'
      ? [
          Box({ flexDirection: 'row', children: permissionTexts }),
          Box({ flexDirection: 'row', columnGap: 2, children: [installButton, detailButton] }),
        ]
      : [
          Box({
            flexDirection: 'row',
            columnGap: 2,
            children: [...permissionTexts, installButton, detailButton],
          }),
        ]

  const rows: RenderElement[] = [nameLine]
  if (model.tier !== 'narrow') rows.push(summaryLine)
  rows.push(...actionLines)
  if (isExpanded) rows.push(detailBlock(kit, entry))
  rows.push(Text({ children: [' '] }))

  return rows
}

function detailBlock(kit: Kit, entry: CatalogEntry): RenderElement {
  const { Box, Text, Link } = kit
  const commands = entry.commands.length > 0 ? entry.commands.join(', ') : '없음'
  const requires = entry.requires.length > 0 ? entry.requires.join(', ') : '없음'

  return Box({
    flexDirection: 'column',
    paddingLeft: 2,
    children: [
      Text({ dimColor: true, children: [`제작자 ${entry.author} · 라이선스 ${entry.license}`] }),
      Text({ dimColor: true, children: [`명령 ${commands}`] }),
      Text({ dimColor: true, children: [`준비물 ${requires}`] }),
      ...entry.notes.map(note => Text({ dimColor: true, children: [`· ${note}`] })),
      ...(entry.homepage !== undefined ? [Link({ href: entry.homepage, label: '홈페이지' })] : []),
    ],
  })
}
