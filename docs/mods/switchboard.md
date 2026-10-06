# 스위치보드

> 서브에이전트가 시작되기 전에 Haiku/Sonnet/Opus 중 비용이 가장 낮은 모델을 골라요. `/route`에서 선택 결과와 예상 비용을 확인할 수 있어요. API 키 없이도 규칙만으로 동작해요.

| | |
| --- | --- |
| 설치 이름 | `switchboard` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/switchboard @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/switchboard) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/route` |
| 권한 | 🌐 네트워크 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install switchboard@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install switchboard@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 이 저장소 22개 mod 중 대화 관련 데이터를 외부 제3자로 보낼 수 있는 유일한 mod예요. 반드시 사용자가 jevApiKey를 설정(/config)하거나 TYPESAFE_API_KEY/AI_GATEWAY_API_KEY 환경변수를 넣어야 작동하고, 기본값(키 없음)에서는 전송이 전혀 없이 로컬 규칙만 써요. jevApiKey는 plugin.json에 sensitive:true로 선언돼 있고, 설명 문구에도 '각 스폰마다 작업 설명과 처음 6,000자를 api.typesafe.ai로 보낸다'고 명시돼 있어요. k-mods의 '대화 내용을 기기 밖으로 보내는 기능은 기본값 꺼짐, 사용자가 켤 때만' 원칙을 만족해요.
- Jev 호출은 $.model.*이 아니라 $.http.fetch로 외부 유료 API를 직접 부르는 방식이라, 사용자의 Claude 사용량이 아니라 TypeSafe/Vercel AI Gateway 계정에 별도로 과금돼요(콜당 약 $0.00003, 2.5초 안에 답이 없으면 규칙으로 대체).

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `https://ai-gateway.vercel.sh/v1/evaluate`, `https://api.typesafe.ai/v1/systemone`
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `command.run{command=route}`, `session.start`, `turn.complete`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=switchboard}`
- 부르는 API: `$.clock.every`, `$.clock.sleep`, `$.command.register`, `$.env.get`, `$.http.fetch`, `$.state.get`, `$.state.set`, `$.ui.close`, `$.ui.open`, `$.ui.resolve`
- 읽는 환경 변수: `AI_GATEWAY_API_KEY`, `TYPESAFE_API_KEY`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음. gatingHooks 1건(agent.spawn)이 .catch 없이 등록되지만, 라우팅이 실패하면 next(e)로 원래 스폰을 그대로 진행시키는 fail-open 설계라 차단으로 이어지진 않아요(이 mod의 목적 자체가 차단이 아니라 모델 선택이에요).
- 네트워크 목적지(키를 설정했을 때만): https://api.typesafe.ai/v1/systemone(직접) 또는 https://ai-gateway.vercel.sh/v1/evaluate(Vercel Gateway 경유, zeroDataRetention 옵션 포함). 서브에이전트의 subagentType·description과 프롬프트 앞 6,000자를 보내 Haiku/Sonnet/Opus 중 하나를 추천받아요. 키가 없으면 이 호출 자체가 없어요.
- 외부 프로그램 실행: 없음.
- 파일 쓰기: 없음.
- 모델 호출($.model.*): 없음. 대신 위 외부 API를 직접 호출해요(사용자 자신의 Claude 사용량이 아니라 별도 계정에 과금).
- agent.spawn 훅 동작: auto 모드(기본값)에서는 추천 결과로 신뢰도가 50% 이상이고 요청된 모델과 다를 때만 모델을 바꿔서 스폰해요. suggest 모드에서는 바꾸지 않고 보여주기만 해요. fork나 teammate 스폰은 건드리지 않아요. 차단(deny)하는 로직은 없어요.
- env 읽기: TYPESAFE_API_KEY, AI_GATEWAY_API_KEY(키가 설정 안 됐을 때 대체 조회). 트랜스크립트 읽기 없음. 서브에이전트에 주는 프롬프트의 앞부분만 다뤄요.
- 기기 밖 데이터 전송: 키를 설정했을 때만, 위 네트워크 목적지로 작업 설명·프롬프트 일부가 나가요. 기본값(키 없음)에서는 전송 없음.
- 타이머/폴링: $.clock.every(5000, ...). 표시할 항목이 있을 때만 밴드를 갱신해요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/switchboard)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
