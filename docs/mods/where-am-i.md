# 현재 상황 요약

> 목표·지금 하는 일·사용자의 답변이 필요한 항목·다음 할 일을 입력창 위에 한눈에 보여줘요. `/where`에서 더 긴 요약도 볼 수 있어요.

<img src="https://raw.githubusercontent.com/hamzafer/claude-code-mods/adf9d72d81cb04284416371f9de8a6f937dcc631/images/where-am-i.png" alt="현재 상황 요약" width="640">

| | |
| --- | --- |
| 설치 이름 | `where-am-i` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/where-am-i @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/where-am-i) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/where` |
| 권한 | 🤖 모델 호출 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install where-am-i@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install where-am-i@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 같은 저장소의 next-steps와 서로 인지하도록 짜여 있어요. next-steps의 제안 목록이 떠 있는 동안에는 이 mod가 자기 '다음' 칸을 비워서 중복 표시를 피해요($.state로 next-steps.active를 읽음).

## 이 mod가 내 컴퓨터에서 하는 일

- 🤖 **모델 호출**.
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=where}`, `prompt.submit`, `session.start`, `tool.call`, `turn.complete`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.command.register`, `$.model.complete`, `$.session.messages`, `$.state.get`, `$.state.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음. gatingHooks 2건(prompt.submit, tool.call)이 .catch 없이 등록되지만, 둘 다 '무슨 일이 일어나고 있는지' 기록만 하고 항상 next()로 통과시켜요. deny 로직이 없어요.
- 네트워크 목적지: 없음.
- 외부 프로그램 실행: 없음.
- 파일 쓰기: 없음. $.state(where-am-i.recap/live)에만 저장돼요.
- 모델 호출($.model.*): ① 메인 턴이 끝날 때마다 1회, Haiku에 이전 요약(JSON)·사용자의 최신 메시지(1500자까지)·이번 턴 도구 호출 로그·답변(2500자까지)을 보내 goal/now/waiting/next 네 칸을 갱신, ② /where 실행 시 Haiku에 최근 메시지 12개(각 800자까지)를 보내 긴 요약을 요청해요. 둘 다 사용자 자신의 Claude 사용량을 쓰고, 이 mod의 유일한 모델 호출이에요.
- prompt.submit/tool.call 훅 동작: 제출과 도구 호출을 막지 않고 '지금 하는 일' 한 줄과 도구 호출 로그만 갱신해요(엔진이 직접 일으킨 호출만 집계하고 다른 mod가 백그라운드로 일으킨 호출은 제외).
- env/설정 읽기: 없음. 트랜스크립트는 $.session.messages() 일부를 모델 호출 프롬프트에 포함할 뿐, 기기 밖으로 보내지 않아요.
- 기기 밖 데이터 전송: 없음(모델 호출은 Claude Code 자체 채널).
- 타이머/폴링: 없음. 턴 이벤트에만 반응해요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/where-am-i)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
