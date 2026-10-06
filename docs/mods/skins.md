# 스킨 (한국 수정판)

> 도구 호출·표·코드·셸 출력을 테마 카드 형식으로 표시해요. 원본에서 한글 표가 잘리던 문제를 고쳤어요

| | |
| --- | --- |
| 설치 이름 | `skins` |
| 종류 | 한국 수정판 |
| 만든 사람 | [hellosverre](https://github.com/hellosverre) |
| 라이선스 | MIT |
| 원본 | [hellosverre/claude-skins @ `2ee5b6a`](https://github.com/hellosverre/claude-skins/tree/2ee5b6a3e7e765a2aa107631a9d07105753e8bd5) |
| 유형 | 🎨 테마 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/skin` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install skins@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install skins@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.SessionStart{source=clear|resume|fork}`, `command.run{command=skin}`, `config.set`, `session.append`, `session.measure`, `session.start`, `tool.call`, `tool.call{tool=/"^mcp__skins__design$"/}`, `turn.complete`, `turn.start`, `ui.render{component=AbovePrompt}`, `ui.render{component=AskUserQuestion}`, `ui.render{component=AssistantMessage}`, `ui.render{component=Pane, requestId=skins-gallery}`, `ui.render{component=Pane, requestId=skins-settings}`, `ui.render{component=Spinner}`, `ui.render{component=ToolGroup}`, `ui.render{component=ToolResult}`, `ui.render{component=ToolUse}`, `ui.render{component=TurnDuration}`, `ui.render{component=UserMessage}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.command.run`, `$.config.list`, `$.session.cwd`, `$.session.usage`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.tool.register`, `$.ui.copy`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/skins/README.md)
- [원본 저장소](https://github.com/hellosverre/claude-skins/tree/2ee5b6a3e7e765a2aa107631a9d07105753e8bd5)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
