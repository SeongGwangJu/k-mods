# 글랜스

> 다음 회의·리뷰 요청된 PR·진행 중인 Linear 이슈·최근 Slack DM을 입력창 위 한 줄로 보여주고, /glance로 전체 목록을 확인해요.

| | |
| --- | --- |
| 설치 이름 | `glance` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/glance @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/glance) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/glance` |
| 준비물 | gh CLI 로그인, claude.ai Google Calendar 커넥터, claude.ai Linear 커넥터, claude.ai Slack 커넥터 |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install glance@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install glance@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 원저장소 README가 이 mod를 '🔧 My setup (fork and adapt)' 섹션에 두고 '내 도구와 규칙을 중심으로 만들었으니 포크해서 자기 것으로 바꾸라'고 명시해요. gh + Google Calendar + Linear + Slack 네 가지를 모두 쓰는 팀에서만 전체 기능이 살아나고, 하나라도 없으면 그 칸만 조용히 빠져요. 범용성은 낮지만 해당 스택을 쓰는 한국 개발팀에는 실제로 유용하다고 판단해 등록해요.
- Slack에는 '나를 멘션' 전용 검색 필터가 없어서, 로그인한 사용자의 Slack id를 최초 1회 slack_read_user_profile로 조회해 메모리에만 보관하고 이후 검색 키워드로 재사용해요(디스크 저장·외부 전송 없음, README에도 명시된 동작).

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**.
- ⚙️ **프로그램 실행**. 실행하는 프로그램: `gh`

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=glance}`, `session.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.mcp.call`, `$.process.run`, `$.state.get`, `$.state.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음, gatingHooks 없음(도구 호출을 막는 로직이 없어요).
- 네트워크 목적지: 이 mod가 직접 여는 네트워크 연결은 없어요. 대신 $.mcp.call로 claude.ai의 Google Calendar(list_events)·Linear(list_issues)·Slack(slack_search_public_and_private, slack_read_user_profile) 커넥터를 호출해요. 모두 사용자가 사전에 연결 승인한 통로예요.
- 외부 프로그램 실행: `gh api graphql -f query=<고정 쿼리>`로 '리뷰 요청된 PR'과 '내 PR의 CI/리뷰 상태'를 한 번에 조회해요(사용자 입력이 쿼리에 섞이지 않는 고정 GraphQL 문자열).
- 파일 쓰기: 없음.
- 모델 호출($.model.*): 없음.
- prompt.submit/tool.call/tool.check 훅: 등록하지 않음.
- env/설정 읽기: 없음. 트랜스크립트·대화 내용 읽기 없음. 다루는 데이터는 모두 캘린더·PR·이슈·Slack 메시지이지 Claude와의 대화 내용이 아니에요.
- 기기 밖 데이터 전송: 이미 연결된 커넥터·gh 호출 자체가 외부 서비스에 조회 요청을 보내는 것 외에, 조회해 온 개인 일정·PR·이슈·DM 내용을 다시 다른 곳으로 전송하는 코드는 없어요(화면 표시 + 로컬 $.state 저장까지만).
- 타이머/폴링: 세션 시작 시 1회, 이후 5분마다 자동 새로고침($.clock.every). 각 소스가 실패해도 마지막 값을 흐리게 표시하며 서로 독립적으로 재시도해요. 무거운 폴링은 아니에요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/glance)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
