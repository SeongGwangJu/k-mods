import { describe, expect, test } from 'claude-code/testing'

const SECRET_TEXT = 'key sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789 입니다'
const MASKED_TEXT = 'key [토큰 가림] 입니다'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOn = (event: string, handler: (...args: any[]) => unknown) => void

/** ui.render 스텁: 내 훅이 next()로 넘긴 (가려진) props를 그대로 기록해 둔다 */
function captureRender(on: AnyOn): Array<Record<string, unknown>> {
  const captured: Array<Record<string, unknown>> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on('ui.render', (...args: any[]) => {
    const e = args[1] as { props: Record<string, unknown> }
    captured.push(e.props)
    return { type: 'Text', props: {}, children: [] }
  })
  return captured
}

describe('ui.render — AssistantMessage', () => {
  test('모범 답안 텍스트에 섞인 비밀을 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'AssistantMessage',
      requestId: 'msg-1',
      surface: 'terminal',
      viewport: { columns: 100, rows: 30 },
      props: { text: SECRET_TEXT, isFirstOfReply: true },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.text).toBe(MASKED_TEXT)
  })

  test('desktop 화면에서도 똑같이 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'AssistantMessage',
      requestId: 'msg-1',
      surface: 'desktop',
      props: { text: SECRET_TEXT, isFirstOfReply: true },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.text).toBe(MASKED_TEXT)
  })

  test('읽기 전용 필드(isSummary)는 손대지 않고 그대로 넘긴다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'AssistantMessage',
      requestId: 'msg-1',
      surface: 'terminal',
      props: { text: '비밀 없음', isFirstOfReply: false, isSummary: true },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.isSummary).toBe(true)
    expect(captured[0]?.isFirstOfReply).toBe(false)
  })
})

describe('ui.render — UserMessage', () => {
  test('사용자 메시지에 섞인 비밀도 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'UserMessage',
      requestId: 'user-msg-1',
      surface: 'terminal',
      props: {
        text: '주민 900101-1234567 확인해줘',
        origin: { kind: 'composer' },
        isExpanded: false,
      },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.text).toBe('주민 [주민번호 가림] 확인해줘')
  })
})

describe('ui.render — ToolResult (Bash stdout)', () => {
  test('Bash 표준출력에 섞인 비밀을 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'ToolResult',
      requestId: 'tool-1',
      surface: 'terminal',
      props: {
        tool: 'Bash',
        output: { stdout: SECRET_TEXT, stderr: '', interrupted: false },
        isErrored: false,
      },
    } as Parameters<typeof $.ui.render>[0])

    const output = captured[0]?.output as { stdout: string; stderr: string }
    expect(output.stdout).toBe(MASKED_TEXT)
    expect(output.stderr).toBe('') // 모양은 그대로 유지된다
  })
})

describe('ui.render — ToolUse', () => {
  test('도구 입력 안의 문자열을 모양을 유지한 채 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'ToolUse',
      requestId: 'tool-2',
      surface: 'terminal',
      props: {
        tool: 'Bash',
        input: { command: `echo "${SECRET_TEXT}"`, timeout: 30 },
        isRunning: false,
        isErrored: false,
        isInterrupted: false,
      },
    } as Parameters<typeof $.ui.render>[0])

    const input = captured[0]?.input as { command: string; timeout: number }
    expect(input.command).toContain('[토큰 가림]')
    expect(input.timeout).toBe(30) // 문자열이 아닌 값은 그대로
  })
})

describe('ui.render — CommandOutput', () => {
  test('bash 모드로 실행한 명령의 출력에서 비밀을 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'CommandOutput',
      requestId: 'cmd-1',
      surface: 'terminal',
      props: {
        command: 'echo',
        args: `"${SECRET_TEXT}"`,
        text: SECRET_TEXT,
        isErrored: false,
      },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.text).toBe(MASKED_TEXT)
  })
})

describe('ui.render — ToolGroup', () => {
  test('묶인 도구 호출들의 입출력도 가린다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'ToolGroup',
      requestId: 'group-1',
      surface: 'terminal',
      props: {
        isActive: false,
        isExpanded: true,
        calls: [
          {
            tool: 'Bash',
            input: { command: SECRET_TEXT },
            isRunning: false,
            isErrored: false,
            isInterrupted: false,
            output: { stdout: SECRET_TEXT, stderr: '', interrupted: false },
          },
        ],
      },
    } as Parameters<typeof $.ui.render>[0])

    const calls = captured[0]?.calls as Array<{ input: { command: string }; output: { stdout: string } }>
    expect(calls[0]?.input.command).toBe(MASKED_TEXT)
    expect(calls[0]?.output.stdout).toBe(MASKED_TEXT)
  })
})

describe('ui.render — AskUserQuestion', () => {
  test('질문·선택지 문구를 가리고, 모르는 모양의 항목은 그대로 둔다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'AskUserQuestion',
      requestId: 'ask-1',
      surface: 'terminal',
      props: {
        tool: 'AskUserQuestion',
        questions: [
          {
            question: `이 이메일로 보낼까요? ${SECRET_TEXT}`,
            header: '확인',
            multiSelect: false,
            options: [
              { label: '네', description: SECRET_TEXT },
              { label: '아니오', description: '취소할게요' },
            ],
          },
          'alien-shape', // 모양이 다른 항목은 손대지 않아야 한다
        ],
      },
    } as Parameters<typeof $.ui.render>[0])

    const questions = captured[0]?.questions as unknown[]
    const first = questions[0] as {
      question: string
      header: string
      options: Array<{ label: string; description: string }>
    }
    expect(first.question).toBe(`이 이메일로 보낼까요? ${MASKED_TEXT}`)
    expect(first.header).toBe('확인') // header는 가리지 않는다 (12자 제한이 있는 짧은 제목)
    expect(first.options[0]?.description).toBe(MASKED_TEXT)
    expect(questions[1]).toBe('alien-shape')
  })
})

describe('ui.render — PromptHint', () => {
  // 실제 세션에서 확인한 사실(tui.py 라이브 확인, [DBG hint=... tail=...]로 직접
  // 찍어 봄): 엔진이 hint를 그린 뒤 tail이 있으면 그 사이의 "·" 구분점은 엔진이
  // 직접 넣어 준다. 그래서 tail 값 자체에는 선행 구두점을 넣으면 안 된다
  // (넣으면 "...agents · · 가림 중 0"처럼 점이 두 번 찍힌다).

  test('켜져 있으면 가린 개수 꼬리표를 붙인다 (선행 구두점 없이)', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'PromptHint',
      requestId: 'hint-1',
      surface: 'terminal',
      props: { isDraft: false, isWorking: false, hint: 'Esc로 취소' },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.tail).toBe('가림 중 0')
    expect(captured[0]?.hint).toBe('Esc로 취소') // hint 자체는 손대지 않는다
  })

  test('다른 mod가 이미 붙여 둔 tail은 지우지 않고 " · "로 이어 붙인다', async ($, on) => {
    const captured = captureRender(on)

    await $.ui.render({
      component: 'PromptHint',
      requestId: 'hint-2',
      surface: 'terminal',
      props: { isDraft: false, isWorking: false, hint: 'Esc로 취소', tail: '다른mod' },
    } as Parameters<typeof $.ui.render>[0])

    expect(captured[0]?.tail).toBe('다른mod · 가림 중 0')
  })
})
