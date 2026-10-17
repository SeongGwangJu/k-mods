# modstage

> Codex·Grok·Muse·Antigravity·Kimi·Qwen Code·OpenCode를 Claude Code 서브에이전트로 실행해요. 탭마다 실시간으로 보고, 위험한 작업은 승인하고, 중간에 방향을 바꿔요

<img src="https://raw.githubusercontent.com/qualixar/modstage/e1d8522dbb5feaa3b1bb88d9698ee340b2690b50/assets/demo/modstage-hero.gif" alt="modstage" width="640">

| | |
| --- | --- |
| 설치 이름 | `modstage` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Varun Pratap Bhardwaj](https://github.com/qualixar) |
| 라이선스 | MIT |
| 원본 | [qualixar/modstage @ `e1d8522`](https://github.com/qualixar/modstage/tree/e1d8522dbb5feaa3b1bb88d9698ee340b2690b50) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/modstage` |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 · 📨 세션 메시지 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install modstage@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install modstage@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `http://127.0.0.1:47321`
- ⚙️ **프로그램 실행**.
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.
- 📨 **세션 메시지**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.301
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `command.run{command=modstage}`, `prompt.submit`, `session.start`, `tool.call`, `tool.call{tool=?}`, `tool.call{tool=Bash}`, `tool.call{tool=mcp__modstage__stage_agents}`, `tool.call{tool=mcp__modstage__stage_board}`, `tool.call{tool=mcp__modstage__stage_claim}`, `tool.call{tool=mcp__modstage__stage_close}`, `tool.call{tool=mcp__modstage__stage_decide}`, `tool.call{tool=mcp__modstage__stage_interrupt}`, `tool.call{tool=mcp__modstage__stage_post}`, `tool.call{tool=mcp__modstage__stage_release}`, `tool.call{tool=mcp__modstage__stage_send}`, `tool.call{tool=mcp__modstage__stage_start}`, `tool.call{tool=mcp__modstage__stage_status}`, `tool.call{tool=mcp__modstage__stage_wait}`, `turn.complete`, `ui.message`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=modstage}`
- 부르는 API: `$.agent.spawn`, `$.clock.every`, `$.command.register`, `$.env.get`, `$.fs.read`, `$.http.fetch`, `$.process.run`, `$.session.cwd`, `$.session.id`, `$.session.send`, `$.state.get`, `$.state.set`, `$.tool.register`, `$.ui.open`, `$.ui.resolve`, `$.ui.scroll`, `$.ui.toast`
- 읽는 환경 변수: `HOME`, `MODSTAGE_HOME`, `MODSTAGE_NO_CLIENT`

</details>

## 검토 기록

- 2026-10-17 · varun369 · Claude Code 2.1.301 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- 작성자 본인이 검토함 (자기 mod 등록)
- 네트워크: mod 자체는 127.0.0.1:47321의 로컬 브리지에만 요청 ($.http.fetch, 설치별 토큰 인증). 기기 밖 전송 없음, 텔레메트리 없음. 단 사용자가 시작한 에이전트 CLI(Codex 등)는 각자 자기 서비스와 통신
- 외부 프로그램 실행: $.process.run으로 bridge/bridge.sh(로컬 Python 3.10+ 브리지)를 실행. 브리지는 사용자가 연결하고 로그인한 에이전트 CLI만 실행
- 파일: mod는 ~/.modstage/token만 읽음. 브리지가 ~/.modstage/(토큰, 실행 로그)와 작업 폴더의 .modstage/(보드, STATE.md)에 씀. 실행 로그에는 에이전트가 본 파일 내용과 명령 출력이 남으니 셸 기록처럼 다뤄야 함
- 모델 호출($.model.*) 없음. Claude 서브에이전트는 사용자가 패널에서 시작할 때만 $.agent.spawn
- 도구 호출 거절: Bash에서 codex exec / muse exec / grok -p를 직접 실행하면 거절해 ModStage로 돌림. 다른 에이전트가 점유한 파일을 Claude가 편집하면 거절. stage_decide는 승인 요청 뒤 사용자가 직접 메시지를 보냈을 때만 동작
- 대화 내용: 사용자 프롬프트는 마지막 입력 시각과 앞 500자를 $.state에만 저장하고 브리지로 보내지 않음 (시각만 승인 확인에 사용). 에이전트에는 사용자나 Claude가 준 작업 텍스트만 전달
- 에이전트의 권한 요청은 Needs-you 수신함에 표시. Grok CLI는 자기 설정으로 자동 승인해서 ModStage가 먼저 물을 수 없음(화면에 표시함)
- 타이머: $.clock.every 250ms 로컬 폴링(브리지 상태), 약 1분마다 에이전트 목록 갱신

</details>

## 더 보기

- [원본 저장소](https://github.com/qualixar/modstage/tree/e1d8522dbb5feaa3b1bb88d9698ee340b2690b50)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
