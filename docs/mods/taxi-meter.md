# 택시 미터기

> 입력창 위 택시 미터기 패널에 세션 요금과 5시간·주간 한도를 표시해요. /meter·/receipt로 자세히 볼 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `taxi-meter` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| 라이선스 | MIT |
| 원본 | [devbrother2024/devbrothers-mods/plugins/taxi-meter @ `82b075c`](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-meter) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/meter` `/receipt` |
| 권한 | 👀 대화 읽기 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install taxi-meter@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install taxi-meter@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.
- 🔊 **소리**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.PostModelSwitch`, `classic.SessionStart`, `command.run{command=meter}`, `command.run{command=receipt}`, `session.end`, `session.measure`, `session.start`, `turn.complete`, `turn.start`, `turn.step`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.audio.play`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.session.usage`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 4개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 모델 호출 없음, 파일 쓰기 없음. $.session.usage()가 돌려주는 사용량 수치를 $.store에만 저장해 요금을 계산.
- 효과음은 $.audio.play(번들된 로컬 자산)만 사용, 네트워크 아님.
- gating 훅: classic.SessionStart, classic.PostModelSwitch가 .catch 없이 등록되나 둘 다 next(e) 통과 후 패널 갱신만 하는 관찰용.
- 환율(원/달러) 등은 사용자가 설정하는 숫자일 뿐 외부 조회 없음. 기기 밖 데이터 전송 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-meter)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
