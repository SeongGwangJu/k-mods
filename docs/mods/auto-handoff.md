# 오토 핸드오프

> 컨텍스트가 한도에 도달하기 전에 Haiku가 요약한 브리핑을 만들고 새 대화로 전환해요. 필요하면 브리핑 페이지를 따로 열어 확인할 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `auto-handoff` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Alex Hillman](https://github.com/alexknowshtml) |
| 라이선스 | MIT |
| 원본 | [alexknowshtml/claude-auto-handoff @ `8d762ce`](https://github.com/alexknowshtml/claude-auto-handoff/tree/8d762ce726c962268e2dbe24c1c60f0889a2fcde) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🤖 모델 호출 · 🛡️ 도구 호출 제어 · 💬 프롬프트 입력 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install auto-handoff@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install auto-handoff@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `sh`, `tailscale`
- ✏️ **파일 쓰기**.
- 🤖 **모델 호출**.
- 🛡️ **도구 호출 제어**.
- 💬 **프롬프트 입력**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.SessionStart`, `prompt.submit`, `session.compact`, `tool.call`, `turn.complete`, `turn.step`, `ui.render{component=AbovePrompt}`, `ui.render{component=UserMessage, props.origin has {kind=plugin}}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.command.run`, `$.env.get`, `$.fs.list`, `$.fs.read`, `$.fs.write`, `$.model.complete`, `$.process.run`, `$.prompt.submit`, `$.session.cwd`, `$.session.id`, `$.session.messages`, `$.session.surfaces`, `$.session.usage`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `AUTO_HANDOFF_DISABLE`, `AUTO_HANDOFF_TOKENS`, `DISABLE_AUTO_COMPACT`, `HOME`, `USERPROFILE`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 7개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출: $.http.fetch 미사용. 모델 호출은 $.model.complete({model:'haiku', ...})로 컨텍스트 임계값(기본 160k 토큰) 도달 시에만 핸드오프 브리핑을 작성. README에 모델과 트리거 조건이 명시됨.
- 외부 프로그램 실행: $.process.run으로 (1) 로컬 로그 파일에 append하는 'sh -c' 한 줄, (2) viewer 주소가 'tailscale'일 때 'tailscale ip -4'로 자기 머신의 Tailscale IP 조회, (3) 브리핑 뷰어용 정적 HTTP 서버를 'sh -c .. node -e <내장 서버 스크립트> ...'로 detached 실행. 모두 로컬 바이너리, 인자 고정(셸 인젝션 경로 없음).
- 파일 쓰기: 브리핑 마크다운과 뷰어 html 페이지를 ~/.claude-auto-handoff/ 아래에만 저장.
- 주목할 점(기기 밖 전송 관련): 뷰어 서버가 기본값(userConfig.viewer='tailscale:3846')으로 켜져 있음. Tailscale이 있으면 그 사설망(tailnet)의 다른 기기에서, 없으면 127.0.0.1(이 기기에서만) 열람 가능. 공인 인터넷엔 노출 안 되고 README에 동작이 명확히 설명돼 있으나, k-mods 원칙상 '대화 내용을 기기 밖으로 보내는 기능은 기본값 꺼짐'에 해당할 여지가 있어 참고용으로 기록함. AUTO_HANDOFF_DISABLE=1로 끄면 뷰어 서버도 함께 꺼짐.
- 뷰어 서버 자체는 지정된 폴더의 *.html 파일만 GET으로 서빙하는 읽기 전용 정적 서버(server.ts 전체 검토. 경로 검증 정규식 적용, 쓰기 엔드포인트 없음).
- gating 훅: tool.call이 임계값 초과 시 실제로 { deny: .. }를 반환해 도구 호출을 막음(해당 호출은 다음 세션에서 재시도됨). 내부 로직은 try/catch로 감싸 예외 시 조용히 next(e)로 통과(fail-open, 보안 차단이 아니라 컨텍스트 관리 목적이므로 적절).
- env 읽기: AUTO_HANDOFF_DISABLE, AUTO_HANDOFF_TOKENS, DISABLE_AUTO_COMPACT, HOME, USERPROFILE.

</details>

## 더 보기

- [원본 저장소](https://github.com/alexknowshtml/claude-auto-handoff/tree/8d762ce726c962268e2dbe24c1c60f0889a2fcde)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
