# mods 치트시트 (한국어)

mods 개발에 필요한 파일 구성, 이벤트, API, 렌더 사이트, 한계를 표로 압축했어요. 설명은 최대한 짧게 줄였으니 전체 맥락은 [mods가 뭔가요?](what-are-mods.md)와 [나만의 mod 만들기](make-your-own.md)를 먼저 보세요.

> 기준 버전은 Claude Code **2.1.291**이에요. 버전마다 이벤트·API가 바뀔 수 있어서, 정확한 정의는 `--plugin-dir`로 mod를 불러올 때 생성되는 타입 선언(`.claude-plugin/types/claude-code/index.d.ts`)이 이 문서보다 우선해요.

## 목차

- [파일 구성](#파일-구성)
- [훅 함수 인자](#훅-함수-인자)
- [이벤트](#이벤트)
- [`$` API 네임스페이스](#-api-네임스페이스)
- [렌더 사이트](#렌더-사이트)
- [요소 (elements)](#요소-elements)
- [한계 (limits)](#한계-limits)
- [설정·환경변수](#설정환경변수)
- [명령어](#명령어)

## 파일 구성

| 파일 | 필수 | 내용 |
| --- | --- | --- |
| `.claude-plugin/plugin.json` | 예 | 플러그인 매니페스트. mod라서 추가로 필요한 필드는 없어요 |
| `hooks/hooks.json` | 예 | `modules`: 훅 모듈 경로 배열. `"modules": ["./register.js"]`처럼 하나만 적어요. 설정 훅도 `hooks` 키 아래 같이 담을 수 있어요 |
| 훅 모듈 (예: `hooks/register.ts`) | 예 | mod의 진입점. `register(on, options)`를 내보내는 ES 모듈. 확장자: `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.mts`, `.cts`, `.tsx` |
| `types/index.d.ts` (매니페스트의 `types`가 가리킴) | `$.state`를 쓰거나 mods API에 네임스페이스를 더할 때만 | `PluginState` 값과 추가 네임스페이스 선언 |
| `*.test.ts` / `*.test.tsx` | 아니요 | `claude plugin test`가 돌리는 테스트 |

`register`는 `on`과 `options`를 받아요. `options`는 `userConfig` 필드 값이고, 기본값이 채워져 있어요.

## 훅 함수 인자

`on(이벤트 이름, 매처?, 훅)`로 등록해요. 매처는 이벤트 필드를 거르는 선택적 필터고, `on`의 반환값은 `.catch(핸들러)`를 붙일 수 있는 registration이에요.

| 인자 | 뜻 |
| --- | --- |
| `$` | mods API. 반드시 `$.네임스페이스.메서드(...)`로 끝까지 풀어서 써요 |
| `e` | 이벤트 입력값. 깊이 동결(frozen)돼 있어 직접 못 고쳐요. 바꾸려면 복사해서 `next`에 넘겨요 |
| `next(e)` | 다음 핸들러(다른 mod, 마지막엔 Claude Code 자체 동작)를 불러요. 결과로 resolve돼요 |
| `next.signal` | 이벤트가 중단되면 abort되는 `AbortSignal` |
| `next.origin` | 이 이벤트를 쏜 쪽을 담은 `{ plugin, tier }`. Claude Code 자신은 `{ plugin: 'engine', tier: 'core' }`이고, mod의 `tier`는 `prepend`/`user`/`append`/`builtin` |
| `next.budget` | 이 훅의 시간 제한. `next.budget.ms`는 전체 한도, `next.budget.remainingMs`는 남은 시간 |
| `next.to(e, tier)` | `append`/`builtin`/`core` 중 더 뒤 tier로 건너뛰어요. `prependPlugins`·`appendPlugins`에 속한 mod만 부를 수 있어요 |
| `next.error`, `next.called` | `.catch` 핸들러 안에서만 써요. `next.error.kind`는 `throw`나 `timeout`, `next.called`는 실패한 훅이 `next`를 불렀었는지 |

## 이벤트

표의 "돌려줄 수 있는 것"에서 `next(e)`는 그대로 통과, `next({ ...e, text })`는 그 필드만 바꿔 통과, 객체를 바로 반환하면 `next`를 안 부르고 직접 응답하는 거예요.

**도구**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `tool.call` | 도구를 실행하기 직전 | `next(e)`, `{ deny: 이유 }`, `{ result }` |
| `tool.check` | `tool.call`과 `PreToolUse` 훅 다음, 실행 여부를 결정할 때 | `{ decision }` (`allow`/`ask`/`deny`) |
| `tool.describe` | 도구 설명을 Claude에게 처음 보낼 때, 도구마다 한 번 | `{ description, isDeferred? }` |

**프롬프트와 Claude가 읽는 것**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `prompt.submit` | 프롬프트가 제출될 때 | `next({ ...e, text })`, `next({ ...e, context })`, `{ drop: 이유 }` |
| `prompt.fill`, `prompt.suggest` | 프롬프트 입력창에 초안·흐린 제안이 들어가기 직전 | 바뀐 텍스트로 `next(e)` |
| `prompt.edit` | 사용자가 프롬프트 입력창을 편집할 때 | `next(e)` |
| `prompt.compose` | 시스템 프롬프트를 그릴 때 | `{ sections }` |
| `prompt.section` | 시스템 프롬프트의 이름 붙은 섹션마다 한 번 | `{ text }`, 생략하려면 `{ text: null }` |
| `prompt.context` | 대화마다 한 번, 첫 메시지와 보내는 맥락 | `{ blocks }` |
| `prompt.attachment` | Claude Code가 리마인더 같은 메시지를 자체 추가할 때 | `{ text }`, 생략하려면 `{ text: null }` |
| `skill.prompt` | 스킬 글이 Claude에게 펼쳐질 때 | `{ text }` |
| `attribution.text` | 커밋·PR 귀속 문구를 만들 때 | `{ text }` |

**명령과 설정**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `command.run` | 명령이 실행되기 직전 | `{ text }`, `{}`, `next(e)` |
| `command.describe` | 명령 목록용 설명, 명령마다 한 번 | `{ description, argumentHint, isHidden }` |
| `config.set` | `/config` 행 값이 바뀌기 직전 | `next({ ...e, value })`, `{ deny: 이유 }` |
| `config.describe` | `/config` 행마다 한 번 | `{ label, description, isHidden }` |

**턴**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `turn.start` | 턴이 시작될 때 | `next(e)` |
| `turn.step` | 모델에 요청 하나를 보내기 직전 (도구 호출이 있으면 여러 번) | `yield* next(e)`, `next({ ...e, model })`, `next({ ...e, effort })` |
| `turn.complete` | 턴이 끝났을 때 | `next(e)`, 또는 답변 아래 한 줄을 보여줄 `{ text }` |

**세션**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `session.start` | mod마다 한 번, 첫 프롬프트 전 (리로드 후에도 실행, `/clear`·`/resume`·`/branch` 후엔 안 됨) | `next(e)` |
| `session.end` | 세션 종료, 또는 `/clear`·`/resume`·`/branch` | `next(e)` |
| `session.compact` | 대화를 압축하기 직전 | `{ skip: 이유 }` |
| `session.receive`, `session.send` | 다른 에이전트·세션과 메시지를 주고받을 때 | 받기 `{ consumed: 이유 }`, 보내기 `{ isDelivered: false, reason }` |
| `session.append` | 대화에 남는 각 행이 저장되기 전 | `next({ ...e, message })` |
| `session.attach`, `session.detach` | 다른 앱이 세션에 연결·해제될 때 | `next(e)` |
| `session.measure` | 턴이 끝날 때마다, 플랜 한도 퍼센트가 바뀔 때 | `next(e)` |

**서브에이전트**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `agent.offer` | 서브에이전트 종류를 Claude에게 제안할 때 | 숨기려면 `{ isOffered: false }` |
| `agent.spawn` | 서브에이전트·에이전트 팀 동료가 시작되기 직전 | 모델 지정 `next({ ...e, model })`, 거부 `{ deny: 이유 }` |

**인터페이스**

| 이벤트 | 언제 |
| --- | --- |
| `ui.render` | 렌더 사이트를 그리기 직전 |
| `ui.resolve` | mod 로드 시, 앱·사이트·mod마다 한 번 |
| `ui.press`, `ui.input`, `ui.select` | mod가 그린 `Button`/`Input`/`Select`를 쓸 때 |
| `ui.focus`, `ui.scroll` | 포커스·스크롤 위치가 바뀌기 직전 |
| `ui.close` | 패널이 닫히기 직전 |
| `ui.message` | `Client` 요소가 mod에 데이터를 보낼 때 |
| `ui.fault` | mod가 그린 `Client`가 로드·그리기·실행에 실패할 때 (2.1.289+) |

**다른 mod**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `plugin.register` | 훅 모듈이 로드되기 직전. `e.uses`에 그 mod가 받는 이벤트·호출·환경변수·상태가 담김 | `{ refuse: 이유 }` |
| `engine.create` | 이 mod용 mods API를 만들 때 | 네임스페이스를 더하거나 뺀 API |

**텔레메트리**

| 이벤트 | 언제 | 돌려줄 수 있는 것 |
| --- | --- | --- |
| `telemetry.log`, `telemetry.mark` | 사용량 기록이 남거나 기능 사용이 표시될 때. 설치한 mod는 `{ to: 'collector' }` 매처 필수 | `next(e)`, `{ deny: 이유 }` |

**설정 훅 이벤트**: `classic.<이벤트>` 형태예요 (예: `classic.Stop`, `classic.PostToolUse`). `e`는 설정 훅이 stdin으로 받는 JSON 그대로예요.

**mods API 호출 자체**: 모든 mods API 메서드는 `네임스페이스.메서드` 이름의 이벤트이기도 해요 (예: `fs.read`, `model.complete`, `ui.open`). 앞선 mod가 가로채서 `next(e)`, `{ deny: 이유 }`, `{ value }`로 답할 수 있어요.

## `$` API 네임스페이스

| 네임스페이스 | 메서드 | 뜻 |
| --- | --- | --- |
| `$.plugin` | `name`, `root` | 이 플러그인의 이름과 디렉터리 |
| `$.ui` | `resolve`, `invalidate`, `open`, `close`, `panes`, `focus`, `scroll`, `toast`, `status`, `log`, `notice`, `ask`, `copy`, `selection`, `blit` | 화면 그리기, 패널 열고 닫기, 토스트·질문 띄우기 |
| `$.command` | `register`, `run`, `list` | `/명령어` 추가·실행·목록 |
| `$.tool` | `register`, `call`, `check`, `list` | Claude가 쓸 도구 추가·호출·검사·목록 |
| `$.agent` | `register`, `spawn`, `list` | 서브에이전트 등록·실행·목록 |
| `$.model` | `complete`, `fork`, `classify` | 대화 바깥에서 모델에 직접 질문 |
| `$.prompt` | `submit`, `read`, `fill`, `suggest`, `compose` | 프롬프트 제출·읽기·입력창 채우기 |
| `$.turn` | `abort` | 진행 중인 턴 중단 |
| `$.session` | `messages`, `cwd`, `root`, `model`, `turns`, `id`, `repo`, `surfaces`, `usage`, `version`, `compact`, `send`, `append`, `authorize` | 세션 정보 읽기, 다른 세션에 메시지 보내기 |
| `$.config` | `list`, `set` | `/config` 값 읽기·쓰기 |
| `$.settings` | `read` | 설정 파일·관리 정책 읽기 |
| `$.env` | `get`, `set` | 환경변수 읽기·쓰기 |
| `$.fs` | `read`, `write`, `list`, `exists`, `stat`, `ancestors` | 파일 읽기·쓰기·목록 |
| `$.store` | `get`, `set`, `delete`, `keys` | 이 컴퓨터의 모든 세션이 공유하는 키-값 저장소 |
| `$.state` | `get`, `set` (+ `atom`, `read`, `update`, `derive`, `memberOf` 임포트) | 반응형 상태. 값을 쓰면 그 값을 읽는 화면이 자동으로 다시 그려짐 |
| `$.clock` | `now`, `sleep`, `after`, `every` | 타이머 (`setTimeout`·`setInterval` 대신) |
| `$.http` | `fetch` | 네트워크 요청 |
| `$.process` | `run`, `spawn` | 프로그램 실행 |
| `$.mcp` | `call`, `connect` | 연결된 MCP 서버 도구 호출 |
| `$.audio` | `play`, `speak` | 소리 재생 |
| `$.telemetry` | `log`, `mark` | 사용량 기록 (Claude Code·내장 mod가 부를 때만 실제 전송됨) |

## 렌더 사이트

| 사이트 | `e.props` | `e.requestId` | 그려지는 곳 |
| --- | --- | --- | --- |
| `Pane` | `title`, `isFocused`, `bodyColumns`, `placement`, `scroll`, `view` | 그 패널의 `id` | 터미널, 데스크톱 |
| `AbovePrompt` | `hasSurvey`, `isWorking`, `maxRows`, `bodyColumns`, `scroll`, `view` | 단일 인스턴스 | 터미널, 데스크톱 |
| `UserMessage` | `text`, `origin`, `isExpanded` 등 | 메시지 id | 터미널, 데스크톱 |
| `AssistantMessage` | 답변 텍스트 | 메시지 id | 터미널, 데스크톱 |
| `ToolUse`, `ToolResult`, `ToolGroup` | 도구 이름·입력·결과 | 도구 호출 id | 터미널, 데스크톱 |
| `CommandOutput` | `command`, `text` | 메시지 id | 터미널, 데스크톱 |
| `AskUserQuestion` | 질문과 선택지 | 도구 호출 id | 터미널, 데스크톱 |
| `ToolProgress` | `kind` | 도구 호출 id | 터미널 |
| `Spinner` | `word`, `message`, `suffix`, `mode` | 에이전트 id | 터미널, 데스크톱 |
| `TurnDuration` | `word`, `durationMs` | 메시지 id | 터미널 |
| `InfoNotice` | `text`, `command` | 메시지 id | 터미널 |
| `SessionMode` | `modes` | 단일 인스턴스 | 터미널, 데스크톱 |
| `PromptHint` | `isDraft`, `isWorking`, `hint` | 단일 인스턴스 | 터미널, 데스크톱 |

`e.viewport`엔 `columns`·`rows`·`isFullscreen`이 담겨요 (측정 전엔 없음). 패널·띠의 너비는 `e.props.bodyColumns`로, dock 상태 패널의 높이는 `e.props.scroll.bodyRows`로 맞춰요.

## 요소 (elements)

| 요소 | 주요 props | 터미널 | 데스크톱 |
| --- | --- | :-: | :-: |
| `Box` | `key`, 플렉스 레이아웃, `gap`, `padding`, `margin`, `width`, `height`, `borderStyle`, `backgroundColor` | ✓ | ✓ |
| `Text` | `color`, `backgroundColor`, `bold`, `italic`, `underline`, `dimColor`, `inverse`, `wrap` | ✓ | ✓ |
| `Button` | `key`, `label`, `onPress`, `hotkey`, `plain`, `dimColor`, `autoFocus`, `action` | ✓ | ✓ |
| `Link` | `href`, `label` | ✓ | ✓ |
| `Code` | 코드 본문 (최대 10,000자) | ✓ | ✓ |
| `Markdown` | `text`(최대 10,000자), `key`, `dimColor`, `onLinkPress` | ✓ | ✓ |
| `Input` | `key`, `label`, `placeholder`, `value`, `submitLabel`, `onSubmit`, `onInput`, `autoFocus` | ✓ | ✓ |
| `Select` | `key`, `label`, `options`, `value`, `onSelect`, `autoFocus` | ✓ | ✓ |
| `Svg` | SVG 문서 (최대 131,072자) | | ✓ |
| `Client` | `module`, `key`. 별도 파일이 그리는 영역(애니메이션·포인터 입력) | ✓ | ✓ |
| `Raster` | `key`, `columns`(최대 512), `rows`(최대 256), `cells` | ✓ | |
| `Image` | PNG·RGBA 바이트(최대 2MiB) 또는 파일 경로 | ✓ | |

## 한계 (limits)

| 항목 | 값 |
| --- | --- |
| 훅 하나의 실행 시간 (`next`·mods API 호출 대기 시간 제외) | 10초, `prompt.edit`는 50ms |
| `.catch` 핸들러 실행 시간 | 1초 |
| `session.end` 훅 전체 | SessionEnd 훅 예산만큼 (기본 1.5초) |
| `$.process.run` 타임아웃 | 기본 30초, 최대 10분 |
| `$.model.complete`의 `maxTokens` | 기본 1024, 최대 64,000 또는 모델 한도 |
| `$.fs.read`/`$.fs.write` | 파일 하나당 4MiB |
| `Text` 자식 문자열 하나 | 10,000자 |
| `$.store` | 전체 4MiB JSON |
| `$.session.messages()` | 최신 4,096개 항목 |
| `$.ui.invalidate('ui.render')` 다시 그리기 | 초당 10회 (터미널의 보이는 패널·펼친 띠·힌트 줄은 30회)로 제한. 더 빠른 호출은 합쳐짐 |
| `$.ui.toast` | 기본 4초간 표시 |
| 사용자 요청 없이 연 패널 | 터미널 144칸부터 표시, 한 번 연 적 있으면 110칸부터 |
| 명령·도구·서브에이전트·패널 이름 | 영문자·숫자·`_`·`-`, 최대 64자 |
| `claude plugin test` 테스트 하나 | 기본 5초 |

## 설정·환경변수

| 이름 | 어디서 | 뜻 |
| --- | --- | --- |
| `CLAUDE_CODE_PLUGIN_DIRS` | 환경변수 또는 `~/.claude/settings.json`의 `env` | `--plugin-dir`처럼 플러그인 디렉터리를 불러옴 |
| `CLAUDE_CODE_PLUGIN_DIR_WATCH` | 환경변수 | `1`이면 비인터랙티브 세션도 저장할 때 `--plugin-dir` mod를 리로드 |
| `prependPlugins`, `appendPlugins` | managed settings (managed settings가 없는 개인 사용자는 직접 설정 가능) | mod 실행 순서를 사용자 mod보다 앞·뒤로 고정 |
| `allowManagedModsOnly` | managed settings (내장 가드 옵션) | 조직 mod와 내장 mod만 로드 |
| `allowModsToOverrideDenyRules` | managed settings (내장 가드 옵션) | 사용자 mod가 `deny` 규칙을 뒤집어 승인하게 허용 |
| `allowManagedHooksOnly` | managed settings | 조직 것이 아닌 훅·설치 mod를 차단 |
| `disableAllHooks` | 모든 설정 파일 | 설치된 mod의 훅을 전부 끔 (내 설정이면 내 mod만, managed settings면 전부) |
| `disableSideloadFlags` | managed settings | 시작할 때 `--plugin-dir`·`--plugin-url` 거부 |
| `pluginConfigs` | 사용자 또는 managed settings | mod의 `userConfig` 값을 저장 |

## 명령어

| 명령 | 하는 일 |
| --- | --- |
| `/plugin` | 탭 아래 `N mods active · 이름`처럼 로드된 mod 수를 보여줌 |
| `claude plugin validate <경로>` | 매니페스트와 훅 모듈을 읽어 에러, 받는 이벤트(`hooks:`), 호출하는 API(`calls:`)를 출력. `--strict`는 경고도 에러로, `--json`은 기계가 읽을 보고서로 |
| `claude plugin test [경로]` | `.test.ts`/`.test.tsx`로 끝나는 파일을 전부 실행. 실패하면 종료 코드 1 |
| `claude --plugin-dir <경로>` | 세션 하나에만 플러그인 디렉터리를 불러오고, 저장할 때마다 훅 모듈을 리로드. 여러 번 반복 가능 |
| `/reload-plugins` | 지금 실행 중인 세션에 플러그인 변경 사항을 바로 반영 |

---

더 알아보기: [mods가 뭔가요?](what-are-mods.md) · [설치 가이드](install.md) · [나만의 mod 만들기](make-your-own.md) · [안전 가이드](safety.md) · [README](../../README.md)
