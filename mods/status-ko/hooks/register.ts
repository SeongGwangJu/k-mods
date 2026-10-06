// status-ko: 작업 중 줄과 턴 완료 줄을 한국어 상태로 바꾼다.
//
// 작업 중 줄(Spinner): 엔진의 ✻ 애니메이션과 (19s · ↓ 1.1k tokens) 괄호는 그대로 두고,
//   무작위 단어(Ruminating, Clauding…)만 지금 하는 일로 바꾼다.
//   생각 중 / 작성 중 / 요청 중 / 읽는 중 · page.tsx / 실행 중 · pnpm check …
// 완료 줄(TurnDuration): "Brewed for 1m 22s"를 "◇ Opus 5.5  1분 22초 · 도구 14 · 캐시 97% · 14:59"로.
//   중단이면 ✕ 중단, 오류면 ! 오류, 거절이면 ⊘ 거절.
//   도구 수·캐시는 turn.complete에서 모아 두고, 완료 줄을 그릴 때 걸린 시간(durationMs)으로 짝을 찾는다.
//   짝이 없는 줄(모드가 다시 불리기 전의 턴)은 "◇ 완료 1분 22초"만 쓴다.
//
// 색은 기본(palette: "theme")은 테마 키, "gray"는 원본이 쓰던 회색 배경용 고정 색.
import type { On, PluginOptions } from 'claude-code'

import { duration, clockTime, modelName, targetOf, MODE_LABELS, TOOL_LABELS } from './format'
import { paletteOf } from './palette'

const KEEP_TURNS = 200

type Running = { id: string; tool: string; target: string }
type Finished = {
  reason: string
  tools: number
  cache: number | null
  model: string
  endedAt: number
}

export function register(on: On, options: PluginOptions): void {
  const palette = paletteOf(options.palette)

  // 메인 루프에서 지금 돌고 있는 도구들 (병렬 호출이면 여러 개, 가장 최근 것을 보여준다)
  let running: Running[] = []
  // 이번 턴에 부른 도구 수 (서브에이전트 안의 호출 포함)
  let toolsThisTurn = 0
  // 끝난 턴의 요약: durationMs → 요약
  const finished = new Map<number, Finished>()

  on('turn.start', async ($, e, next) => {
    toolsThisTurn = 0
    running = []
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    toolsThisTurn += 1
    if (e.agentId !== undefined) return next(e)
    const entry: Running = { id: e.tool_use_id, tool: String(e.tool), target: targetOf(e) }
    running.push(entry)
    $.ui.invalidate('ui.render')
    try {
      return await next(e)
    } finally {
      running = running.filter((r) => r !== entry)
      $.ui.invalidate('ui.render')
    }
  }).catch(async ($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      const u = e.usage
      const input = u ? u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) : 0
      finished.set(e.durationMs, {
        reason: e.reason,
        tools: toolsThisTurn,
        cache: u && input > 0 ? Math.round(((u.cache_read_input_tokens ?? 0) / input) * 100) : null,
        model: u?.model ?? (await $.session.model()),
        endedAt: await $.clock.now(),
      })
      if (finished.size > KEEP_TURNS) {
        const oldest = finished.keys().next().value
        if (oldest !== undefined) finished.delete(oldest)
      }
      running = []
    }
    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    // 엔진이 상태 문구(압축 중 등)를 띄울 때는 그대로 둔다
    if (e.props.message) return next(e)
    const current = running[running.length - 1]
    if (e.props.mode === 'tool-use' && current) {
      const label = TOOL_LABELS[current.tool] ?? (current.tool.startsWith('mcp__') ? 'MCP 호출 중' : `${current.tool} 실행 중`)
      const word = current.target ? `${label} · ${current.target}` : label
      return next({ ...e, props: { ...e.props, word, suffix: current.target ? '' : e.props.suffix } })
    }
    const word = MODE_LABELS[e.props.mode] ?? e.props.word
    return next({ ...e, props: { ...e.props, word } })
  })

  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    const { Text } = $.ui.resolve(e)
    const summary = finished.get(e.props.durationMs)
    const time = duration(e.props.durationMs)
    // Text에는 key가 없다(목록 재조정용이 아니라 Box·Button의 key는 hover 범위·주소 용도).
    // 여기 span들은 찾아서 누르거나 입력할 대상이 아니라 그냥 글자 조각이라 key가 필요 없다.
    const span = (color: string, text: string, bold = false) => Text({ color, bold, children: text })

    if (!summary) {
      return Text({
        wrap: 'truncate-end',
        children: [span(palette.mark, '◇ '), span(palette.text, '완료 '), span(palette.text, time, true)],
      })
    }
    if (summary.reason === 'aborted') {
      return Text({
        wrap: 'truncate-end',
        children: [
          span(palette.aborted, '✕ '),
          span(palette.text, '중단 '),
          span(palette.text, time, true),
          span(palette.subtle, ` · 도구 ${summary.tools}`),
        ],
      })
    }
    if (summary.reason === 'error' || summary.reason === 'refusal') {
      const word = summary.reason === 'error' ? '오류' : '거절'
      return Text({
        wrap: 'truncate-end',
        children: [
          span(palette.failed, summary.reason === 'error' ? '! ' : '⊘ '),
          span(palette.text, `${word} `),
          span(palette.text, time, true),
        ],
      })
    }
    const details = [`도구 ${summary.tools}`]
    if (summary.cache !== null) details.push(`캐시 ${summary.cache}%`)
    details.push(clockTime(summary.endedAt))
    return Text({
      wrap: 'truncate-end',
      children: [
        span(palette.mark, '◇ '),
        span(palette.text, `${modelName(summary.model)}  `),
        span(palette.text, time, true),
        span(palette.subtle, ` · ${details.join(' · ')}`),
      ],
    })
  })
}
