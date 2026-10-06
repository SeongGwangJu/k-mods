# 택시 내비게이션

> 할 일 목록을 내비게이션처럼 보여줘요. 진행 경로와 다음 안내가 표시되고, 계획이 바뀌면 경로를 다시 찾아줘요.

| | |
| --- | --- |
| 설치 이름 | `taxi-navi` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| 라이선스 | MIT |
| 원본 | [devbrother2024/devbrothers-mods/plugins/taxi-navi @ `82b075c`](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-navi) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/navi` |
| 권한 | 🛡️ 도구 호출 제어 · 🔑 환경·설정 읽기 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install taxi-navi@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install taxi-navi@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 🔑 **환경·설정 읽기**.
- 🔊 **소리**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=navi}`, `session.start`, `tool.call{tool=TaskCreate|TaskUpdate|TaskList|TodoWrite}`, `turn.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.audio.play`, `$.audio.speak`, `$.clock.after`, `$.clock.now`, `$.command.register`, `$.env.get`, `$.ui.invalidate`, `$.ui.resolve`
- 읽는 환경 변수: `CLAUDE_CODE_ENABLE_TODO_TOOLS`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 4개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 모델 호출 없음, 파일 쓰기 없음.
- 음성 안내는 $.audio.speak(엔진 자체 TTS API, macOS say 음성 중 하나를 이름으로 지정)만 쓰고 직접 프로세스를 실행하지 않음. 사용자가 끌 수 있음(voice 옵션, 기본 on).
- tool.call{tool=TaskCreate|TaskUpdate|TaskList|TodoWrite} 훅이 .catch 없이 등록되나 next(e) 통과 후 결과만 관찰하는 패스스루. 차단 로직 없음.
- env 읽기: CLAUDE_CODE_ENABLE_TODO_TOOLS 하나뿐. 기기 밖 데이터 전송 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-navi)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
