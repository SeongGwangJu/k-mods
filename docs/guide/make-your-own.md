# 나만의 mod 만들기

mod를 만드는 방법은 두 가지예요. Claude에게 말로 시키거나, 직접 코드를 써도 돼요. 이 글은 두 방법을 모두 다루고, 마지막엔 완성한 mod를 k-mods에 올리는 절차로 이어져요.

## 목차

- [Claude에게 시키기](#claude에게-시키기)
- [직접 만들기](#직접-만들기)
  - [1. 파일 세 개 만들기](#1-파일-세-개-만들기)
  - [2. 코드 쓰기](#2-코드-쓰기)
  - [3. 불러와서 써보기](#3-불러와서-써보기)
  - [4. 타입 선언과 validate](#4-타입-선언과-validate)
  - [5. 정적 분석 규칙](#5-정적-분석-규칙)
  - [6. 테스트 쓰기](#6-테스트-쓰기)
  - [7. 상태 저장: 변수 vs state vs store](#7-상태-저장-변수-vs-state-vs-store)
- [k-mods에 올리기](#k-mods에-올리기)

## Claude에게 시키기

가장 빠른 방법이에요. 세션 안에서 원하는 걸 그대로 말하면 돼요.

```
입력창 위에 현재 git 브랜치를 보여주는 mod 만들어 줘
```

Claude는 내장 스킬인 `plugin-authoring`을 써서 mod를 작성해요. 이 스킬이 지금 쓰고 있는 Claude Code 버전에서 어떤 이벤트·API를 쓸 수 있는지, mod를 어디에 저장해야 하는지 알고 있어요. 스킬을 직접 켜고 싶으면 세션에서 `/plugin-authoring`을 입력하세요.

진행 흐름은 이래요.

1. **작성 위치**: Claude는 `~/.claude/dev-mods/<이 세션의 ID>/<mod 이름>/`에 파일을 써요. `default`·`acceptEdits` 권한 모드에서는 `~/.claude`가 보호된 경로라서, 파일 하나하나 저장할 때마다 승인을 물어봐요.
2. **핫 리로드 승인**: 첫 파일을 저장하면 "이 세션에서 핫 리로드를 켤지" 물어봐요. **이번 세션에 한해 켜기**를 고르면, 이 세션의 `dev-mods` 폴더에 있는 mod들이 턴이 끝날 때 로드되고, 파일이 바뀐 턴이 끝날 때마다 다시 로드돼요. 이 선택은 세션을 재개해도 유지돼요. **지금은 안 함**을 고르면 파일은 그대로 남지만, 다음에 그 세션을 다시 시작할 때 로드돼요.
3. **로드 확인**: `/plugin` → **Installed** 탭에서 mod가 보이는지 확인하고, 여기서 끌 수도 있어요.
4. **써보고 고치기**: 원하는 대로 안 됐으면 Claude에게 뭘 바꿀지 말하면 돼요. 파일을 바꾼 턴이 끝나면 바로 다음 시도를 해볼 수 있어요.

몇몇 세션에서는 Claude가 쓴 mod가 아예 로드되지 않아요: 승인해 줄 사람이 없는 `claude -p` 실행이나 `dontAsk` 모드, 아직 신뢰(trust)하지 않은 워크스페이스, `--safe-mode`·`--bare`·`disableAllHooks`나 조직 정책으로 mod 자체가 꺼진 경우예요.

**mod를 계속 쓰고 싶다면**: `dev-mods` 폴더는 그 세션을 만든 세션 전용이고, `cleanupPeriodDays`(기본 30일)가 지나면 자동으로 지워져요. 계속 쓰려면 폴더를 내가 관리하는 곳으로 복사하세요.

```bash
cp -r ~/.claude/dev-mods/<세션 ID>/git-branch ~/mods/git-branch
```

복사한 뒤에는 [직접 만들기](#직접-만들기)에서 설명하는 `--plugin-dir`로 불러오거나, 다른 사람과 쓰려면 마켓플레이스로 공개하면 돼요.

공식 문서: [Ask Claude for a mod](https://code.claude.com/docs/en/plugins/mods/create#ask-claude-for-a-mod)

## 직접 만들기

코드가 어떻게 동작하는지 배우고 싶다면 직접 써보는 게 제일 빨라요. Node.js나 번들러 없이, Claude Code가 `.ts`·`.js` 파일을 바로 읽어요.

여기서는 `tool-tally`라는 mod를 만들어요. 도구를 쓸 때마다 세어서 스피너 옆에 `· 도구 3번`처럼 보여주고, `/tally`를 입력하면 지금까지 센 횟수를 알려줘요.

### 1. 파일 세 개 만들기

```bash
mkdir -p tool-tally/.claude-plugin tool-tally/hooks
```

`tool-tally/.claude-plugin/plugin.json`은 플러그인의 매니페스트(`manifest`)예요.

```json
{
  "name": "tool-tally",
  "version": "0.1.0",
  "description": "도구 호출 수를 세어 스피너 옆에 보여주고 /tally로 알려줘요",
  "author": { "name": "당신의 이름" }
}
```

`tool-tally/hooks/hooks.json`은 코드 파일이 어디 있는지 알려줘요. 이 `modules` 키가 있어야 플러그인이 mod가 돼요.

```json
{
  "modules": ["./register.ts"]
}
```

### 2. 코드 쓰기

`tool-tally/hooks/register.ts`가 훅 모듈(`hooks module`)이에요. `register` 함수를 내보내면 Claude Code가 mod를 로드할 때 한 번 불러요.

```typescript
import type { On } from 'claude-code'

// 횟수. 아래 두 훅이 같이 써요
let calls = 0

export function register(on: On): void {
  // 세션이 시작할 때 한 번: /tally 명령을 등록해요
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'tally', description: '지금까지 쓴 도구 횟수 보기' })
    return next(e)
  })

  // Claude가 도구를 쓰려고 할 때마다
  on('tool.call', async ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render') // 화면을 다시 그려서 새 숫자가 보이게 해요
    return next(e) // 도구는 평소대로 실행
  })

  // /tally를 입력했을 때만
  on('command.run', { command: 'tally' }, async () => {
    return { text: '지금까지 도구를 ' + calls + '번 썼어요' }
  })

  // 스피너를 그릴 때마다
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · 도구 ' + calls + '번' } })
  })
}
```

네 훅이 하는 일이에요.

- `session.start`: 세션 첫 턴 전에 한 번, 그리고 모듈이 리로드될 때마다 실행돼요. `/tally` 명령을 추가해요.
- `tool.call`: Claude가 도구를 쓰기 직전마다 실행돼요. 횟수를 올리고 화면을 다시 그려 달라고 요청해요.
- `command.run`: `/tally`를 입력했을 때만 실행돼요. `next`를 부르지 않고 바로 답하는 "응답(`answer`)" 방식이에요.
- `ui.render`: 스피너를 그릴 때마다 실행돼요. Claude Code의 스피너는 그대로 두고, 단어 뒤에 횟수만 붙이는 "변형(`rewrite`)" 방식이에요.

### 3. 불러와서 써보기

`--plugin-dir`는 설치하지 않고 이번 세션에만 플러그인 디렉터리를 불러와요.

```bash
claude --plugin-dir ./tool-tally
```

뭔가 도구를 몇 번 쓰게 시켜 보면 (`여기 파일 목록 보여주고 README 읽어줘` 등) 스피너 문구가 `Thinking · 도구 2번…`처럼 바뀌어요. 끝나면 `/tally`를 입력해서 `tool-tally: 지금까지 도구를 2번 썼어요`가 나오는지 확인하세요.

세션을 열어 둔 채로 `register.ts`의 `' · 도구 '`를 `' · 지금까지 '`로 바꾸고 저장해 보세요. 저장하면 트랜스크립트에 `tool-tally` reloaded라는 줄이 뜨고, 다음 스피너부터 바로 새 문구가 보여요. 이게 핫 리로드예요.

공식 문서: [Write a mod yourself](https://code.claude.com/docs/en/plugins/mods/create#write-a-mod-yourself)

### 4. 타입 선언과 validate

`--plugin-dir`로 mod를 불러오거나 리로드할 때마다, Claude Code는 내가 쓰는 버전에 정확히 맞는 타입 선언을 `tool-tally/.claude-plugin/types/` 아래에 써 줘요.

| 경로 | 담긴 내용 |
| --- | --- |
| `claude-code/index.d.ts` | 모든 이벤트와 입출력, 모든 mod API 메서드, 각 화면이 그릴 수 있는 요소 |
| `claude-code-tools/index.d.ts` | 내장 도구들의 입력·결과 타입 (`e.tool === 'Bash'`로 좁혀 쓸 수 있게) |
| `claude-code-mcp/index.d.ts` | 최근 저장 시점에 연결돼 있던 MCP 도구들의 입력 타입 |
| `tsconfig.json` | 훅 모듈에 맞춘 컴파일 옵션 |

에디터 자동완성과 타입 체크가 이 파일들을 봐요. 버전마다 이벤트·API가 바뀔 수 있어서, 이 생성된 파일이 다른 모든 문서보다 더 정확해요.

`claude plugin validate`는 세션을 띄우지 않고도 Claude Code가 내 mod를 어떻게 읽는지 보여줘요.

```bash
claude plugin validate ./tool-tally
```

```text
  ❯ ./register.ts hooks: session.start, tool.call, command.run{command=tally}, ui.render{component=Spinner}
  ❯ ./register.ts calls: $.command.register, $.ui.invalidate

✔ Validation passed
```

`hooks:` 줄은 이 모듈이 받는 이벤트를 매처(matcher)와 함께 보여줘요. 의도한 이벤트가 이 줄에 없으면 (보통 이벤트 이름 오타) 그 훅은 실행되지 않아요. `calls:` 줄은 이 모듈이 부르는 mod API를 전부 보여줘요. k-mods에 올릴 mod는 `scripts/check.sh mods/<이름>`으로 `--strict` validate와 테스트를 한 번에 돌려요.

공식 문서: [Get type definitions for your version](https://code.claude.com/docs/en/plugins/mods/create#get-type-definitions-for-your-version), [Check what Claude Code reads from your mod](https://code.claude.com/docs/en/plugins/mods/create#check-what-claude-code-reads-from-your-mod)

### 5. 정적 분석 규칙

Claude Code는 코드를 실행하지 않고도 어떤 이벤트를 받고 어떤 API를 부르는지 읽어내요. 그러려면 코드가 몇 가지 규칙을 지켜야 해요. 어기면 `claude plugin validate`가 에러를 내요.

- **`$.네임스페이스.메서드(...)`를 끝까지 풀어서 쓰기**: `const ui = $.ui`처럼 변수에 담거나, 구조 분해하거나, `$[name]`처럼 계산된 이름으로 접근하면 안 돼요. `$.ui`를 변수에 담으면 `$.ui is used as a value`로 실패해요.
- **`$`를 넘기는 도우미 함수는 같은 파일 최상위에 선언한 함수만**: 클로저, 메서드, 다른 파일에서 가져온 함수에는 `$`를 넘길 수 없어요. (`$.state`의 `read`·`update`는 예외예요.)
- **이벤트 이름은 문자열 리터럴**: `on('tool.call', ...)`처럼 직접 써야 해요. 변수나 반복문으로 이벤트 이름을 돌리면 실패해요.
- **같은 이벤트를 매처 없이 두 번 등록하지 않기**: `session.start`처럼 매처가 없는 이벤트는 한 모듈에 한 번만 등록해요.
- **`register` 안에서 `on`이라는 이름을 다시 선언하지 않기**: 변수나 매개변수로 `on`을 가리면 `"on" is declared again (shadowed)`로 실패해요.
- **import는 플러그인 안의 상대 경로와 `claude-code`만**: 동적 `import()`나 `require`는 안 돼요. 모든 파일은 ES 모듈이에요.
- **Node API·전역 `fetch`·`setTimeout` 없음**: 파일은 `$.fs`, 네트워크는 `$.http`, 타이머는 `$.clock`을 써요.
- **(k-mods 추가 규칙) 도구 호출을 막을 수 있는 훅에는 `.catch` 달기**: `tool.call`, `tool.check`, `prompt.submit`처럼 체인을 끊을 수 있는 훅이 실패하면 어떻게 할지 `.catch`로 정해야 `--strict` validate를 통과해요. 막는 역할의 mod라면 실패했을 때도 막는 쪽으로 답하세요 (fail closed).

공식 문서: [Follow these rules so that static analysis can find every hook and call](https://code.claude.com/docs/en/plugins/mods/create#check-what-claude-code-reads-from-your-mod)

### 6. 테스트 쓰기

`claude plugin test`는 세션도, 로그인도, 네트워크도 없이 훅을 테스트해요. `claude-code/testing`에서 테스트 도구를 가져와요.

`tool-tally/tests/tool-tally.test.ts`:

```typescript
import { expect, test } from 'claude-code/testing'

test('/tally는 지금까지 받은 도구 호출 수를 보고해요', async ($, on) => {
  // Claude Code 대신 도구 호출에 답해 줘요 (실제 도구는 실행 안 됨)
  on('tool.call', () => ({ result: 'ok' }))

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Read', file_path: 'README.md' })

  const answer = await $.command.run({ command: 'tally', args: '' })
  expect(answer.text).toBe('지금까지 도구를 2번 썼어요')
})
```

```bash
claude plugin test
```

`tool-tally` 디렉터리에서 실행하면 테스트 이름과 통과 여부가 떠요. k-mods에 올릴 mod는 순수 로직(분류, 포맷 변환 등)을 `$`를 받지 않는 함수로 따로 빼서 일반 단위 테스트로 검증하고, 이벤트가 오가는 흐름만 `claude plugin test`로 확인하는 걸 권장해요.

공식 문서: [Test a mod](https://code.claude.com/docs/en/plugins/mods/test)

### 7. 상태 저장: 변수 vs state vs store

값을 어디에 두느냐에 따라 얼마나 오래 살아남는지가 달라져요.

| 저장 위치 | 살아남는 기간 | 이럴 때 써요 |
| --- | --- | --- |
| 모듈 변수 (`let calls = 0`) | 모듈이 리로드될 때까지 (개발 중 저장할 때마다 리셋) | 잃어버려도 되는 값. 이 튜토리얼의 `calls`처럼 |
| `$.state` | 세션이 끝나거나 `/clear`·`/resume`·`/branch`를 할 때까지. 리로드에도 살아남아요. | 화면이 의존하는 값인데 리로드는 버텨야 할 때. 값을 쓰면 그 값을 읽는 화면이 자동으로 다시 그려져요 (반응형). |
| `$.store` | 내가 지우거나, `cleanupPeriodDays` 동안 아무 세션도 안 쓸 때까지 | 설정값·기록처럼 다음에 세션을 열어도 남아 있어야 하는 값. 이 컴퓨터의 모든 세션이 하나를 같이 써요. |

세 가지를 섞어 쓰는 경우도 많아요. 자세한 코드 예시(`$.state`에 타입 선언하기, `/clear` 이후 값 복원하기 등)는 공식 문서에 있어요.

공식 문서: [Keep state](https://code.claude.com/docs/en/plugins/mods/interface#keep-state)

## k-mods에 올리기

mod가 다 됐으면 k-mods 카탈로그에 올릴 수 있어요. 코드를 직접 안 써도 되는 방법과, 직접 등록하는 방법 두 가지예요.

- **좋은 mod를 알고 있다면**: 코드를 몰라도 [mod 추천하기](https://github.com/SeongGwangJu/k-mods/issues/new?template=suggest-mod.yml) 이슈만 남기면 돼요.
- **직접 등록하고 싶다면**: `registry/<이름>.json` 파일 하나를 추가하는 PR을 보내세요. 자동 검사가 설치·정적 분석·라이선스를 확인해요.

두 경로 모두 자세한 절차와 규칙은 [기여 가이드](../../CONTRIBUTING.md)에 있어요.

---

더 알아보기: [mods가 뭔가요?](what-are-mods.md) · [설치 가이드](install.md) · [안전 가이드](safety.md) · [치트시트](cheatsheet.md) · [기여 가이드](../../CONTRIBUTING.md) · [README](../../README.md)
