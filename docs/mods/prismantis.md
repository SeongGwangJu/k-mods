# prismantis

> 표·코드·다이어그램·도구 호출 결과를 15가지 테마로 표시하고 복사 버튼을 추가해요.

| | |
| --- | --- |
| 설치 이름 | `prismantis` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Nahum Litvin](https://github.com/NahumLitvin) |
| 라이선스 | MIT |
| 원본 | [NahumLitvin/prismantis @ `1e33faa`](https://github.com/NahumLitvin/prismantis/tree/1e33faae6d36fdf4547260ea844c9f241dff87f4) |
| 유형 | 🎨 테마 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/prismantis` |
| 권한 | 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install prismantis@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install prismantis@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=prismantis}`, `prompt.submit`, `session.start`, `ui.render{component=AssistantMessage}`, `ui.render{component=CommandOutput}`, `ui.render{component=ToolGroup}`, `ui.render{component=ToolUse}`, `ui.render{component=TurnDuration}`, `ui.render{component=UserMessage}`
- 부르는 API: `$.command.register`, `$.config.set`, `$.env.get`, `$.session.messages`, `$.ui.copy`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `ALACRITTY_WINDOW_ID`, `KITTY_WINDOW_ID`, `KONSOLE_VERSION`, `TERM`, `TERM_PROGRAM`, `VTE_VERSION`, `WT_SESSION`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 5개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음. 외부 프로그램 실행 없음 ($.process.run 미사용). 파일 쓰기 없음.
- 모델 호출 없음. 단 diagramHints 설정(기본 on) 켜짐 시 prompt.submit 훅이 매 프롬프트에 약 190 토큰짜리 렌더링 안내 문구를 컨텍스트로 첨부. plugin.json 설명에 명시됨.
- prompt.submit 훅은 .catch 없이 등록되어 --strict에서는 탈락하지만, 실제로는 항상 next(e)를 호출해 통과시키기만 함(차단 로직 없음. 사실상 fail-open).
- env 읽기: 터미널 종류 감지용 ALACRITTY_WINDOW_ID·KITTY_WINDOW_ID·KONSOLE_VERSION·TERM·TERM_PROGRAM·VTE_VERSION·WT_SESSION. RTL/테마 자동 감지 목적, 트랜스크립트 읽기 없음.
- 기기 밖 데이터 전송 없음. 무거운 타이머 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/NahumLitvin/prismantis/tree/1e33faae6d36fdf4547260ea844c9f241dff87f4)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
