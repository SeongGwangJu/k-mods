# agent-flow

> 메인 루프와 서브에이전트의 관계를 트리 구조로 표시해요. 각 에이전트에 오간 컨텍스트 양과 답변은 클릭해서 볼 수 있어요

| | |
| --- | --- |
| 설치 이름 | `agent-flow` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [claude-code-templates](https://www.aitmpl.com) |
| 라이선스 | MIT |
| 원본 | [davila7/claude-code-templates/cli-tool/components/mods/ui/agent-flow @ `375af90`](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/ui/agent-flow) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 |
| 명령어 | `/agent-flow` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install agent-flow@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install agent-flow@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 데스크톱 앱에서의 동작은 README·코드에 명시적 확인이 없어 이번 리뷰에서는 terminal만 표시했어요(테스트도 terminal surface 기준)
- 순수 관찰용 mod예요. 모든 훅이 next(e) 결과를 그대로 통과시키고 $.agent.list·$.session.usage만 추가로 읽어요

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `command.run{command=agent-flow}`, `session.measure`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `turn.step`, `ui.close`, `ui.press`, `ui.render{component=Pane}`
- 부르는 API: `$.agent.list`, `$.command.register`, `$.session.usage`, `$.ui.close`, `$.ui.invalidate`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`, `$.ui.status`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 파일 읽기/쓰기 없음, 모델 호출($.model.*) 없음
- session.start, command.run(/agent-flow), turn.start, agent.spawn, turn.step, tool.call, turn.complete, session.measure, ui.close, ui.press, ui.render 훅. 전부 관찰 후 next(e)로 그대로 전달(차단 로직 없음)
- agent.spawn·tool.call·ui.close가 validate에서 gatingHooks(hasCatch:false)로 표시되지만 실제로 deny를 반환하는 코드 경로는 없음(엔진 타입상 구조적 분류일 뿐)
- $.agent.list(), $.session.usage()로 세션 내 에이전트 상태·컨텍스트 사용량만 조회, 기기 밖 전송 없음
- 무거운 타이머·폴링 없음(전부 이벤트 기반 갱신)
- 명시된 최소 Claude Code 버전: 2.1.287(README는 2.1.282에서 2.1.278 타입 선언 기준으로 작성·테스트했다고 부연). 외부 CLI 도구 불필요

</details>

## 더 보기

- [원본 저장소](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/ui/agent-flow)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
