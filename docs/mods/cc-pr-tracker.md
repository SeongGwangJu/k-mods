# GitHub PR 트래커

> 머지 상태·리뷰·필수 체크를 입력창 위에서 실시간으로 지켜보고, 바뀌면 토스트·소리로 알려줘요.

| | |
| --- | --- |
| 설치 이름 | `cc-pr-tracker` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Seza Akgün](https://github.com/sezaakgun) |
| 라이선스 | MIT |
| 원본 | [sezaakgun/cc-pr-tracker @ `605b8fc`](https://github.com/sezaakgun/cc-pr-tracker/tree/605b8fc515c3b4842b3b3b15c9757ae5bc351b86) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 준비물 | gh CLI 설치 및 로그인 |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install cc-pr-tracker@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install cc-pr-tracker@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- GitHub 접근은 전부 사용자의 `gh` CLI 인증을 그대로 써요. 별도 토큰을 저장하지 않아요.
- 체크 이름·PR 제목처럼 GitHub에서 온 텍스트는 제어문자를 제거하고, Claude에게 보내는 알림 문구는 '자동 생성된 데이터'라고 명시해서 프롬프트 주입을 막아요.
- cmux라는 특정 환경(CMUX_BUNDLED_CLI_PATH 등)에서만 추가 알림을 보내고, 없으면 조용히 건너뛰어요.
- notifyClaude 설정이 켜져 있으면(기본값) PR 상태가 바뀔 때 Claude가 다음 턴에 읽는 안내 메시지를 대화에 추가해요. 끄려면 /config에서 notifyClaude를 꺼요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `afplay`, `open`, `xdg-open`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `config.describe{key="cc-pr-tracker.muteAll"}`, `config.set`, `prompt.submit`, `session.end`, `session.start`, `tool.call{tool=Bash}`, `tool.call{tool=mcp__cc-pr-tracker__pr_status}`, `turn.complete`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.env.get`, `$.fs.exists`, `$.process.run`, `$.session.append`, `$.session.root`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.tool.register`, `$.ui.close`, `$.ui.copy`, `$.ui.invalidate`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `CMUX_BUNDLED_CLI_PATH`, `CMUX_SURFACE_ID`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- validate 통과. config.set·prompt.submit·tool.call{pr_status}·tool.call{Bash} 4개가 .catch 없이 플래그됐지만, 코드 확인 결과 config.set은 next(e)가 이미 거부(deny)했으면 그대로 반환하고, pr_status는 자신이 등록한 합성 도구에 응답하며, Bash는 실행 후 결과만 관찰함. 실제 차단 로직 없음. prompt.submit은 'PR URL만 있는 프롬프트'를 모델 호출 없이 감시 토글로 흡수하는 의도된 UX.
- 유일한 네트워크 접근은 사용자의 `gh` CLI를 통한 GitHub GraphQL 호출(`gh api graphql`). owner/repo/PR번호만 변수로 보내고 별도 토큰 저장이나 다른 목적지로의 전송이 없음.
- cmux(CMUX_BUNDLED_CLI_PATH/CMUX_SURFACE_ID)·afplay(macOS 소리)·open/xdg-open(브라우저 열기)은 전부 로컬 실행이며, cmux 환경 변수 둘 다 없으면 완전히 no-op.
- $.session.append로 PR 상태 변화를 Claude가 읽는 user-role 메시지를 추가함. GitHub 체크 이름 등 외부 데이터는 JSON 문자열로 인용하고 '자동 생성, 사용자가 쓴 게 아님'이라고 명시해 체크 이름을 통한 프롬프트 주입을 방어함(changeNote 함수, 코드 주석으로 의도 확인).
- 체크·PR 제목의 제어문자를 clean()으로 제거하고 링크는 linkable()로 https(또는 http+localhost)만 허용. 공격받은 PR의 CI 데이터를 신뢰하지 않는 신중한 설계.
- $.state/$.ui.copy/$.session.root/$.session.append가 없는 구버전 Claude Code에서는 조용히 감지해 메모리 전용으로 계속 동작(attempt 래퍼).

</details>

## 더 보기

- [원본 저장소](https://github.com/sezaakgun/cc-pr-tracker/tree/605b8fc515c3b4842b3b3b15c9757ae5bc351b86)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
