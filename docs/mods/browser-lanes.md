# 브라우저 레인

> 이 세션이 Playwright 브라우저를 갖고 있는지, 누가 쓰고 있는지 입력창 위에 보여주고, 서브에이전트끼리는 순서를 기다리게 해요.

| | |
| --- | --- |
| 설치 이름 | `browser-lanes` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/browser-lanes @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/browser-lanes) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/browser` |
| 준비물 | Playwright MCP 서버 (claude mcp add playwright --scope user -- npx @playwright/mcp@latest --isolated 권장) |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install browser-lanes@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install browser-lanes@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- --isolated 없이 Playwright MCP를 쓰면 세션마다 Chrome 프로필을 공유해 두 번째 세션이 'Browser is already in use' 오류를 겪는데, 이 mod는 그 상황을 알려주고 /browser clean으로 정리해 주는 역할이에요. 근본 해결은 --isolated 설정이라고 README에도 명시돼 있어요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `kill`, `lsof`, `ps`, `sh`, `sleep`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `command.run{command=browser}`, `session.end`, `session.start`, `tool.call`, `turn.complete`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.command.register`, `$.process.run`, `$.session.cwd`, `$.session.id`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.ask`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음. gatingHooks 2건(agent.spawn, tool.call)이 .catch 없이 등록돼요. tool.call은 mcp__*playwright*__browser_* 패턴에만 반응하고, 5분 넘게 대기열에서 기다린 경우에만 deny해요(그 외엔 항상 next() 통과). 차단보다는 '순서 대기' 로직이에요.
- 네트워크 목적지: 없음. 이 mod 자체는 $.http를 쓰지 않아요(실제 웹 접속은 Playwright MCP 쪽 책임).
- 외부 프로그램 실행: `ps -axo pid=,ppid=,command=`(프로세스 목록으로 Chrome·Claude 소유 관계 파악), `lsof -a -p <pid> -d cwd`(다른 Claude 프로세스의 작업 폴더 조회), `kill <pid>`(사용자가 /browser clean에서 명시적으로 고른 Chrome만 종료, 다른 Claude 세션 자체는 건드리지 않음), `sh -c 'echo $PPID'`. 모두 로컬 프로세스 조회·정리용이에요.
- 파일 쓰기: 없음.
- 모델 호출($.model.*): 없음.
- tool.call 훅 동작: Playwright 브라우저 도구 호출마다 '현재 세션/에이전트가 레인을 쥐고 있는지' 확인해 아니면 최대 5분 대기시키고, 5분을 넘기면 deny(사용자에게 나중에 다시 시도하라고 안내)해요. 스크린샷 파일명에 에이전트 라벨을 자동으로 붙이고, 다른 Claude 세션이 최근 90초 안에 브라우저를 썼으면 토스트로 알려요.
- env/설정 읽기: 없음. 트랜스크립트·대화 내용 읽기 없음.
- 기기 밖 데이터 전송: 없음. $.store(플러그인 공유 저장소)에 세션 id·라벨만 남겨 다른 세션과의 충돌 경고에 쓰고, 기기 밖으로는 안 나가요.
- 타이머: 대기 중일 때만 0.5초 폴링. 평소엔 돌지 않아요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/browser-lanes)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
