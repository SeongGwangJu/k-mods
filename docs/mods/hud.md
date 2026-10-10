# hud

> 모델·프로젝트·Git·컨텍스트·사용량·도구·할 일을 HUD 한 줄로 표시해요. 예산·이력·작업 요약·상세 패널·테마도 지원해요.

<img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/hud/assets/themes/neon.png" alt="hud" width="640">

| | |
| --- | --- |
| 설치 이름 | `hud` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [hoobnn](https://github.com/hoobnn) |
| 라이선스 | MIT |
| 원본 | [hoobnn/hoobnn-agent-mods/claude-code/hud @ `8fb6f67`](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/hud) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/hud` |
| 준비물 | Nerd Font (nerd·powerline 테마에서만 필요) |
| 권한 | ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🤖 모델 호출 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install hud@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install hud@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) 0.10.0을 mod로 옮긴 것으로, 별도 LICENSE.claude-hud(MIT, Jarrod Watts)로 원저작권을 유지해요. 화면 언어는 k-mods의 `/config`가 아니라 claude-hud 자신의 설정 파일(`~/.claude/plugins/claude-hud/config.json` 또는 `~/.claude/claude-hud.json`)의 `language` 필드를 따라요(기본값 en). plugin.json userConfig에 language 옵션 자체가 없어 여기서는 language 설정을 권장하지 않았어요.
- `summaryEveryTurns`(기본 5턴, 0으로 끌 수 있음)마다 세션 작업을 한 줄로 요약하는 모델 호출이 있어요. 대화를 포크해 프롬프트 캐시를 재사용하는 호출이라 비용은 적지만 사용자 사용량을 소모해요.
- `extraCmd`(claude-hud의 --extra-cmd, 임의 쉘 명령 실행)는 기본 빈 값이고, 쓰려면 옵션 설정과 `CLAUDE_HUD_ALLOW_EXTRA_CMD=1` 환경 변수를 모두 켜야 해요.
- 계정 인증 방식·이메일 일부를 보여주는 기능(claude-hud의 showAuth/showAuthUser)과 다른 로컬 도구로 사용량을 공유하는 파일(externalUsagePath/externalUsageWritePath)은 claude-hud 자체 설정 파일에서만 켤 수 있고 둘 다 기본값이 꺼짐이에요.
- 같은 작성자(hoobnn)의 `spinner` mod를 함께 설치하면 pet이 HUD 옆(below 위치일 때)에 표시돼요. spinner가 없어도 정상 동작해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**.
- ✏️ **파일 쓰기**.
- 🤖 **모델 호출**.
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.
- 🔊 **소리**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run`, `command.run{command=hud}`, `prompt.edit`, `prompt.submit`, `session.attach`, `session.compact`, `session.detach`, `session.measure`, `session.receive`, `session.start`, `state.set{plugin=spinner, key=dock}`, `tool.call`, `tool.call{tool=/"^mcp__hud__hud_debug$"/}`, `turn.complete`, `turn.start`, `turn.step`, `ui.message`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=hud-detail}`, `ui.render{component=PromptHint}`, `ui.render{component=SessionMode}`
- 부르는 API: `$.audio.play`, `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.config.set`, `$.fs.exists`, `$.fs.list`, `$.fs.read`, `$.fs.stat`, `$.fs.write`, `$.model.fork`, `$.process.run`, `$.session.cwd`, `$.session.id`, `$.session.model`, `$.session.repo`, `$.session.root`, `$.session.usage`, `$.session.version`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.store.set`, `$.tool.register`, `$.ui.ask`, `$.ui.close`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- `scripts/cc.sh plugin validate --json` success:true, errors/warnings 없음(직접 실행 확인).
- 6개 mod 중 가장 큰 코드베이스(약 80개 파일)라 전수 확인했어요: register.tsx·stdin.ts·render.ts·remote.ts·live.ts·draw.tsx·extras.ts·themes.ts·transcript-feed.ts·summary.ts·ansi.ts·i18n.ts와 shims/ 전체, hud/ 하위의 config·auth·git·git-runner·jj·memory·extra-cmd·external-usage·cost·daily-cost·speed·usage-pace·transcript·stdin·debug·effort·model-source·index.ts를 직접 읽고, $.http/fetch/http·https 모듈/WebSocket/net·dns·socket/exec·spawn/eval을 코드베이스 전체에 grep으로 전수 검색했지만 네트워크 호출 코드 경로는 어디에도 없어요.
- 로컬 프로세스 실행은 git(상태 조회), jj(jujutsu 저장소일 때), /usr/bin/vm_stat(macOS 메모리), extraCmd(옵트인)뿐이고 전부 shims/child_process.ts를 거쳐 $.process.run으로만 실행돼요. 결과는 모두 화면 렌더링에만 쓰이고 외부 전송 코드는 없어요.
- $.model.fork 호출이 1곳 있어요: turn.complete에서 `config.summaryEvery`(기본 5턴, 0이면 끔) 간격으로 '지금 세션이 하는 작업을 한 줄로 요약해줘'라는 프롬프트를 대화 포크로 보내 세션 요약 줄을 만들어요(hooks/register.tsx:545, hooks/i18n.ts의 summaryPrompt). 실패해도 .catch(() => {})로 무시되고 화면에 영향 없어요.
- `extraCmd`(임의 쉘 명령)는 옵션 값이 있어도 `CLAUDE_HUD_ALLOW_EXTRA_CMD=1` 환경 변수가 없으면 무시되는 이중 게이트가 hooks/hud/extra-cmd.ts의 isExtraCmdAllowed로 구현되어 있어요.
- 파일 쓰기는 모두 ~/.claude/plugins/claude-hud(-mod)/ 하위 로컬 캐시·설정 파일뿐이에요: daily-cost.json(일별 지출 장부), speed-cache/*.json(토큰 속도 캐시), 그리고 externalUsageWritePath를 명시적으로 설정했을 때만 쓰는 사용량 스냅샷(JSON, 0o600 권한, 기본값은 빈 문자열이라 미설정 시 쓰지 않음). 전부 로컬 전용이고 atomic rename·권한 제한(0o600/0o700)을 쓰는 걸 코드로 확인했어요.
- 계정 인증 정보는 ~/.claude.json의 oauthAccount만 로컬로 읽어 플랜 이름과 이메일 아이디 일부를 보여줄 수 있는 기능(showAuth/showAuthUser)이 있지만 둘 다 기본값 false라 기본 설정에서는 표시되지 않아요(hooks/hud/config.ts DEFAULT_CONFIG, hooks/hud/auth.ts).
- 모델이 작성한 도구 입력·transcript 내용 등 신뢰할 수 없는 텍스트는 터미널에 그리기 전 sanitizeDisplayText로 ANSI 이스케이프·제어문자·양방향 문자를 제거하고, 설정 파일 파싱도 크기 제한(64KB)·심링크 거부·`__proto__` 등 프로토타입 오염 키 차단을 적용하는 등 방어적으로 작성되어 있어요.
- `prompt.submit`·`session.receive`·`session.compact`·`state.set{plugin=spinner,key=dock}`·`tool.call`(일반 및 `mcp__hud__hud_debug` 매칭) 훅에 `.catch` 누락 validate 경고가 있으나, 모두 next(e) 결과를 그대로 반환하거나 집계만 하는 관찰용 훅이라 실제로 도구 호출을 막는 로직은 없어요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/hud)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
