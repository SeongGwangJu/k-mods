// 실제 register.ts를 통해 패널을 $.ui.mount로 그려 보는 통합 테스트.
// 60/80/110칸 x 터미널/데스크톱에서 패널이 뜨는지, 탭·바닥글 같은 구조적 요소가
// 항상 보이는지 확인한다. 어떤 항목이 카탈로그에 있는지는 가정하지 않는다.

import { expect, test } from 'claude-code/testing'

import { CATALOG, SELF_NAME } from '../hooks/catalog'
import { KIND_LABEL } from '../hooks/lib'

const BASE_PANE = {
  plugin: 'mod-store',
  component: 'Pane',
  requestId: 'k-mods-store',
  props: {
    title: 'k-mods 모드 상점',
    isFocused: true,
    placement: 'inline',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

test('60·80·110칸, 터미널·데스크톱 모두에서 패널이 그려진다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  const firstOther = CATALOG.find(item => item.name !== SELF_NAME)
  const expectedKindLabel = firstOther ? KIND_LABEL[firstOther.kind] : null

  for (const columns of [60, 80, 110] as const) {
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        ...BASE_PANE,
        surface,
        viewport: { columns, rows: 40 },
        props: { ...BASE_PANE.props, bodyColumns: columns },
      })

      expect(await ui.find({ type: 'Text', text: 'k-mods 모드 상점' })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: 'Tab 이동 · Enter 누르기 · Esc 닫기' })).toBeDefined()
      expect(await ui.find({ key: 'tab-all' })).toBeDefined()
      if (expectedKindLabel !== null) {
        expect(await ui.find({ type: 'Text', text: new RegExp(expectedKindLabel) })).toBeDefined()
      }

      await ui.unmount()
    }
  }
})

test('mod-store 자기 자신은 목록에 보이지 않는다', async ($, on) => {
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('store.get', () => ({ value: true }))
  on('store.set', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  const ui = await $.ui.mount({
    ...BASE_PANE,
    surface: 'terminal',
    viewport: { columns: 100, rows: 40 },
    props: { ...BASE_PANE.props, bodyColumns: 100 },
  })

  expect(await ui.find({ key: `install-${SELF_NAME}` })).toBeUndefined()
  await ui.unmount()
})
