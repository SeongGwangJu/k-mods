# 툴 디펜스

> Claude의 실제 도구 호출(Bash·Edit·웹·Agent)에 대응하는 적 유닛을 표시하는 타워 디펜스예요. 토큰 소모 없이 입력창 위에서 플레이해요

| | |
| --- | --- |
| 설치 이름 | `tool-defense` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [claude-code-templates](https://www.aitmpl.com) |
| 라이선스 | MIT |
| 원본 | [davila7/claude-code-templates/cli-tool/components/mods/games/tool-defense @ `375af90`](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/games/tool-defense) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/defense` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install tool-defense@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install tool-defense@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 클릭(마우스)으로 타워를 짓고 업그레이드해요. 일시정지·재시작은 키보드(스페이스/p/r)로도 가능해요
- 최고 점수만 $.store(plugin 전용 저장소)에 남기고, 그 외 기기 밖 전송은 없어요
- README에 'claude -p, 데스크톱 앱, 모바일에서는 아무것도 그려지지 않는다'고 명시되어 있어요(마우스 가능한 terminal 전용)

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=defense}`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.message`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.command.register`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.log`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 모델 호출 없음. 저자가 'Zero tokens'라고 명시
- 파일 쓰기 없음. 최고 점수는 $.store.get/set(plugin 전용 키-값 저장소)에만 저장
- tool.call 훅(모든 도구 대상)이 호출 시작 시점에 관찰만 해서 적 유닛을 큐에 추가. next(e)를 무조건 호출, deny 로직 없음(validate는 구조상 gatingHooks hasCatch:false로 표시)
- env·설정·트랜스크립트 읽기 없음, 타이머·폴링 없음(이벤트 기반)
- 마우스 입력이 필수라 README에 데스크톱 앱·claude -p·모바일에서는 그려지지 않는다고 명시됨
- 명시된 최소 Claude Code 버전: 2.1.287. 외부 CLI 도구 불필요, 마우스를 지원하는 인터랙티브 터미널 필요

</details>

## 더 보기

- [원본 저장소](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/games/tool-defense)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
