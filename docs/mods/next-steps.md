# 다음 할 일 제안

> 턴이 끝날 때마다 다음에 보낼 법한 프롬프트 2~3개를 입력창 위에 제안해요. 숫자 키를 누르면 선택한 문구가 입력창에 입력돼요.

| | |
| --- | --- |
| 설치 이름 | `next-steps` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/next-steps @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/next-steps) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 🤖 모델 호출 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install next-steps@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install next-steps@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 같은 저장소의 where-am-i와 서로 인지하도록 짜여 있어요. next-steps 목록이 떠 있는 동안 where-am-i는 자기 '다음 할 일' 칸을 비워서 같은 내용이 중복 표시되지 않게 해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🤖 **모델 호출**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `prompt.edit`, `prompt.submit`, `turn.complete`, `turn.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.agent.list`, `$.model.complete`, `$.session.messages`, `$.state.get`, `$.state.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음. gatingHooks 1건(prompt.submit)이 .catch 없이 등록되지만, 핸들러는 목록을 지우는 로컬 상태 갱신만 하고 항상 next()로 그대로 제출을 통과시켜요. deny 로직이 없어요.
- 네트워크 목적지: 없음.
- 외부 프로그램 실행: 없음.
- 파일 쓰기: 없음. 목록은 $.state(next-steps.steps/active)에만 저장돼요.
- 모델 호출($.model.*): 답변이 끝날 때마다(20자 넘는 답변만, 백그라운드 에이전트가 아직 돌고 있으면 건너뜀) Haiku에 최근 메시지 6개(각 800자까지)와 방금 답변(2500자까지)을 보내 다음 프롬프트 후보 2~3개를 요청해요. 사용자 자신의 Claude 사용량을 쓰고, 이 mod의 유일한 모델 호출이에요.
- prompt.submit 훅 동작: 제출을 막지 않고 목록만 비워요. 숫자 키 입력을 가로채는 prompt.edit 훅은 빈 입력창에서 1~3을 누르면 그 제안을 초안으로 채우고(전송은 안 함), 0을 누르면 목록을 지워요. 둘 다 거부가 아니라 입력 보조예요.
- env/설정 읽기: 없음. 트랜스크립트는 $.session.messages()로 최근 대화 일부만 읽어 모델 호출에 포함할 뿐, 기기 밖으로 보내지 않아요.
- 기기 밖 데이터 전송: 없음(모델 호출은 Claude Code 자체 채널).
- 타이머/폴링: 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/next-steps)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
