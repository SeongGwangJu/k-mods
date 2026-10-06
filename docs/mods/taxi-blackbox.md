# 택시 블랙박스

> 도구 호출을 블랙박스처럼 녹화해서, 오류나 거부 직전 상황을 /blackbox에서 돌려볼 수 있어요. 토큰·비밀번호는 가려서 기록해요.

| | |
| --- | --- |
| 설치 이름 | `taxi-blackbox` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| 라이선스 | MIT |
| 원본 | [devbrother2024/devbrothers-mods/plugins/taxi-blackbox @ `82b075c`](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-blackbox) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/blackbox` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install taxi-blackbox@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install taxi-blackbox@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=blackbox}`, `session.end`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 4개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 모델 호출 없음, 파일 쓰기 없음. 녹화 내용은 전부 모듈 변수(메모리)에만 보관되고 $.state/$.store에도 저장 안 함(세션 종료 시 사라짐).
- 비밀값 보호: 기록 전에 정규식(api key/token/secret/password/Bearer/sk-/gh_·xox-/AKIA 패턴)으로 마스킹 처리. plugin.json 설명과 일치함을 코드로 확인.
- tool.call 훅이 .catch 없이 등록되지만 next(e)를 먼저 호출해 실제 도구 실행을 절대 막지 않고 결과만 기록(에러 시 재throw). 순수 관찰용, 차단 로직 없음.
- 기기 밖 데이터 전송 없음. 무거운 타이머 없음(1초 간격 blink 효과뿐).

</details>

## 더 보기

- [원본 저장소](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-blackbox)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
