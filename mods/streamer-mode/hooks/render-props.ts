import type { MaskCache } from './mask/cache'
import { deepMaskValue } from './mask/deep'
import { maskForDisplay } from './mask/engine'
import type { SessionCounter } from './mask/session-counter'
import type { MaskConfig } from './mask/types'

/** register.ts가 모듈 수준에서 하나만 만들어 모든 렌더 훅에 넘기는 공유 자원 */
export interface MaskRuntime {
  readonly config: MaskConfig
  readonly cache: MaskCache
  readonly counter: SessionCounter
}

function mask(text: string, runtime: MaskRuntime): string {
  return maskForDisplay(text, runtime.config, runtime.cache, runtime.counter)
}

function maskDeep(value: unknown, runtime: MaskRuntime): unknown {
  return deepMaskValue(value, text => mask(text, runtime))
}

// 아래 함수들은 "입력과 똑같은 모양을 돌려주되 필드 하나만 바꾼다"는 패턴이라
// 제네릭 P로 원래 타입을 그대로 보존한다. 스프레드 결과가 구조적으로는 P와
// 같아도(같은 키, 호환되는 값 타입) TS가 제네릭을 그렇게까지 좁혀 주진 않으므로
// `as P`로 명시한다 — 필드 값만 같은 타입으로 바꿔치기하는 좁은 용도라 안전하다.

export function maskAssistantMessageProps<P extends { text: string }>(
  props: P,
  runtime: MaskRuntime,
): P {
  return { ...props, text: mask(props.text, runtime) } as P
}

export function maskUserMessageProps<P extends { text: string }>(props: P, runtime: MaskRuntime): P {
  return { ...props, text: mask(props.text, runtime) } as P
}

export function maskCommandOutputProps<P extends { text: string }>(
  props: P,
  runtime: MaskRuntime,
): P {
  return { ...props, text: mask(props.text, runtime) } as P
}

export function maskToolUseProps<P extends { input: unknown; output?: unknown }>(
  props: P,
  runtime: MaskRuntime,
): P {
  return {
    ...props,
    input: maskDeep(props.input, runtime),
    ...(props.output !== undefined ? { output: maskDeep(props.output, runtime) } : {}),
  } as P
}

export function maskToolResultProps<P extends { output: unknown }>(props: P, runtime: MaskRuntime): P {
  return { ...props, output: maskDeep(props.output, runtime) } as P
}

/** ToolGroupCall과 같은 모양. claude-code의 타입을 그대로 재선언하지 않고 구조로만 맞춘다. */
export interface ToolGroupCallLike {
  readonly tool_use_id?: string
  readonly tool: string
  readonly input: unknown
  readonly isRunning: boolean
  readonly isErrored: boolean
  readonly isInterrupted: boolean
  readonly output?: unknown
}

export function maskToolGroupCalls(
  calls: readonly ToolGroupCallLike[],
  runtime: MaskRuntime,
): ToolGroupCallLike[] {
  return calls.map(call => ({
    ...call,
    input: maskDeep(call.input, runtime),
    ...(call.output !== undefined ? { output: maskDeep(call.output, runtime) } : {}),
  }))
}

export function maskToolGroupProps<P extends { calls: readonly ToolGroupCallLike[] }>(
  props: P,
  runtime: MaskRuntime,
): P {
  return { ...props, calls: maskToolGroupCalls(props.calls, runtime) } as P
}

// AskUserQuestion의 질문 하나. 엔진은 이 모양이 도구의 입력 스키마와 안 맞으면
// 고친 내용을 버리고 원본을 그린다 — 그래서 모양이 안 맞는 항목은 아예 손대지
// 않는다 (어차피 바뀐 내용이 안 먹히므로, 손대도 득이 없고 다른 필드를 깨뜨릴
// 위험만 있다).
export interface AskUserOptionLike {
  readonly label: string
  readonly description: string
  readonly preview?: string
}

export interface AskUserQuestionItemLike {
  readonly question: string
  readonly header: string
  readonly options: readonly AskUserOptionLike[]
  readonly multiSelect: boolean
}

function isAskUserOption(value: unknown): value is AskUserOptionLike {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.label === 'string' && typeof v.description === 'string'
}

function isAskUserQuestionItem(value: unknown): value is AskUserQuestionItemLike {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.question === 'string' &&
    typeof v.header === 'string' &&
    typeof v.multiSelect === 'boolean' &&
    Array.isArray(v.options) &&
    v.options.every(isAskUserOption)
  )
}

function maskAskUserQuestionItem(
  item: AskUserQuestionItemLike,
  runtime: MaskRuntime,
): AskUserQuestionItemLike {
  return {
    ...item,
    // header는 가리지 않는다: 가릴 대상은 question/options로 한정하고,
    // 칩 하나짜리 짧은 라벨이라 길이 제한에 걸려 스키마 검증이 통째로
    // 실패할 위험이 더 크다.
    question: mask(item.question, runtime),
    options: item.options.map(opt => {
      const maskedOpt: AskUserOptionLike = {
        ...opt,
        label: mask(opt.label, runtime),
        description: mask(opt.description, runtime),
      }
      if (opt.preview !== undefined) {
        return { ...maskedOpt, preview: mask(opt.preview, runtime) }
      }
      return maskedOpt
    }),
  }
}

/**
 * `questions`는 타입상 `unknown[]`이다. 도구 스키마와 맞는 항목만 가리고,
 * 모양을 알아볼 수 없는 항목은 원본 그대로 둔다 (건드렸다가 스키마가 깨지면
 * 엔진이 조용히 원본을 그려, 가리기 전보다 나을 게 없다).
 */
export function maskAskUserQuestionProps<P extends { questions: unknown[] }>(
  props: P,
  runtime: MaskRuntime,
): P {
  const questions = props.questions.map(item =>
    isAskUserQuestionItem(item) ? maskAskUserQuestionItem(item, runtime) : item,
  )
  return { ...props, questions } as P
}

/**
 * PromptHint의 tail 뒤에 내 내용을 이어 붙인다.
 *
 * 실제 세션에서 확인해 보니(tui.py 라이브 확인, `[DBG hint=... tail=...]`로
 * 찍어 봄): 엔진이 `hint`를 그린 뒤 `tail`이 있으면 둘 사이에 "·" 구분점을
 * 엔진이 직접 넣어 준다 (`hint`도 `tail`도 그 점을 포함하지 않았는데 화면엔
 * "...agents · 가림 중 0"처럼 나온다). 그래서 tail 맨 앞에 내가 또 " · "를
 * 붙이면 점이 두 번 찍힌다 — tail 값 자체는 구두점 없이 내용만 담아야 한다.
 * 다만 다른 mod가 이미 tail에 뭔가 붙여 놓은 경우엔, 그 뒤에 내 내용을 잇는
 * 구분자는 내가 직접 넣어야 한다 (엔진은 hint↔tail 경계만 신경 쓴다).
 *
 * @param existingTail 내 앞에 다른 mod가 이미 붙여 둔 tail (없으면 undefined)
 * @param label 내가 붙이고 싶은 내용 (예: "가림 중 3", 구두점 없이)
 */
export function appendHintTail(existingTail: string | undefined, label: string): string {
  return existingTail ? `${existingTail} · ${label}` : label
}
