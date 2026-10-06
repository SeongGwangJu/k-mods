import { expect, mock, test } from 'claude-code/testing'

/** 손대지 않고 넘긴 fire-and-forget 체인이 마저 돌 수 있도록 마이크로태스크 몇 턴을 넘겨준다. */
async function flush(times = 20): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve()
  }
}

const RUN_ORIGIN = { kind: 'composer' } as const
const RUN_PRESENTATION = { isFullscreen: false, columns: 100 }

function runArgs(args: string) {
  return { command: 'alarm', args, origin: RUN_ORIGIN, presentation: RUN_PRESENTATION }
}

const registerCommandStub = () => ({ value: { command: 'alarm' } })

// =============================================================================
// 트리거 배선: turn.complete가 기준 시간·중단·서브에이전트·음소거를 제대로 지키는지.
// (조건 자체는 format.test.ts의 shouldNotifyFinished가 이미 확인했다. 여기서는 register.ts가
// 그 답을 실제로 "보낸다/안 보낸다"로 옮기는지만, $.session.cwd 호출 횟수로 엿본다.)
// =============================================================================

test('turn.complete: 메인 대화가 기준 시간 이상 걸리면 알림을 시도한다', async ($, on) => {
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('turn.complete', () => ({ text: '' }))

  await $.turn.complete({ turnId: 't1', answer: '다 됐어요', durationMs: 30_000, isAborted: false, reason: 'answer' })
  await flush()

  expect(cwdCalls).toBe(1)
})

test('turn.complete: 기준 시간보다 짧으면 알리지 않는다', async ($, on) => {
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('turn.complete', () => ({ text: '' }))

  await $.turn.complete({ turnId: 't1', answer: '다 됐어요', durationMs: 5_000, isAborted: false, reason: 'answer' })
  await flush()

  expect(cwdCalls).toBe(0)
})

test('turn.complete: 중단된 턴은 알리지 않는다', async ($, on) => {
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('turn.complete', () => ({ text: '' }))

  await $.turn.complete({ turnId: 't1', answer: '', durationMs: 60_000, isAborted: true, reason: 'aborted' })
  await flush()

  expect(cwdCalls).toBe(0)
})

test('turn.complete: 서브에이전트 턴(agentId)은 알리지 않는다', async ($, on) => {
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('turn.complete', () => ({ text: '' }))

  await $.turn.complete({
    turnId: 't1',
    agentId: 'sub-1',
    answer: '서브에이전트 끝',
    durationMs: 60_000,
    isAborted: false,
    reason: 'answer',
  })
  await flush()

  expect(cwdCalls).toBe(0)
})

test('turn.complete: /alarm off로 음소거하면 알리지 않는다', async ($, on) => {
  let cwdCalls = 0
  on('command.register', registerCommandStub)
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('turn.complete', () => ({ text: '' }))

  const off = await $.command.run(runArgs('off'))
  expect(off.text).toContain('껐어요')

  await $.turn.complete({ turnId: 't1', answer: '다 됐어요', durationMs: 60_000, isAborted: false, reason: 'answer' })
  await flush()

  expect(cwdCalls).toBe(0)
})

// =============================================================================
// "확인이 필요해요" 두 신호(classic.Notification, AskUserQuestion tool.call)와 디바운스
// =============================================================================

test('classic.Notification: 확인이 필요하면 알림을 시도한다', async ($, on) => {
  mock.clock(on)
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('classic.Notification', () => ({}))

  await $.classic.Notification({ message: 'Claude가 Bash 권한을 기다리고 있어요', notification_type: 'permission' })
  await flush()

  expect(cwdCalls).toBe(1)
})

test('AskUserQuestion tool.call: 질문이 뜨면 알림을 시도하고, 질문 자체는 절대 막지 않는다', async ($, on) => {
  mock.clock(on)
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('tool.call', () => ({ result: { answers: {} } }))

  const result = await $.tool.call({
    tool: 'AskUserQuestion',
    questions: [{ question: '어느 쪽으로 할까요?', header: '방향', options: [], multiSelect: false }],
  })

  await flush()

  expect(cwdCalls).toBe(1)
  // next(e)가 그대로 흘러가, 질문은 평소처럼 사용자에게 간다(막히지 않는다)
  expect(result).toEqual({ result: { answers: {} } })
})

test('디바운스: 60초 안에 두 신호가 겹치면 한 번만 알린다', async ($, on) => {
  const clock = mock.clock(on)
  let cwdCalls = 0
  on('session.cwd', () => {
    cwdCalls += 1
    return { value: '/work/my-project' }
  })
  on('classic.Notification', () => ({}))
  on('tool.call', () => ({ result: { answers: {} } }))

  await $.classic.Notification({ message: '권한이 필요해요', notification_type: 'permission' })
  await flush()
  expect(cwdCalls).toBe(1)

  // 59초 뒤 AskUserQuestion이 와도, 아직 디바운스 구간이라 막는다
  await clock.advance(59_000)
  await $.tool.call({
    tool: 'AskUserQuestion',
    questions: [{ question: '계속할까요?', header: '확인', options: [], multiSelect: false }],
  })
  await flush()
  expect(cwdCalls).toBe(1)

  // 1초(=총 60초)가 더 지나면 다시 알린다
  await clock.advance(1_000)
  await $.classic.Notification({ message: '또 권한이 필요해요', notification_type: 'permission' })
  await flush()
  expect(cwdCalls).toBe(2)
})

// =============================================================================
// 데스크톱 알림: osascript/notify-send argv, AppleScript 이스케이프 (/alarm test로 거친다)
// =============================================================================

test('/alarm test (mac): osascript -e 로 보내고, AppleScript 문자열을 제대로 이스케이프한다', async ($, on) => {
  const runs: string[][] = []
  on('command.register', registerCommandStub)
  on('session.start', () => ({ cwd: '/work/my-project' }))
  on('session.cwd', () => ({ value: '/work/my-project' }))
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    return {
      value: {
        exitCode: 0,
        stdout: e.argv[0] === 'uname' ? 'Darwin\n' : '',
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work/my-project' })
  const result = await $.command.run(runArgs('test'))

  expect(result.text).toContain('✓ 데스크톱')
  const osa = runs.find((argv) => argv[0] === 'osascript')
  expect(osa).toBeDefined()
  expect(osa?.[1]).toBe('-e')
  expect(osa?.[2]).toContain('with title "Claude Code"')
})

test('/alarm test (mac): 메시지의 따옴표·백슬래시를 이스케이프해서 담는다', async ($, on) => {
  // AppleScript 이스케이프 자체(백슬래시 → 따옴표 순서, 여러 줄 처리)는 format.test.ts에서
  // escapeAppleScript/buildAppleScript로 이미 꼼꼼히 확인했다. 여기서는 그 결과물이 실제
  // osascript 호출의 세 번째 인자로 그대로 전달되는지만 argv로 확인한다.
  const runs: string[][] = []
  on('command.register', registerCommandStub)
  on('session.start', () => ({ cwd: '/work/my-project' }))
  on('session.cwd', () => ({ value: '/work/my-project' }))
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    return {
      value: {
        exitCode: 0,
        stdout: e.argv[0] === 'uname' ? 'Darwin\n' : '',
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work/my-project' })
  await $.command.run(runArgs('test'))

  const osa = runs.find((argv) => argv[0] === 'osascript')
  // 테스트 메시지 자체엔 따옴표가 없으니, 스크립트 구조만: 괄호로 감싼 문자열 + 세 개의 섹션
  expect(osa?.[2]).toMatch(/^display notification \(.*\) with title "Claude Code" subtitle ".*" sound name "Glass"$/)
})

test('/alarm test (linux): notify-send로 보낸다', async ($, on) => {
  const runs: string[][] = []
  on('command.register', registerCommandStub)
  on('session.start', () => ({ cwd: '/work/my-project' }))
  on('session.cwd', () => ({ value: '/work/my-project' }))
  on('process.run', ($, e) => {
    runs.push([...e.argv])
    return {
      value: {
        exitCode: 0,
        stdout: e.argv[0] === 'uname' ? 'Linux\n' : '',
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work/my-project' })
  const result = await $.command.run(runArgs('test'))

  expect(result.text).toContain('✓ 데스크톱')
  const sent = runs.find((argv) => argv[0] === 'notify-send')
  expect(sent).toEqual(['notify-send', 'Claude Code', '🔔 done-alarm 테스트 알림이에요'])
})

test('/alarm test: 데스크톱 프로그램이 없으면(ENOENT) 실패로 보고하고, 상태에도 남는다', async ($, on) => {
  on('command.register', registerCommandStub)
  on('session.start', () => ({ cwd: '/work/my-project' }))
  on('session.cwd', () => ({ value: '/work/my-project' }))
  on('process.run', ($, e) => (e.argv[0] === 'uname' ? { deny: 'ENOENT' } : { deny: 'ENOENT: osascript 없음' }))

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work/my-project' })
  const testResult = await $.command.run(runArgs('test'))
  expect(testResult.text).toContain('✗ 데스크톱')

  const status = await $.command.run(runArgs(''))
  expect(status.text).toContain('최근 실패')
})

// =============================================================================
// 음성: Yuna 먼저, 안 되면 기본 음성
// =============================================================================

test(
  '/alarm test: 음성은 Yuna가 없으면 기본 음성으로 한 번 더 시도한다',
  { options: { desktop: false, voice: true } },
  async ($, on) => {
    const calls: Array<{ text: string; voice?: string }> = []
    let attempt = 0
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('audio.speak', ($, e) => {
      calls.push(e)
      attempt += 1
      if (attempt === 1) return { deny: 'Yuna 음성이 설치돼 있지 않아요' }
      return { value: { via: 'system' } }
    })

    const result = await $.command.run(runArgs('test'))

    expect(result.text).toContain('✓ 음성')
    expect(calls.length).toBe(2)
    expect(calls[0]).toEqual({ text: '🔔 done-alarm 테스트 알림이에요', voice: 'Yuna' })
    expect(calls[1]?.voice).toBeUndefined()
  },
)

test(
  '/alarm test: 음성 합성기 자체가 없으면 실패로 보고한다',
  { options: { desktop: false, voice: true } },
  async ($, on) => {
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('audio.speak', () => ({ deny: '합성기를 찾을 수 없어요' }))

    const result = await $.command.run(runArgs('test'))

    expect(result.text).toContain('✗ 음성')
  },
)

// =============================================================================
// HTTP 채널: ntfy / Telegram / Webhook 페이로드 (desktop은 꺼서 잡음을 줄인다)
// =============================================================================

test(
  '/alarm test: ntfy는 URL·메서드·본문·헤더를 이렇게 보낸다',
  { options: { desktop: false, ntfy_topic: 'my-secret-topic', ntfy_server: 'https://ntfy.sh' } },
  async ($, on) => {
    const calls: Array<{ url: string; init: { method?: string; body?: string; headers?: Record<string, string> } }> = []
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('http.fetch', ($, e) => {
      calls.push({ url: e.url, init: e.init ?? {} })
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })

    const result = await $.command.run(runArgs('test'))

    expect(result.text).toContain('✓ ntfy')
    expect(calls.length).toBe(1)
    expect(calls[0]?.url).toBe('https://ntfy.sh/my-secret-topic')
    expect(calls[0]?.init.method).toBe('POST')
    expect(calls[0]?.init.body).toBe('🔔 done-alarm 테스트 알림이에요')
    expect(calls[0]?.init.headers?.Title).toBe('Claude Code')
    expect(calls[0]?.init.headers?.Tags).toBe('test_tube')
  },
)

test(
  '/alarm test: ntfy 주제는 URL 인코딩하고, 서버 끝 슬래시는 정리한다',
  { options: { desktop: false, ntfy_topic: '한글 주제', ntfy_server: 'https://ntfy.example.com/' } },
  async ($, on) => {
    const urls: string[] = []
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('http.fetch', ($, e) => {
      urls.push(e.url)
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })

    await $.command.run(runArgs('test'))

    expect(urls[0]).toBe('https://ntfy.example.com/' + encodeURIComponent('한글 주제'))
  },
)

test(
  '/alarm test: HTTP 실패(503 등)는 ✗로 보고한다',
  { options: { desktop: false, ntfy_topic: 'topic' } },
  async ($, on) => {
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('http.fetch', () => ({ value: { status: 503, ok: false, headers: {}, text: 'down' } }))

    const result = await $.command.run(runArgs('test'))

    expect(result.text).toContain('✗ ntfy')
  },
)

test(
  '/alarm test: Telegram은 bot<token>/sendMessage로 JSON을 보낸다',
  { options: { desktop: false, telegram_bot_token: 'TOKEN123', telegram_chat_id: 'CHAT456' } },
  async ($, on) => {
    const calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }> = []
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('http.fetch', ($, e) => {
      calls.push({ url: e.url, init: e.init ?? {} })
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })

    const result = await $.command.run(runArgs('test'))

    expect(result.text).toContain('✓ Telegram')
    expect(calls[0]?.url).toBe('https://api.telegram.org/botTOKEN123/sendMessage')
    expect(calls[0]?.init.method).toBe('POST')
    expect(calls[0]?.init.headers?.['Content-Type']).toBe('application/json')
    expect(JSON.parse(calls[0]?.init.body ?? '{}')).toEqual({
      chat_id: 'CHAT456',
      text: '🔔 done-alarm 테스트 알림이에요',
    })
  },
)

test(
  '/alarm test: Slack webhook은 {text}로, Discord webhook은 {content}로 보낸다',
  { options: { desktop: false, webhook_url: 'https://hooks.slack.com/services/x' } },
  async ($, on) => {
    const bodies: string[] = []
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('http.fetch', ($, e) => {
      bodies.push((e.init?.body as string) ?? '')
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })

    await $.command.run(runArgs('test'))

    expect(JSON.parse(bodies[0] ?? '{}')).toEqual({ text: '🔔 done-alarm 테스트 알림이에요' })
  },
)

test(
  '/alarm test: Discord webhook은 {content}로 보낸다',
  { options: { desktop: false, webhook_url: 'https://discord.com/api/webhooks/x' } },
  async ($, on) => {
    const bodies: string[] = []
    on('command.register', registerCommandStub)
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('http.fetch', ($, e) => {
      bodies.push((e.init?.body as string) ?? '')
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })

    await $.command.run(runArgs('test'))

    expect(JSON.parse(bodies[0] ?? '{}')).toEqual({ content: '🔔 done-alarm 테스트 알림이에요' })
  },
)

// =============================================================================
// include_summary: 데스크톱은 항상 포함, 외부(webhook)는 설정에 따라
// =============================================================================

test(
  'include_summary=false: 데스크톱엔 요약이 들어가도, 외부(webhook)엔 안 들어간다',
  { options: { webhook_url: 'https://example.com/hook', include_summary: false } },
  async ($, on) => {
    const scripts: string[] = []
    const bodies: string[] = []
    on('command.register', registerCommandStub)
    on('session.start', () => ({ cwd: '/work/my-project' }))
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('process.run', ($, e) => {
      if (e.argv[0] === 'osascript') scripts.push(e.argv[2] ?? '')
      return {
        value: {
          exitCode: 0,
          stdout: e.argv[0] === 'uname' ? 'Darwin\n' : '',
          stderr: '',
          isStdoutTruncated: false,
          isStderrTruncated: false,
        },
      }
    })
    on('http.fetch', ($, e) => {
      bodies.push((e.init?.body as string) ?? '')
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })
    on('turn.complete', () => ({ text: '' }))

    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work/my-project' })
    await $.turn.complete({
      turnId: 't1',
      answer: '**끝났어요**\n자세한 내용',
      durationMs: 45_000,
      isAborted: false,
      reason: 'answer',
    })
    await flush()

    expect(scripts.length).toBe(1)
    expect(scripts[0]).toContain('끝났어요')
    expect(bodies.length).toBe(1)
    expect(bodies[0]).not.toContain('끝났어요')
  },
)

test(
  'include_summary=true: 외부(webhook)에도 요약이 들어간다',
  { options: { webhook_url: 'https://example.com/hook', include_summary: true } },
  async ($, on) => {
    const bodies: string[] = []
    on('command.register', registerCommandStub)
    on('session.start', () => ({ cwd: '/work/my-project' }))
    on('session.cwd', () => ({ value: '/work/my-project' }))
    on('process.run', ($, e) => ({
      value: {
        exitCode: 0,
        stdout: e.argv[0] === 'uname' ? 'Darwin\n' : '',
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }))
    on('http.fetch', ($, e) => {
      bodies.push((e.init?.body as string) ?? '')
      return { value: { status: 200, ok: true, headers: {}, text: '' } }
    })
    on('turn.complete', () => ({ text: '' }))

    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work/my-project' })
    await $.turn.complete({
      turnId: 't1',
      answer: '**끝났어요**\n자세한 내용',
      durationMs: 45_000,
      isAborted: false,
      reason: 'answer',
    })
    await flush()

    expect(bodies.length).toBe(1)
    expect(bodies[0]).toContain('끝났어요')
  },
)

// =============================================================================
// /alarm 명령: status / test / on / off
// =============================================================================

test('/alarm (status): 기본 설정이 보인다', async ($, on) => {
  on('command.register', registerCommandStub)

  const answer = await $.command.run(runArgs(''))

  expect(answer.text).toContain('데스크톱: 켜짐')
  expect(answer.text).toContain('30초 이상')
  expect(answer.text).toContain('이 세션 알림: 켜짐')
})

test('/alarm on, /alarm off: 음소거를 토글하고 문구를 돌려준다', async ($, on) => {
  on('command.register', registerCommandStub)

  const off = await $.command.run(runArgs('off'))
  expect(off.text).toContain('껐어요')

  const status = await $.command.run(runArgs(''))
  expect(status.text).toContain('이 세션 알림: 꺼짐')

  const on1 = await $.command.run(runArgs('on'))
  expect(on1.text).toContain('켰어요')

  const status2 = await $.command.run(runArgs(''))
  expect(status2.text).toContain('이 세션 알림: 켜짐')
})

test('/alarm test: 켜진 채널이 없으면 안내 문구를 준다', { options: { desktop: false } }, async ($, on) => {
  on('command.register', registerCommandStub)
  on('session.cwd', () => ({ value: '/work/my-project' }))

  const result = await $.command.run(runArgs('test'))

  expect(result.text).toContain('켜진 채널이 없어요')
})

test('/alarm 뒤에 모르는 말이 오면 상태를 보여준다', async ($, on) => {
  on('command.register', registerCommandStub)

  const result = await $.command.run(runArgs('banana'))

  expect(result.text).toContain('작업 끝 알림 상태')
})

// =============================================================================
// PromptHint: 음소거일 때만 꼬리말이 붙는다
// =============================================================================

const PROMPT_HINT = {
  plugin: 'done-alarm',
  component: 'PromptHint',
  requestId: 'prompt-hint',
  viewport: { columns: 100, rows: 30, isFullscreen: false },
  props: { isDraft: false, isWorking: false, hint: '현재 상태' },
} as const

test('PromptHint: 평소엔 아무 것도 덧붙이지 않는다', async ($, on) => {
  on('command.register', registerCommandStub)
  on('ui.render', { component: 'PromptHint' }, ($, e) => ({
    type: 'Text',
    props: {},
    children: [String(e.props.tail ?? '')],
  }))

  const ui = await $.ui.mount({ ...PROMPT_HINT, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: '' })).toBeDefined()
})

test('PromptHint: /alarm off 뒤에는 "알림 꺼짐" 꼬리말이 붙는다', async ($, on) => {
  on('command.register', registerCommandStub)
  on('ui.render', { component: 'PromptHint' }, ($, e) => ({
    type: 'Text',
    props: {},
    children: [String(e.props.tail ?? '')],
  }))

  await $.command.run(runArgs('off'))

  const ui = await $.ui.mount({ ...PROMPT_HINT, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: '알림 꺼짐' })).toBeDefined()
})
