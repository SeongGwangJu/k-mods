# 할 일 진행 상태줄

> Claude가 만든 할 일 목록의 진행 상황과 경과 시간을 입력창 위 막대로 표시해요.

<img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/todo-bar/assets/preview.png" alt="할 일 진행 상태줄" width="640">

| | |
| --- | --- |
| 설치 이름 | `todo-bar` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [hoobnn](https://github.com/hoobnn) |
| 라이선스 | MIT |
| 원본 | [hoobnn/hoobnn-agent-mods/claude-code/todo-bar @ `8fb6f67`](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/todo-bar) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/todos` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install todo-bar@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install todo-bar@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 추천 설정

`/plugin configure todo-bar@k-mods` 또는 `/config`에서 바꿀 수 있어요.

| 설정 | 값 | 이유 |
| --- | --- | --- |
| `language` | `"ko"` | `auto`는 Claude Code 언어 설정과 시스템 로캘을 차례로 따라가다 둘 다 인식에 실패하면 영어로 빠져요. `ko`로 고정하면 진행 바와 `/todos` 응답이 항상 한국어로 나와요. |

## 알아 둘 점

- TodoWrite·TaskCreate·TaskUpdate 결과만 사후에 읽어서 그리고, 별도 도구를 등록하거나 프롬프트에 끼어들지 않아 토큰을 쓰지 않아요.
- 거부되거나 실패한 호출, 서브에이전트 자신의 할 일 목록은 집계하지 않아요.
- 세션별 진행 상황은 최근 20개 세션까지 로컬에 보관되어 세션을 재개해도 이어서 보여요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=todos}`, `prompt.edit`, `prompt.submit`, `session.start`, `tool.call`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.config.set`, `$.env.get`, `$.session.id`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.store.keys`, `$.store.set`, `$.ui.resolve`
- 읽는 환경 변수: `LANG`, `LC_ALL`, `LC_MESSAGES`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- `scripts/cc.sh plugin validate --json` success:true, errors/warnings 없음(직접 실행 확인).
- 네트워크 호출·모델 호출·외부 프로세스 실행이 전혀 없음을 코드 전체(register.tsx, board.ts, config.ts, i18n.ts)를 읽고 $.http/$.process/$.model 미사용으로 확인했어요.
- TodoWrite/TaskCreate/TaskUpdate 도구 호출이 끝난 뒤의 결과만 읽어 $.state·$.store(둘 다 플러그인 전용 로컬 저장소)에 기록해요. 거부된 호출(ran.deny)이나 실패한 호출, 서브에이전트(e.agentId 존재)의 호출은 집계에서 제외함을 코드로 확인했어요.
- 진행 중 작업의 경과 시간 표시를 위한 타이머는 30초 간격(TICK_MS)이고, 활성 작업이 있을 때만 시각을 갱신해 과도한 폴링은 아니에요.
- 세션별 보드는 $.store에 최근 20개 세션(KEEP_SESSIONS)까지만 보관하고 오래된 것은 자동 삭제해요. 외부로 전송되는 코드 경로는 없어요.
- `tool.call`·`prompt.submit` 훅에 `.catch` 누락 validate 경고가 있으나, 두 훅 모두 거부(deny) 로직이 없는 관찰·집계용 훅이라 안전 영향은 낮아요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/todo-bar)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
