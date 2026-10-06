# 캐시 패널

> 프롬프트 캐시가 만료되기 50분 전에 알려줘요. 주기적 갱신, 한 번 갱신, 대화 압축 중 하나를 예상 비용과 함께 선택할 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `cache-panel` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Dustin Yuchen Teng](https://github.com/danyuchn) |
| 라이선스 | MIT |
| 원본 | [danyuchn/claude-mods/cache-panel @ `9e7d228`](https://github.com/danyuchn/claude-mods/tree/9e7d228f79538f3ed6f583b7612eaed291dabfe3/cache-panel) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/warm` |
| 권한 | ⚙️ 프로그램 실행 · 🤖 모델 호출 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install cache-panel@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install cache-panel@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**.
- 🤖 **모델 호출**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.SessionStart{source=clear|resume|fork}`, `command.run{command=warm|cache-panel}`, `session.compact`, `session.measure`, `session.start`, `turn.step`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=cache-panel}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.command.run`, `$.env.get`, `$.model.fork`, `$.process.run`, `$.session.cwd`, `$.session.model`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.ui.close`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `CACHE_PANEL_FAST`, `HERDR_BIN_PATH`, `HERDR_ENV`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 7개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음($.http.fetch 미사용).
- 모델 호출: $.model.fork로 'Reply with exactly: ok' 짧은 핑을 50분 간격으로 보내 캐시를 데움. 사용자가 '계속 데우기' 또는 '한 번 핑'을 눌렀을 때만 동작, 패널에 비용 추정치를 먼저 보여준 뒤 선택하게 함. README에 호출 빈도·비용 추정 방식이 상세히 공개됨.
- 외부 프로그램 실행: HERDR_ENV=1일 때만(저자의 다른 도구 herdr 환경 안에서 실행 중일 때) 'herdr notification show'로 로컬 알림을 띄움. 해당 env 변수가 없으면 완전히 no-op, README에도 명시됨.
- 파일 쓰기 없음.
- gating 훅: classic.SessionStart, session.compact가 .catch 없이 등록되나 모두 next(e) 통과 후 타이머 정리만 하는 관찰용.
- env 읽기: CACHE_PANEL_FAST(테스트용 가속 모드), HERDR_BIN_PATH, HERDR_ENV. 기기 밖 데이터 전송 없음.
- 같은 저장소의 screen-guard 플러그인은 별도 검토 결과 등록하지 않음(기본값이 대화 내용을 클라우드로 보내는 구조). cache-panel과는 무관한 별개 판단.

</details>

## 더 보기

- [원본 저장소](https://github.com/danyuchn/claude-mods/tree/9e7d228f79538f3ed6f583b7612eaed291dabfe3/cache-panel)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
