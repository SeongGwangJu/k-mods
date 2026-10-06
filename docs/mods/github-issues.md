# GitHub 이슈 패널

> 저장소의 GitHub 이슈를 카드로 보여주고 버튼 한 번으로 Claude에게 작업을 맡길 수 있어요.

<img src="https://raw.githubusercontent.com/MarcoCarnevali/claude-code-mods/4d6876e56e5225db26edf8eedcea467831592976/github-issues/docs/issues.png" alt="GitHub 이슈 패널" width="640">

| | |
| --- | --- |
| 설치 이름 | `github-issues` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Marco Carnevali](https://github.com/MarcoCarnevali) |
| 라이선스 | MIT |
| 원본 | [MarcoCarnevali/claude-code-mods/github-issues @ `4d6876e`](https://github.com/MarcoCarnevali/claude-code-mods/tree/4d6876e56e5225db26edf8eedcea467831592976/github-issues) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/issues` |
| 준비물 | GitHub CLI(gh), gh auth login으로 로그인 필요 |
| 권한 | ⚙️ 프로그램 실행 · 💬 프롬프트 입력 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install github-issues@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install github-issues@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- gh가 없으면 설치·로그인 안내 메시지만 보여줘요.
- 명시된 최소 Claude Code 버전은 README에 없었어요(일반적으로 2.1.287+ 전제인 mods 공통 틀을 따라요).

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**.
- 💬 **프롬프트 입력**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=issues}`, `session.start`, `turn.complete`, `ui.close`, `ui.render{component=Pane, requestId=github-issues}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.clock.sleep`, `$.command.register`, `$.process.run`, `$.prompt.submit`, `$.session.repo`, `$.session.surfaces`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.status`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- 모드 자체는 네트워크 호출을 직접 하지 않아요. gh CLI를 거쳐 사용자 본인 계정으로 GitHub GraphQL API를 간접 조회해요
- 외부 프로그램 실행: `gh --version`(gh, /opt/homebrew/bin/gh, /usr/local/bin/gh 순서로 설치 위치 탐색), `gh api graphql`(이슈 목록·상세·레포 목록 조회, 30초 타임아웃), `gh repo view`(저장소 자동 감지 보조)
- 파일 쓰기 없음. $.store에 패널 열림 상태와 저장소별 '이미 본 이슈 번호' 목록만 저장해요(새 배정 알림용, 로컬 플러그인 저장소)
- 모델 호출 없음. 단 $.prompt.submit으로 이슈 내용을 프롬프트로 제출하는 기능이 있는데, 이는 'Work on it' 버튼을 사용자가 직접 눌렀을 때만 일어나고 자동으로는 실행되지 않아요
- ui.close 훅은 관찰만 하고 deny 없이 항상 통과시켜요(.catch 없음, validate: hasCatch false)
- env·트랜스크립트 읽기 없음
- 기기 밖 데이터 전송: gh CLI를 통한 사용자 본인 계정 통신 외에는 없어요
- 타이머: 패널이 열려 있을 때만 2분마다 새로고침, 닫혀 있으면 폴링 없음

</details>

## 더 보기

- [원본 저장소](https://github.com/MarcoCarnevali/claude-code-mods/tree/4d6876e56e5225db26edf8eedcea467831592976/github-issues)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
