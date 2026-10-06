# mods가 뭔가요?

mod는 Claude Code 2.1.287부터 쓸 수 있는 공식 기능이에요. 플러그인(`plugin`) 안의 자바스크립트·타입스크립트 코드가 도구 호출이나 프롬프트 제출 같은 이벤트를 직접 받아서, Claude Code의 동작을 바꾸거나 화면을 그려요. 이 글은 mod가 정확히 뭔지, 뭘 할 수 있는지, 어디서 도는지, 비슷한 다른 기능들과 뭐가 다른지, 어떻게 켜고 끄는지를 정리해요.

## 목차

- [한 줄 정의](#한-줄-정의)
- [어떻게 동작하나요](#어떻게-동작하나요)
- [mod가 할 수 있는 일](#mod가-할-수-있는-일)
- [어디서 도나요](#어디서-도나요)
- [설정 훅·스킬·MCP와 뭐가 다른가요](#설정-훅스킬mcp와-뭐가-다른가요)
- [Claude Code에 내장된 mods](#claude-code에-내장된-mods)
- [mods 켜고 끄기](#mods-켜고-끄기)
- [버전 요구사항](#버전-요구사항)

## 한 줄 정의

mod는 **Claude Code 안에서 직접 실행되는 플러그인(`plugin`) 코드**예요. 도구 호출, 프롬프트 제출, 화면 그리기처럼 Claude Code가 뭔가 하려는 순간마다 "이벤트(`event`)"가 발생하는데, mod는 자바스크립트나 타입스크립트로 쓴 함수(훅, `hook`)로 그 이벤트를 받아서 지켜보거나, 바꾸거나, 아예 가로채서 대신 처리해요.

> 한 줄 자가요약: mod는 Claude Code 이벤트 사이에 끼어드는 미들웨어(`middleware`)예요. 보고, 바꾸고, 대신 답해요.

Claude Code는 설정 파일로 등록하는 기존 방식도 "훅"이라고 부르지만, k-mods 문서에서 "훅"은 항상 mod의 핸들러를 가리켜요. 셸 명령·HTTP 요청·프롬프트로 동작하는 기존 방식은 "설정 훅(`settings hook`)"이라고 따로 불러요.

공식 문서: [Mods overview](https://code.claude.com/docs/en/plugins/mods/overview)

## 어떻게 동작하나요

mod 하나의 코드(훅 모듈, `hooks module`)는 `register(on)` 함수를 내보내고, 그 안에서 `on(이벤트 이름, 핸들러)`로 이벤트를 등록해요. Claude Code는 핸들러에 세 가지를 넘겨줘요.

- `$`: mod API예요. 화면을 그리거나 파일을 읽는 등 바깥세상과 닿는 유일한 통로예요.
- `e`: 이벤트 데이터예요. 읽기 전용이라 고쳐 쓸 수 없어요.
- `next`: 다음 핸들러(다른 mod이거나 Claude Code 자체 동작)를 부르는 함수예요.

핸들러는 이 셋 중 하나로 이벤트를 처리해요.

| 처리 방식 | 하는 일 | 코드 |
| --- | --- | --- |
| 관찰(`observe`) | 그대로 흘려보내요 | `return next(e)` |
| 변형(`rewrite`) | 내용을 바꿔서 흘려보내요 | `return next({ ...e, text: e.text.trim() })` |
| 응답(`answer`) | `next`를 부르지 않고 직접 답해서 체인을 끊어요 | `return { deny: '이유' }` |

예를 들어 도구 호출마다 카운트를 올리고 스피너 옆에 보여주는 mod는 이렇게 생겼어요.

```javascript
let calls = 0

export function register(on) {
  on('tool.call', async ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render') // 화면을 다시 그려 달라고 요청
    return next(e) // 도구는 평소대로 실행
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · 도구 ' + calls + '번' } })
  })
}
```

첫 번째 훅은 `tool.call`을 관찰만 하고, 두 번째 훅은 `ui.render`를 변형해서 스피너 문구 뒤에 호출 횟수를 붙여요. 같은 이벤트에 여러 mod가 걸려 있으면 미들웨어 체인처럼 순서대로 실행돼요. 등록 순서 규칙과 실패 처리는 [치트시트](cheatsheet.md)와 [나만의 mod 만들기](make-your-own.md)에서 더 다뤄요.

공식 문서: [How a mod works](https://code.claude.com/docs/en/plugins/mods/overview#how-a-mod-works), [React to events](https://code.claude.com/docs/en/plugins/mods/events)

## mod가 할 수 있는 일

설정 훅, 스킬, 상태줄(`status line`), MCP 서버는 모두 Claude Code **바깥**에서 움직여요. 스크립트를 실행하거나 Claude에게 글이나 도구를 쥐여줄 뿐이에요. mod는 Claude Code **안**에서 돌기 때문에 이런 걸 할 수 있어요.

1. **화면 그리기**: 트랜스크립트 옆 패널(`pane`)이나 입력창 위 띠(`AbovePrompt`)에 탭, 버튼, 입력창을 그려요.
2. **Claude Code 자체 화면 다시 그리기**: 도구 호출 줄, 스피너, Claude가 질문할 때 쓰는 대화상자 같은 걸 바꾸거나 새로 그려요.
3. **도구 호출·요청 가로채기**: 도구 호출을 잠깐 멈추고 사용자에게 물어보거나, 실행 없이 바로 답하거나, 요청 하나를 다른 모델로 보내요.
4. **명령으로 내 코드 바로 실행**: Claude 턴 없이 즉시 실행되는 `/명령어`를 추가해요. Claude가 작업 중이어도 실행되게 할 수 있어요.
5. **훅끼리 데이터 공유**: 한 mod 안의 훅들은 같은 파일의 변수를 공유해요. 한 훅이 도구 호출 수를 세면 다른 훅이 그 값을 화면에 보여주는 식이에요.

공식 문서: [What a mod can do](https://code.claude.com/docs/en/plugins/mods/overview#what-a-mod-can-do)

## 어디서 도나요

mod의 훅은 플러그인이 로드되는 모든 세션에서 실행돼요. 다만 **화면을 그리는 기능**은 터미널과 데스크톱 앱에서만 보여요.

| 실행 환경 | 훅 실행 | 화면 표시 |
| --- | :-: | :-: |
| 터미널(`claude`), 에디터 통합 터미널, JetBrains 플러그인 | 됨 | 보임 |
| 데스크톱 앱 Code 탭 (WSL 세션 제외) | 됨 | 보임 (터미널 전용 요소 일부 제외) |
| 데스크톱 앱의 WSL 세션 | 안 됨 (WSL에선 플러그인 자체가 안 됨) | 안 보임 |
| VS Code 확장 채팅 패널 | 됨 | 안 보임 |
| `claude -p`, Agent SDK | 됨 | 안 보임 |
| claude.ai·모바일 앱의 원격 제어(`Remote Control`) | 됨 (내 컴퓨터 세션에서) | 내 컴퓨터 터미널에만 보임 |
| 클라우드 세션 | 플러그인이 클라우드 세션까지 닿을 때만 됨 | 안 보임 |

화면을 그리는 mod는 지금 어떤 앱에서 돌고 있는지 확인해서, 그림을 못 그리는 곳에서는 트랜스크립트 줄이나 명령 답변 텍스트로 대신하는 게 좋아요.

공식 문서: [Where mods run](https://code.claude.com/docs/en/plugins/mods/overview#where-mods-run)

## 설정 훅·스킬·MCP와 뭐가 다른가요

| | mod | 설정 훅(`settings hook`) | 스킬(`skill`) | MCP 서버 |
| --- | --- | --- | --- | --- |
| 정체 | Claude Code 프로세스 안에서 직접 도는 플러그인 함수 | 생명주기 이벤트에 Claude Code가 실행하는 셸 명령·HTTP 요청·프롬프트 | Claude가 읽는 지침이 담긴 `SKILL.md` | 외부 프로세스·서비스가 Claude에게 도구를 줌 |
| 바꿀 수 있는 것 | 도구 호출, 프롬프트, 명령, 턴, 화면에 그리는 내용 | 이벤트 진행 여부, 도구 호출의 인자·결과, Claude에게 추가되는 맥락 | Claude가 아는 것과 하는 일 | Claude가 쓸 수 있는 도구 |
| 화면을 그리나요 | 가능 | 불가능 | 불가능 | 불가능 |
| 뭘로 만드나요 | 자바스크립트·타입스크립트 | 스크립트 + `settings.json` 항목 | 마크다운 | 아무 언어로 만든 서버 |
| 언제 고르나요 | 패널이나 입력창 위 띠가 필요할 때, 커스텀 명령이 필요할 때, 이벤트 자체를 바꿔야 할 때 | 이미 있는 스크립트로 이벤트를 막거나 허용하거나 기록만 하면 될 때 | 같은 지침을 계속 붙여넣고 있을 때 | Claude가 외부 시스템에 닿아야 할 때 |

하나의 플러그인이 mod, 스킬, MCP 서버를 동시에 담을 수도 있어요. k-mods의 `mod-store`처럼 명령(`/k-mods`)과 화면 그리기를 함께 갖춘 mod가 그 예예요.

공식 문서: [Compare mods, settings hooks, skills, and MCP servers](https://code.claude.com/docs/en/plugins/mods/overview#compare-mods-settings-hooks-skills-and-mcp-servers)

## Claude Code에 내장된 mods

Claude Code 자체 기능 중 일부도 mod로 만들어져 있어요. `/plugin` → **Installed** 탭의 **Built-in** 아래에서 볼 수 있고, 업데이트·삭제는 안 되지만 끌 수는 있어요.

| `/plugin`에 뜨는 이름 | 하는 일 | 끄는 법 |
| --- | --- | --- |
| `cc-plugin-agents-md` | `AGENTS.md`를 프로젝트 지침으로 불러옴 | `/plugin`에서 끄거나, 어떤 지침 파일을 쓸지 설정 변경 |
| `cc-plugin-diff` | `/diff` 명령과 그 패널을 담당 | `/plugin`에서 끄면 `/diff`는 Claude Code 기본 버전으로 동작 |
| `cc-plugin-plugin-authoring` | mod를 쓰기 위한 `plugin-authoring` 스킬 제공 | `/plugin`에서 끔 |
| `cc-plugin-sec-default` | 사용자가 설치한 mod로부터 조직이 관리하는 설정을 지켜줌 | 사용자는 못 끔. 관리자가 managed settings에서 순서를 정함 |
| `cc-plugin-telemetry` | Claude Code와 내장 mods의 사용량 기록 전송 | `/plugin`에서 끄거나 분석 기능 자체를 끔 (`DISABLE_TELEMETRY` 등) |
| `cc-plugin-you-should-know` | 작업이 길어질 때 놓치기 쉬운 걸 알려주는 보조 에이전트 | 기본은 꺼져 있음. `/plugin`에서 켜고 끔 |

`diff`, `agents-md`, `sec-default`, `telemetry`의 소스는 [claude-code 저장소의 mods 디렉터리](https://github.com/anthropics/claude-code/tree/main/mods)에 테스트까지 포함해서 공개돼 있어요. 실제 mod 코드가 어떻게 생겼는지 참고하기 좋아요.

공식 문서: [Mods built into Claude Code](https://code.claude.com/docs/en/plugins/mods/overview#mods-built-into-claude-code)

## mods 켜고 끄기

끄는 범위에 따라 방법이 달라요.

- **mod 하나만**: `/plugin` → **Installed** 탭에서 비활성화하거나 삭제해요.
- **이번 세션의 모든 mod**: `claude --safe-mode`로 시작해요. 다른 커스터마이징도 같이 꺼져요.
- **내가 설치한 모든 mod, 모든 세션**: `~/.claude/settings.json`에 `"disableAllHooks": true`를 설정해요. 설정 훅과 커스텀 상태줄도 같이 꺼지고, 조직이 관리하는 것만 계속 돌아요.

조직 소속이라면 관리자가 managed settings로 mod 로드 자체를 더 제한할 수도 있어요. 자세한 내용은 [안전 가이드](safety.md)에 있어요.

> 얼리 액세스 때 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS`를 설정했다면 지워 주세요. Claude Code 2.1.287부터는 이 변수를 무시해서 `0`으로 둬도 mod가 꺼지지 않아요.

공식 문서: [Turn mods on or off](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)

## 버전 요구사항

- **터미널**: Claude Code 2.1.287 이상. `claude --version`으로 확인해요.
- **데스크톱 앱**: 2.1.286 이상. Code 탭에서 `/status`를 입력하면 **Claude Code** 줄에 버전이 나와요.

버전이 낮으면 mod가 설치는 되어도 로드되지 않아요. 설치·업데이트 방법은 [설치 가이드](install.md)를 보세요.

공식 문서: [Turn mods on or off](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)

---

더 알아보기: [설치 가이드](install.md) · [나만의 mod 만들기](make-your-own.md) · [안전 가이드](safety.md) · [치트시트](cheatsheet.md) · [README](../../README.md)
