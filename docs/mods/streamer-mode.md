# 스트리머 모드

> 화면을 공유·녹화할 때 토큰·이메일·전화번호·주민번호를 화면에서 가려요. Claude가 읽는 내용은 그대로예요

| | |
| --- | --- |
| 설치 이름 | `streamer-mode` |
| 종류 | 오리지널 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 🛡️ 지킴이 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/streamer` |
| 권한 | 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install streamer-mode@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install streamer-mode@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=streamer}`, `session.start`, `ui.render{component=AskUserQuestion}`, `ui.render{component=AssistantMessage}`, `ui.render{component=CommandOutput}`, `ui.render{component=PromptHint}`, `ui.render{component=ToolGroup}`, `ui.render{component=ToolResult}`, `ui.render{component=ToolUse}`, `ui.render{component=UserMessage}`
- 부르는 API: `$.command.register`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/streamer-mode/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
