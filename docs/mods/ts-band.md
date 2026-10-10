# ts-band

> 입력창 위에 Tailscale 노드들의 연결 상태를 표시해요. 노드가 끊기거나 다시 연결되면 화면 알림으로 알려줘요.

<img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/ts-band/assets/preview.png" alt="ts-band" width="640">

| | |
| --- | --- |
| 설치 이름 | `ts-band` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [hoobnn](https://github.com/hoobnn) |
| 라이선스 | MIT |
| 원본 | [hoobnn/hoobnn-agent-mods/claude-code/ts-band @ `8fb6f67`](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/ts-band) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/ts` |
| 준비물 | tailscale CLI |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install ts-band@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install ts-band@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 추천 설정

`/plugin configure ts-band@k-mods` 또는 `/config`에서 바꿀 수 있어요.

| 설정 | 값 | 이유 |
| --- | --- | --- |
| `language` | `"ko"` | `auto`는 Claude Code 언어 설정과 시스템 로캘을 차례로 따라가다 둘 다 인식에 실패하면 영어로 빠져요. `ko`로 고정하면 토스트와 `/ts` 응답이 항상 한국어로 나와요. |

## 알아 둘 점

- Tailscale이 설치되어 있어야 동작해요(없으면 '찾을 수 없음' 오류만 조용히 표시).
- 기본 새로고침 주기는 60초(최소 10초)이고, 조회 실패가 이어지면 최대 10분까지 점점 느리게 재시도해요.
- `tailscalePath`를 비워두면 PATH, Homebrew 설치 경로, macOS 앱 내장 CLI 순서로 자동으로 찾아요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**.
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=ts}`, `prompt.edit`, `prompt.submit`, `session.start`, `tool.call{tool=Bash}`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.config.set`, `$.env.get`, `$.process.run`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `LANG`, `LC_ALL`, `LC_MESSAGES`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- `scripts/cc.sh plugin validate --json` success:true, errors/warnings 없음(직접 실행 확인).
- 노드 상태는 로컬 `tailscale` CLI만 실행해서 얻어요. 정확한 실행 인자는 `[tailscale경로, 'status', '--json']`(hooks/register.tsx의 startPolling, 10초 타임아웃)이고, Tailscale의 클라우드 API를 직접 호출하는 코드는 없어요.
- CLI 경로는 `tailscalePath` 옵션이 비어 있으면 PATH → `/usr/local/bin/tailscale` → `/opt/homebrew/bin/tailscale` → macOS 앱 내장 CLI 순서로 자동 탐색해요(hooks/config.ts의 TAILSCALE_CANDIDATES).
- `tailscale status --json`의 결과(노드 이름, 온라인 여부, direct/peer-relay/DERP 연결 방식)는 화면 표시와 토스트에만 쓰이고 외부로 전송되는 코드 경로는 없음을 register.tsx·parse.ts 전체를 읽어 확인했어요.
- 기본 폴링 주기는 60초(최소 10초)이고 실패 시 지수 백오프(최대 10분)가 있어 CLI나 데몬이 없을 때 매 틱마다 재시도하지 않아요.
- Claude가 Bash로 `tailscale up/down/set/switch/login/logout`을 실행하면 정규식으로 감지해 즉시 재조회하지만, 이 훅은 `next(e)`를 먼저 호출하고 결과를 그대로 반환할 뿐 명령을 막거나 바꾸지 않아요.
- 모델 호출($.model.*), 파일 쓰기($.fs.*) 전혀 없음.
- `prompt.submit`·`tool.call{tool=Bash}` 훅에 `.catch` 누락 validate 경고가 있으나, 두 훅 모두 거부(deny) 로직이 없는 관찰용 훅이라 안전 영향은 낮아요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/ts-band)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
