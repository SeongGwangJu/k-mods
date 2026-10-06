import type { On, PluginOptions } from 'claude-code'

import { buildMaskConfig, initialToggleFrom } from './config'
import { createMaskCache } from './mask/cache'
import { createSessionCounter } from './mask/session-counter'
import {
  appendHintTail,
  maskAskUserQuestionProps,
  maskAssistantMessageProps,
  maskCommandOutputProps,
  maskToolGroupProps,
  maskToolResultProps,
  maskToolUseProps,
  maskUserMessageProps,
  type MaskRuntime,
} from './render-props'

// $.store에 저장할 때 쓰는 키. 세션이 끝나도, 기기를 재시작해도 남는다.
const STORE_KEY = 'isOn'
const CACHE_LIMIT = 500

function statusText(runtime: MaskRuntime, isOn: boolean): string {
  const { config } = runtime
  const groups: string[] = []
  groups.push(`비밀·토큰: ${config.maskSecrets ? '켜짐' : '꺼짐'}`)
  groups.push(`주민·카드·사업자·면허번호: ${config.maskKoreanId ? '켜짐' : '꺼짐'}`)
  groups.push(`전화번호·이메일: ${config.maskContact ? '켜짐' : '꺼짐'}`)
  groups.push(`IP 주소: ${config.maskIp ? '켜짐' : '꺼짐'}`)
  groups.push(`홈 폴더 이름: ${config.maskHome ? '켜짐' : '꺼짐'}`)
  groups.push(`사용자 지정 단어: ${config.customWords.length}개`)

  const header = `스트리머 모드: ${isOn ? '켜짐' : '꺼짐'} (이번 세션에 가린 항목 ${runtime.counter.count}개)`
  return [header, ...groups.map(g => `- ${g}`)].join('\n')
}

export function register(on: On, options: PluginOptions): void {
  const config = buildMaskConfig(options)
  const cache = createMaskCache(CACHE_LIMIT)
  const counter = createSessionCounter()
  const runtime: MaskRuntime = { config, cache, counter }

  // 세션이 시작되기 전까지는 userConfig 기본값을 쓰고, session.start에서
  // $.store에 저장된 값이 있으면 그걸로 덮어쓴다 (꺼둔 채로 설치 재시작해도 꺼진 채 유지).
  let isOn = initialToggleFrom(options)

  on('session.start', async ($, e, next) => {
    const stored = await $.store.get(STORE_KEY)
    if (typeof stored === 'boolean') {
      isOn = stored
    }

    await $.command.register({
      name: 'streamer',
      description: '화면에서 비밀·개인정보를 가려요. 인자 없이 쓰면 켜고 끄기예요.',
      argumentHint: '[on|off|status]',
      immediate: true,
    })

    return next(e)
  })

  on('command.run', { command: 'streamer' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'status') {
      return { text: statusText(runtime, isOn) }
    }

    if (arg !== '' && arg !== 'on' && arg !== 'off') {
      return { text: '사용법: `/streamer` (켜고 끄기), `/streamer on`, `/streamer off`, `/streamer status`' }
    }

    const desiredOn = arg === '' ? !isOn : arg === 'on'

    if (desiredOn === isOn) {
      $.ui.toast(isOn ? '이미 켜져 있어요' : '이미 꺼져 있어요')
      return {}
    }

    isOn = desiredOn
    await $.store.set(STORE_KEY, isOn)
    $.ui.invalidate('ui.render')
    $.ui.toast(isOn ? '스트리머 모드 켰어요' : '스트리머 모드 껐어요')
    return {}
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskAssistantMessageProps(e.props, runtime) })
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskUserMessageProps(e.props, runtime) })
  })

  on('ui.render', { component: 'CommandOutput' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskCommandOutputProps(e.props, runtime) })
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskToolUseProps(e.props, runtime) })
  })

  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskToolResultProps(e.props, runtime) })
  })

  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskToolGroupProps(e.props, runtime) })
  })

  on('ui.render', { component: 'AskUserQuestion' }, async ($, e, next) => {
    if (!isOn) return next(e)
    return next({ ...e, props: maskAskUserQuestionProps(e.props, runtime) })
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    if (!isOn) return next(e)
    const tail = appendHintTail(e.props.tail, `가림 중 ${counter.count}`)
    return next({ ...e, props: { ...e.props, tail } })
  })
}
