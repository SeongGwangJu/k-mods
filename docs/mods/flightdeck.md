# 플라이트덱 대시보드

> 메인 모델의 상태·비용·컨텍스트, 온콜 아키텍트 상담, 권한 검사, 서브에이전트 카드를 한 화면에 표시해요. 세션 이벤트가 발생하면 실시간으로 갱신해요

<img src="https://raw.githubusercontent.com/scasella/claude-flightdeck/f31daca523d36c501cd0df23a737a44c7dc56ad6/docs/media/demo.gif" alt="플라이트덱 대시보드" width="640">

| | |
| --- | --- |
| 설치 이름 | `flightdeck` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Stephen Casella](https://github.com/scasella) |
| 라이선스 | MIT |
| 원본 | [scasella/claude-flightdeck @ `f31daca`](https://github.com/scasella/claude-flightdeck/tree/f31daca523d36c501cd0df23a737a44c7dc56ad6) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/flightdeck` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install flightdeck@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install flightdeck@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 함께 쓸 때

- **agentpane** (`agentpane`): 둘 다 서브에이전트를 패널로 보여줘요. flightdeck은 컨텍스트·비용·권한검사까지 보는 세션 전체 대시보드, agentpane은 서브에이전트 대화 보기·중단에 강해요. 보통 하나만 써도 충분해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.offer`, `agent.spawn`, `classic.UserPromptSubmit`, `command.run{command=flightdeck}`, `session.append`, `session.compact`, `session.end`, `session.measure`, `session.start`, `tool.call`, `tool.check`, `turn.complete`, `turn.start`, `turn.step`, `ui.render{component=Pane, requestId=flightdeck}`
- 부르는 API: `$.clock.now`, `$.command.register`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.ui.close`, `$.ui.open`, `$.ui.resolve`, `$.ui.status`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음 ($.http 미사용, 자체 요청 없음)
- 외부 프로그램 실행 없음
- 파일 쓰기 없음. 세션 상태는 $.state 아톰에만 저장
- 모델 호출($.model.*) 없음
- tool.check/tool.call 등 gatingHooks 7개(classic.UserPromptSubmit, agent.offer, session.compact, tool.check, tool.call, session.append, agent.spawn)는 validate에서 .catch 없음으로 표시되지만, 모두 next()의 결과를 그대로 반환하는 관찰 전용 훅. 직접 deny/allow를 판단하지 않음
- $.session.usage(컨텍스트·비용·레이트리밋)와 세션 이벤트는 읽지만 트랜스크립트 원문·환경변수는 읽지 않음. 권한 로그에 남는 명령/경로 문자열은 redact()로 토큰·비밀번호 패턴을 마스킹한 뒤 저장
- 기기 밖 데이터 전송 없음
- 무거운 타이머 없음. $.clock.every 미사용, 세션 이벤트 훅으로만 갱신. rail/elapsed 클라이언트 모듈의 110ms/1000ms 틱은 자기 화면만 다시 그리는 로컬 애니메이션일 뿐 외부 호출과 무관

</details>

## 더 보기

- [원본 저장소](https://github.com/scasella/claude-flightdeck/tree/f31daca523d36c501cd0df23a737a44c7dc56ad6)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
