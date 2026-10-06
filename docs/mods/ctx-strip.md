# 컨텍스트 막대

> 컨텍스트가 무엇으로 차 있는지(대화·도구·스킬…) 입력창 위 막대로 보여주고, 서브에이전트가 돌면 한 줄로 알려줘요

| | |
| --- | --- |
| 설치 이름 | `ctx-strip` |
| 종류 | 오리지널 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/ctx` |
| 권한 | ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install ctx-strip@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install ctx-strip@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `mkdir`, `open`, `xdg-open`
- ✏️ **파일 쓰기**.
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.SessionStart`, `classic.SubagentStart`, `classic.SubagentStop`, `command.run{command=ctx}`, `session.measure`, `session.start`, `tool.call{tool=Agent}`, `ui.render{component=AbovePrompt}`, `ui.render{component=PromptHint}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.env.get`, `$.fs.write`, `$.process.run`, `$.session.id`, `$.session.messages`, `$.session.usage`, `$.ui.invalidate`, `$.ui.resolve`
- 읽는 환경 변수: `HOME`, `TMPDIR`, `USER`, `USERNAME`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/ctx-strip/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
