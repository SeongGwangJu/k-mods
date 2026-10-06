# Clawd 이야기

> 입력창 위에서 픽셀 Clawd가 Claude의 모든 도구 호출에 맞춰 몸짓을 해요. 서브에이전트마다 작은 동료도 등장해요.

<img src="https://raw.githubusercontent.com/plaxagoras/clawd-tales/89c7f95b4d4faf480a6ee200e92c3e6df34d1432/assets/demo.gif" alt="Clawd 이야기" width="640">

| | |
| --- | --- |
| 설치 이름 | `clawd-tales` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [plaxagoras](https://github.com/plaxagoras) |
| 라이선스 | MIT |
| 원본 | [plaxagoras/clawd-tales @ `89c7f95`](https://github.com/plaxagoras/clawd-tales/tree/89c7f95b4d4faf480a6ee200e92c3e6df34d1432) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/tales` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install clawd-tales@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install clawd-tales@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 히어로의 걷기·환호 스프라이트 원형과 기본 팔레트는 Claude Fables(henrik-thevibe, MIT)에서 가져왔다고 NOTICE 파일에 명시돼 있어요.
- 서브에이전트가 뜨면 작은 동료가 따로 등장하고, 모델 색깔에 따라 외형이 달라져요.
- mobile 화면에서는 그려지지 않도록 코드로 명시돼 있어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `classic.PermissionRequest`, `classic.SessionStart`, `classic.UserPromptSubmit`, `command.run{command=tales}`, `prompt.submit`, `session.compact`, `session.measure`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.agent.list`, `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.session.root`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 3개 (코드를 읽으며 확인한 것)</summary>

- validate 통과. classic.UserPromptSubmit·prompt.submit·classic.PermissionRequest·agent.spawn·tool.call·session.compact·classic.SessionStart 7개가 .catch 없이 플래그됐지만, 코드 전체 확인 결과 전부 next(e) 결과를 그대로 따르거나 next(e) 호출 전후로 애니메이션 상태만 바꾸는 관찰용 훅. 실제 차단 로직 없음.
- 네트워크·모델 호출·외부 프로세스·파일 쓰기 없음(validate calls: clock/command/agent.list/session.root/session.usage/state/store/ui 뿐).
- 오래된 'classic.*' 훅 이름과 새 이벤트 이름을 함께 등록해 구버전 Claude Code와도 호환하려는 구조로 보여요.

</details>

## 더 보기

- [원본 저장소](https://github.com/plaxagoras/clawd-tales/tree/89c7f95b4d4faf480a6ee200e92c3e6df34d1432)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
