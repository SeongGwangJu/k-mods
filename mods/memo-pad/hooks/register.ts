// memo-pad: Claude가 일하는 동안 다음 지시를 적어두는 작은 메모장.
//   /m 으로 열고 닫는다(작업 중에도 바로 열림). 6줄짜리 인라인 패널, Esc로 닫힘.
//   메모마다 [넣기]는 프롬프트에 채우고(전송은 직접 Enter), [x]는 지운다.
//   메모가 있으면 프롬프트 아래 힌트 줄 끝에 "메모 N"을 붙여서 잊지 않게 한다.
//   폴더(작업 디렉터리)별로 따로 저장되고 세션이 끝나도 남는다.
import type { On, PluginOptions } from 'claude-code'

import { hintTail, storeKeyFor } from './notes'
import { paletteOf } from './palette'

const PANE = 'memo-pad'
const ROWS = 6

export function register(on: On, options: PluginOptions): void {
  const palette = paletteOf(options.palette)

  let notes: string[] = []
  let storeKey: string | null = null
  let isOpen = false

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'm', description: '메모장 열기/닫기 (작업 중에도 열림)', immediate: true })
    storeKey = storeKeyFor(await $.session.cwd())
    const saved = await $.store.get(storeKey)
    notes = Array.isArray(saved) ? (saved as string[]) : []
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('command.run', { command: 'm' }, async ($) => {
    if (isOpen) {
      await $.ui.close({ id: PANE })
      isOpen = false
      return {}
    }
    await $.ui.open({ id: PANE, title: '메모', focus: true, closeOnEscape: true, rows: ROWS })
    isOpen = true
    return {}
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) {
      isOpen = false
      $.ui.invalidate('ui.render')
    }
    return next(e)
  })

  // 힌트 줄 끝에 메모 개수. 엔진의 줄은 그대로 두고 tail만 붙인다.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    if (notes.length === 0 || isOpen) return next(e)
    return next({ ...e, props: { ...e.props, tail: hintTail(notes.length) } })
  })

  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId !== PANE) return next(e)
    // Input은 terminal·desktop에만 있다(Pane 자체는 모든 surface에서 열릴 수 있다). 그 밖의
    // surface(vscode·mobile)에서는 엔진 기본 그림에 맡긴다.
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return next(e)
    const { Box, Text, Button, Input } = $.ui.resolve(e)
    const save = async (list: string[]) => {
      notes = list
      $.ui.invalidate('ui.render')
      if (storeKey) await $.store.set(storeKey, notes)
    }
    // Text에는 key가 없다(목록 재조정용이 아니라 Box·Button의 key는 hover 범위·주소 용도).
    const badge =
      notes.length === 0
        ? null
        : palette.badgeBg
          ? Text({ backgroundColor: palette.badgeBg, color: palette.badgeFg, children: ` 메모 ${notes.length} ` })
          : Text({ children: `메모 ${notes.length}개` })
    return Box({
      flexDirection: 'column',
      children: [
        ...(badge ? [badge] : []),
        Input({
          key: 'new',
          label: '메모',
          placeholder: '다음에 시킬 일을 적고 Enter',
          value: '',
          submitLabel: '추가',
          autoFocus: true,
          onSubmit: async (value: string) => {
            const text = value.trim()
            if (text) await save([...notes, text])
          },
        }),
        ...notes.map((note, i) =>
          Box({
            key: `row-${i}`,
            flexDirection: 'row',
            columnGap: 1,
            children: [
              Button({
                key: `use-${i}`,
                label: '넣기',
                onPress: async () => {
                  await $.prompt.fill({ text: note, mode: 'replace' })
                  await save(notes.filter((_, j) => j !== i))
                  await $.ui.close({ id: PANE })
                  isOpen = false
                },
              }),
              Button({ key: `del-${i}`, label: 'x', onPress: () => save(notes.filter((_, j) => j !== i)) }),
              Text({ wrap: 'truncate-end', children: note }),
            ],
          }),
        ),
      ],
    })
  })
}
