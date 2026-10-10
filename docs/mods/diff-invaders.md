# diff-invaders

> Claude가 방금 쓴 diff 줄에 대응하는 외계인 편대를 표시하는 스페이스 인베이더예요. 토큰 소모 없이 입력창 위에서 플레이해요

| | |
| --- | --- |
| 설치 이름 | `diff-invaders` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [claude-code-templates](https://www.aitmpl.com) |
| 라이선스 | MIT |
| 원본 | [davila7/claude-code-templates/cli-tool/components/mods/games/diff-invaders @ `375af90`](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/games/diff-invaders) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/diff-invaders` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install diff-invaders@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install diff-invaders@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 마우스 없이 방향키(←→/ad)와 스페이스만으로 플레이 가능해요(클릭도 지원)
- 최고 점수만 $.store(plugin 전용 저장소)에 남기고, 그 외 기기 밖 전송은 없어요
- README에 'claude -p, 데스크톱 앱, 모바일에서는 아무것도 그려지지 않는다'고 명시되어 있어요(terminal 전용)

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=diff-invaders}`, `session.start`, `tool.call{tool=Edit|Write}`, `turn.complete`, `ui.message`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.command.register`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.log`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 모델 호출 없음. 저자가 'Zero tokens'라고 명시
- 파일 쓰기 없음. 최고 점수는 $.store.get/set(plugin 전용 키-값 저장소)에만 저장, 일반 파일시스템 경로 아님
- tool.call{tool=Edit|Write} 훅이 next(e) 이후 결과만 관찰해 추가된 줄을 게임판 웨이브로 변환. deny 로직 없음(validate는 구조상 gatingHooks hasCatch:false로 표시하지만 실제 차단 코드 없음)
- env·설정·트랜스크립트 읽기 없음, 타이머·폴링 없음(이벤트 기반)
- 보드 렌더링 모듈(hooks/boards, hooks/games)은 $ 호출이 전혀 없는 순수 렌더링/게임 로직 코드로 확인함
- 명시된 최소 Claude Code 버전: 2.1.287. 외부 CLI 도구 불필요, 마우스 없는 인터랙티브 터미널 필요

</details>

## 더 보기

- [원본 저장소](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/games/diff-invaders)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
