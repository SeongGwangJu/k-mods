# 터미널 브라우저

> Claude Code 화면에서 브라우저를 열어 웹사이트를 미리 볼 수 있어요. 에이전트가 직접 열고 닫으며, 별도로 설치한 terminal-browser 앱이 브라우저 엔진을 실행해요.

| | |
| --- | --- |
| 설치 이름 | `terminal-browser` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [zenbu-labs](https://github.com/zenbu-labs) |
| 라이선스 | MIT |
| 원본 | [zenbu-labs/terminal-browser/claude-code-plugin @ `1346bbe`](https://github.com/zenbu-labs/terminal-browser/tree/1346bbe7d7d857e9ab99db11c06fa3d8f717ac49/claude-code-plugin) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 |
| 명령어 | `/browser` |
| 준비물 | terminal-browser CLI/앱 설치 (curl -fsSL https://terminal-browser.sh/install | bash 또는 brew install terminal-browser). Electron 기반 별도 프로그램, 이 플러그인 코드에는 포함되지 않음, Kitty 그래픽 프로토콜을 지원하는 터미널(ghostty, kitty, 또는 libghostty 기반). 미지원 터미널·멀티플렉서(tmux 등)에서는 TUI가 깨질 수 있음 |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 💬 프롬프트 입력 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install terminal-browser@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install terminal-browser@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 실제 브라우저 엔진(Electron+크로미움, 네이티브 입력 리스너)은 별도 설치되는 terminal-browser 앱에 있고, 이 mod는 그 앱을 띄워 로컬 HTTP로 통신하는 얇은 다리 역할만 해요. 그 앱은 `terminal-browser upgrade`로 독립적으로 업데이트되므로 여기 고정한 커밋과 무관하게 바뀔 수 있어요.
- terminal-browser 앱은 기본적으로 의사 익명 사용량·크래시 텔레메트리를 수집해요(`~/.local/state/terminal-browser-*/logs/telemetry.jsonl`에 평문 기록, `DO_NOT_TRACK=1` 등으로 끌 수 있음). 이 mod의 훅 코드 자체는 텔레메트리를 보내지 않아요.
- 에이전트가 브라우저를 직접 열고 닫는 도구(`open`/`close`)는 `agentTool` 설정이 기본 꺼짐이라 기본값에서는 등록되지 않아요. 켜면 에이전트가 임의 URL을 열 수 있어요.
- 명시된 최소 Claude Code 버전은 없어요. README는 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` 설정을 안내하는데, k-mods의 다른 리뷰(ko-ui)에서는 이 플래그가 2.1.285 이하에서만 필요하고 2.1.287부터 함수 훅이 기본 활성화라고 확인했어요. terminal-browser 쪽 안내가 구버전 기준일 가능성이 있고, 직접 실행 검증은 하지 않았어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `http://${text}`, `http://127.0.0.1:${state.port}${path}`, `https://${text}`, `https://terminal-browser.sh`
- ⚙️ **프로그램 실행**.
- 🛡️ **도구 호출 제어**.
- 💬 **프롬프트 입력**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `browser.close`, `browser.open`, `command.run{command=browser}`, `engine.create`, `session.start`, `tool.call{tool=?}`, `ui.close{id=browser}`, `ui.message`, `ui.render{component=Pane, requestId=browser}`, `ui.scroll{requestId=browser}`
- 부르는 API: `$.clock.sleep`, `$.command.register`, `$.fs.exists`, `$.http.fetch`, `$.process.run`, `$.prompt.fill`, `$.session.surfaces`, `$.tool.register`, `$.ui.blit`, `$.ui.close`, `$.ui.invalidate`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 11개 (코드를 읽으며 확인한 것)</summary>

- validate 통과(success: true, 에러 0). 단 gatingHooks 6개(browser.open, browser.close, tool.call×2, ui.scroll, ui.close)가 hasCatch:false. non-strict라 통과했지만 --strict면 떨어질 항목. 모두 이 mod 자신의 전용 이벤트/도구만 게이팅해서 실패해도 '다른 도구가 잘못 승인'되는 fail-open이 아니라 이 mod 기능 자체가 끊기는 안정성 이슈에 가까워요.
- 네트워크 목적지: 훅 코드는 로컬 루프백(http://127.0.0.1:<동적 포트>, claude-bridge launch가 발급한 Bearer 토큰 사용)에만 $.http.fetch로 접속해요. 브라우저가 실제로 방문하는 외부 사이트는 사용자/에이전트가 넣은 URL이라 그때그때 달라지고(동적), 그 네트워크 요청은 별도 설치된 terminal-browser 앱(크로미움) 쪽에서 나가 훅 코드 범위 밖이에요.
- 외부 프로그램 실행: $.process.run으로 `terminal-browser capabilities`, `terminal-browser claude-bridge launch`를 실행해요(개발 체크아웃이면 `node <plugin-root>/../cli/dist/main.js`). terminal-browser 바이너리는 플러그인에 포함되지 않고 사용자가 별도 설치해야 해요.
- 파일 쓰기: 훅 코드(register.tsx·bridge-protocol.ts·surface.tsx·urls.ts) 전체에 파일 쓰기 없음. $.fs.exists로 개발용 체크아웃 경로 존재만 확인해요.
- 모델 호출 $.model.*: 없음. 코드 전체와 validate의 calls 목록 모두에 $.model 사용이 전혀 없어요. 토큰 비용 없음.
- tool.call 훅: 등록하는 두 핸들러는 자기 자신의 커스텀 도구 이름(mcp__terminal-browser__open/close)에만 매칭되는 정규식이라 다른 도구 호출을 막거나 가로채지 않아요. open은 실행 실패 시에만 {deny: 사유}를 반환하고 성공하면 결과 텍스트를 반환해요. agentTool 기본값이 꺼짐이라 기본 설정에서는 이 도구 자체가 등록 안 돼요.
- env/설정/트랜스크립트 읽기: 대화 내용(프롬프트·이전 턴)을 읽지 않아요. 브라우저 안에서 사용자가 보낸 텍스트/스크린샷(ctrl+g 요소 선택)을 로컬 브리지의 /inbox/take로 가져와 $.prompt.fill로 입력창에 채우는 단방향 동작만 있어요.
- 기기 밖 데이터 전송: 훅 코드 자체는 없음(로컬 루프백만). 별도 설치되는 terminal-browser 앱은 기본적으로 사용량·크래시 텔레메트리를 전송하지만(README에 명시, opt-out 가능, 평문 로그라 감사 가능) 이 mod 코드가 보내는 건 아니에요.
- 타이머/폴링: watchBridge가 로컬 브리지 상태를 반복 조회하는데(미수신 시 250ms 간격 재시도), 한 번 시작되면 브라우저 패널을 닫아도 세션이 끝날 때까지 계속 돌아요(워처를 끄는 코드 없음. 브라우저→에이전트 inbox 전달을 계속 받기 위한 의도로 보임). surface.tsx는 패널이 열려 있는 동안만 20ms마다 입력 이벤트를 모아 전송해요(패널 닫히면 중단).
- 실제 브라우저 엔진·텔레메트리·자동 업데이트는 모두 별도 설치 앱(저장소의 cli/·browser/·pixel/, 이번 리뷰 대상 밖)에 있고, 레지스트리가 고정하는 커밋은 claude-code-plugin/(얇은 다리 코드)에만 적용돼요.
- LICENSE 파일(MIT, Zenbu Labs Inc. 2026) 내용과 GitHub API의 license.spdx_id(MIT)가 일치해요.

</details>

## 더 보기

- [원본 저장소](https://github.com/zenbu-labs/terminal-browser/tree/1346bbe7d7d857e9ab99db11c06fa3d8f717ac49/claude-code-plugin)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
