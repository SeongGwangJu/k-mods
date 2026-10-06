# 턴 영수증

> 매 턴이 끝나면 바뀐 파일·실행한 명령·읽은 횟수를 입력창 위에 한 줄 영수증으로 보여주고, 제자리걸음을 하면 알려줘요.

<img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/receipt/assets/preview.png" alt="턴 영수증" width="640">

| | |
| --- | --- |
| 설치 이름 | `receipt` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [hoobnn](https://github.com/hoobnn) |
| 라이선스 | MIT |
| 원본 | [hoobnn/hoobnn-agent-mods/claude-code/receipt @ `8fb6f67`](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/receipt) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 |
| 명령어 | `/receipt` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install receipt@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install receipt@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 추천 설정

`/plugin configure receipt@k-mods` 또는 `/config`에서 바꿀 수 있어요.

| 설정 | 값 | 이유 |
| --- | --- | --- |
| `language` | `"ko"` | `auto`는 Claude Code 언어 설정과 시스템 로캘을 차례로 따라가다 둘 다 인식에 실패하면 영어로 빠져요. `ko`로 고정하면 영수증과 경고 토스트가 항상 한국어로 나와요. |

## 알아 둘 점

- 같은 작성자의 `hud`·`ts-band`·`todo-bar`·`hitokoto`와 같은 Box/Text 기반 렌더링을 쓰지만, 이 mod의 테스트 스위트만 유일하게 terminal 서피스만 돌려 확인해 surfaces를 terminal로만 표기했어요(desktop이 안 되는 것을 확인한 건 아니고, 작성자가 desktop으로 검증한 기록이 없다는 뜻이에요).
- 채팅만 하고 도구를 쓰지 않은 턴은 영수증을 남기지 않고, 다음 턴이 시작되면 자동으로 접혀요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=receipt}`, `prompt.edit`, `prompt.submit`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.now`, `$.command.register`, `$.config.set`, `$.env.get`, `$.session.cwd`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `LANG`, `LC_ALL`, `LC_MESSAGES`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- `scripts/cc.sh plugin validate --json` success:true, errors/warnings 없음(직접 실행 확인).
- 네트워크 호출·모델 호출이 전혀 없음을 코드 전체(register.tsx, ledger.ts, config.ts)를 읽고 $.http/$.process/$.model 미사용으로 확인했어요.
- 턴의 `tool.call` 결과만 사후에 읽어 파일 변경 줄 수(git diff 결과가 있으면 그 값, 없으면 patch를 직접 세어 계산), 명령 실행·실패 수, 읽기 횟수, 서브에이전트 수를 집계해요(ledger.ts의 addCall).
- 같은 호출이 연속 실패(기본 3회, repeatFailures)하거나 같은 파일을 되돌리는 편집이 반복되면(기본 2회, flipFlops) 토스트만 띄우고, 실제로 어떤 도구 호출도 막거나 내용을 바꾸지 않아요(watchCall은 감지만 하고 tool.call 훅은 next(e) 결과를 그대로 반환).
- 타이머 폴링이 전혀 없고 turn.start/tool.call/turn.complete 이벤트에만 반응하는 완전 이벤트 기반 구조예요.
- `tool.call`·`prompt.submit` 훅에 `.catch` 누락 validate 경고가 있으나, 두 훅 모두 거부(deny) 로직이 없는 관찰용 훅이라 안전 영향은 낮아요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/receipt)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
