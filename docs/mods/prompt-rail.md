# 프롬프트 레일

> 세션에서 보낸 프롬프트들을 레일 하나로 모아 보여주고, 마우스를 올리면 읽고 클릭하면 그 지점으로 이동해요.

| | |
| --- | --- |
| 설치 이름 | `prompt-rail` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [oikon48](https://github.com/oikon48) |
| 라이선스 | MIT |
| 원본 | [oikon48/prompt-rail/plugins/prompt-rail @ `2ac50fb`](https://github.com/oikon48/prompt-rail/tree/2ac50fb87fc426fed89ba0f09f1784ef6f289ae8/plugins/prompt-rail) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/prompt-rail` |
| 권한 | ⚙️ 프로그램 실행 · 👀 대화 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install prompt-rail@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install prompt-rail@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**.
- 👀 **대화 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.SessionStart`, `classic.Stop`, `command.run`, `prompt.submit`, `session.receive`, `session.start`, `turn.complete`, `turn.start`, `ui.focus{component=AbovePrompt, plugin=prompt-rail}`, `ui.focus{component=Pane, requestId=prompt-rail, plugin=prompt-rail}`, `ui.press{plugin=prompt-rail}`, `ui.render{component=AbovePrompt}`, `ui.render{component=AssistantMessage}`, `ui.render{component=Pane, requestId=prompt-rail}`, `ui.render{component=ToolGroup}`, `ui.render{component=ToolResult}`, `ui.render{component=ToolUse}`, `ui.render{component=UserMessage}`
- 부르는 API: `$.clock.after`, `$.command.register`, `$.config.set`, `$.fs.read`, `$.fs.stat`, `$.process.spawn`, `$.session.id`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.store.keys`, `$.store.set`, `$.ui.close`, `$.ui.open`, `$.ui.resolve`, `$.ui.scroll`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 5개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 모델 호출 없음.
- 외부 프로그램 실행: $.process.spawn으로 로컬 'tail -c +N <세션 트랜스크립트 경로>'만 실행해 자신의 .jsonl 파일을 스트리밍으로 읽음. 표준 유닉스 유틸리티, 네트워크 없음.
- 파일 쓰기 없음(트랜스크립트는 읽기만).
- gating 훅 다수(classic.SessionStart, classic.Stop, prompt.submit, session.receive, ui.focus x2)가 .catch 없이 등록. 레일 상태 갱신용 관찰 훅이며 코드에 deny 반환 경로가 없음.
- 기기 밖 데이터 전송 없음. 자신의 세션 트랜스크립트 파일을 로컬에서만 읽어 레일을 그림.

</details>

## 더 보기

- [원본 저장소](https://github.com/oikon48/prompt-rail/tree/2ac50fb87fc426fed89ba0f09f1784ef6f289ae8/plugins/prompt-rail)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
