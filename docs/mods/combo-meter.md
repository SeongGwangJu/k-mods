# combo-meter

> 도구 호출이 성공하면 콤보 수치와 랭크가 올라가고 실패하면 콤보가 끊겨요. 랭크는 D부터 SSS까지예요.

| | |
| --- | --- |
| 설치 이름 | `combo-meter` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Sarthak Bhatore](https://github.com/sarthak2511) |
| 라이선스 | MIT |
| 원본 | [SARTHAK2511/claude-combo @ `7f01ec0`](https://github.com/SARTHAK2511/claude-combo/tree/7f01ec059e073901facde77b8b6e670221cc33c4) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/combo` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install combo-meter@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install combo-meter@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔊 **소리**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=combo}`, `session.end`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.audio.play`, `$.clock.now`, `$.command.register`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.store.set`, `$.ui.resolve`, `$.ui.status`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 4개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 파일 쓰기 없음, 모델 호출 없음.
- tool.call 훅이 .catch 없이 등록되지만 next(e)를 먼저 호출해 실제 도구 실행 결과를 그대로 통과시키고 그 결과만 관찰해 콤보를 올리거나 깨뜨림. 차단 로직이 아예 없는 순수 관전용(fail-open).
- 효과음(sfx/*.wav)은 번들된 로컬 파일을 $.audio.play로 재생. 네트워크 아님.
- env 읽기 없음, 트랜스크립트 읽기 없음. 기기 밖 데이터 전송 없음. 무거운 타이머 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/SARTHAK2511/claude-combo/tree/7f01ec059e073901facde77b8b6e670221cc33c4)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
