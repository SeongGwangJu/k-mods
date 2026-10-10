# agent-radar

> 실행 중인 서브에이전트마다 경과 시간·도구 호출 수·현재 작업을 입력창 위 한 줄로 표시해요. /radar로 전체 목록과 대화 내용을 확인할 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `agent-radar` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/agent-radar @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/agent-radar) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/radar` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install agent-radar@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install agent-radar@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 같은 저장소의 mission-control도 서브에이전트를 추적하지만 코드맵까지 포함한 더 무거운 패널이에요. agent-radar는 가볍고 단일 목적(에이전트 상태)이라 함께 설치해도 역할이 겹치지 않는다고 판단했어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `command.run{command=radar}`, `session.start`, `tool.call`, `turn.complete`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=agent-radar}`
- 부르는 API: `$.agent.list`, `$.clock.every`, `$.command.register`, `$.session.messages`, `$.state.get`, `$.state.set`, `$.ui.close`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음. gatingHooks 2건(agent.spawn, tool.call)이 .catch 없이 등록돼요(k-mods 기준 지적 대상). 다만 둘 다 deny 로직이 전혀 없고 통계만 기록하는 관찰용 훅이라 실제로 도구 호출을 막을 위험은 없어요.
- 네트워크 목적지: 없음. 코드 전체에 $.http·fetch 호출이 없어요.
- 외부 프로그램 실행: 없음.
- 파일 쓰기: 없음. 상태는 $.state(agent-radar.agents/selected/now)에만 저장돼요.
- 모델 호출($.model.*): 없음.
- tool.call/agent.spawn 훅 동작: 서브에이전트 생성과 도구 호출을 가로채 라벨(파일명·명령 요약 등)만 기록하고 항상 next()로 그대로 통과시켜요. deny하는 코드 경로가 없어요.
- 트랜스크립트 읽기: /radar 패널에서 에이전트를 선택하면 $.session.messages({agentId})로 그 에이전트의 최근 6개 메시지를 읽어 화면에만 표시해요. 기기 밖으로 보내지 않아요.
- 기기 밖 데이터 전송: 없음.
- 타이머: $.clock.every(1000, ...). 표시할 에이전트가 있을 때만 재계산해 가벼워요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/agent-radar)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
