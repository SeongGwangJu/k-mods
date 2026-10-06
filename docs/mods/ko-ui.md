# 한국어 UI 번역 사전

> 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 사전 기반으로 한국어로 보여줘요.

| | |
| --- | --- |
| 설치 이름 | `ko-ui` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [moduvoice](https://github.com/moduvoice) |
| 라이선스 | MIT |
| 원본 | [moduvoice/claude-code-ko-ui @ `7a19200`](https://github.com/moduvoice/claude-code-ko-ui/tree/7a192004e6e13b40e83221c111102991b8aa9203) |
| 유형 | 🇰🇷 한국어화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/ko-dump` |
| 권한 | 👀 대화 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install ko-ui@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install ko-ui@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 함께 쓸 때

- **작업 상태 한국어** (`status-ko`): 둘 다 Spinner·TurnDuration 화면을 가로채요. TurnDuration은 두 mod 다 next()를 안 불러서 나중에 로드되는 쪽 표시만 보이고 다른 쪽 커스터마이징(상태별 색·도구 수·캐시 비율 또는 한국어 한 줄 요약)은 완전히 묻혀요. Spinner는 둘 다 next()를 불러 체인은 이어지지만 word를 서로 덮어써서, ko-ui가 나중이면 status-ko의 도구별 상세 표시(예: `읽는 중 · page.tsx`) 대신 ko-ui의 일반 라벨(`도구 실행 중`)로 바뀌어요. 로드 순서(설치 순서)에 따라 결과가 달라져 예측이 어려워요.

## 알아 둘 점

- Claude Code 2.1.287 이상이 필요해요. 2.1.285에서는 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` 환경 변수를 켜야 로드돼요.
- 모델 호출·네트워크 요청이 전혀 없는 고정 사전(dict.json) 치환 방식이라 토큰을 쓰지 않아요.
- Spinner 단어 번역은 terminal 화면에서만 적용돼요(desktop은 원문 유지, 나머지 번역은 desktop에서도 적용돼요).
- 번역 안 된 새 문구는 `/ko-dump`로 확인해 `dict.json`에 직접 추가할 수 있어요(최대 200개까지 기록).
- 권한 확인 창, 환영 화면, 선택지 값, 에러 메시지, 프롬프트 아래 알약 문구는 훅이 없거나 번역하면 다른 정보가 사라져서 원문 그대로예요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.describe`, `command.run{command=ko-dump}`, `config.describe`, `session.start`, `ui.render{component=CommandOutput}`, `ui.render{component=InfoNotice}`, `ui.render{component=PromptHint}`, `ui.render{component=SessionMode}`, `ui.render{component=Spinner}`, `ui.render{component=ToolGroup}`, `ui.render{component=ToolProgress}`, `ui.render{component=TurnDuration}`, `ui.render{component=UserMessage, props.origin has {kind=task-notification}}`
- 부르는 API: `$.clock.after`, `$.command.list`, `$.command.register`, `$.config.list`, `$.fs.read`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- validate 통과, gatingHooks 없음 (tool.call/tool.check/prompt.submit 등 차단형 훅 자체가 없음).
- 네트워크 호출·모델 호출·외부 프로세스 실행·파일 쓰기 없음 (코드 전체 확인, validate의 calls 목록과 일치).
- $.fs.read로 자기 플러그인 폴더의 dict.json만 읽음.
- $.store에 번역 안 된 문구 목록만 저장(최대 200개, 로컬 전용, 외부 전송 없음).
- session.start 8초 뒤 1회 $.command.list/$.config.list로 번역 누락 항목을 스캔해 토스트로 알림. 가벼운 1회성 동작, 반복 타이머 아님.
- status-ko와 ui.render Spinner/TurnDuration을 동시에 가로채 표시가 섞이거나 한쪽이 가려짐 (conflicts 참고, 두 mod 코드 직접 대조함).

</details>

## 더 보기

- [원본 저장소](https://github.com/moduvoice/claude-code-ko-ui/tree/7a192004e6e13b40e83221c111102991b8aa9203)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
