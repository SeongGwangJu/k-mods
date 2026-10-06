# PR 펄스

> GitHub PR의 머지 준비 상태·CI 체크·리뷰 코멘트·리뷰 대기열을 입력창 위 띠와 패널로 실시간으로 보여줘요

<img src="https://raw.githubusercontent.com/gerricchaplin/pr-pulse/8bf587aaa9cb3815875dcc3818c8827a37e7cb78/assets/pr-pulse.png" alt="PR 펄스" width="640">

| | |
| --- | --- |
| 설치 이름 | `pr-pulse` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Gerric Chaplin](https://github.com/gerricchaplin) |
| 라이선스 | MIT |
| 원본 | [gerricchaplin/pr-pulse @ `8bf587a`](https://github.com/gerricchaplin/pr-pulse/tree/8bf587aaa9cb3815875dcc3818c8827a37e7cb78) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/pulse` |
| 준비물 | gh CLI 로그인 (gh auth status) |
| 권한 | ⚙️ 프로그램 실행 · 💬 프롬프트 입력 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install pr-pulse@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install pr-pulse@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- GitHub API 호출이 전부 로컬 gh 인증을 그대로 써요. 다른 작업과 시간당 한도를 같이 써요 (15초/60초 주기로 자동 새로고침).

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `gh`, `git`, `uname`
- 💬 **프롬프트 입력**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.CwdChanged`, `command.run{command=pulse}`, `session.start`, `ui.close`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=pr-pulse-history}`, `ui.render{component=Pane, requestId=pr-pulse-reviews}`, `ui.render{component=Pane, requestId=pr-pulse}`
- 부르는 API: `$.clock.every`, `$.command.register`, `$.config.list`, `$.process.run`, `$.prompt.fill`, `$.prompt.read`, `$.state.get`, `$.state.set`, `$.ui.close`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`, `$.ui.status`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 목적지: GitHub API. 전부 로컬 gh CLI 경유로만 호출하고 자체 HTTP 요청은 없음. REST(gh pr list/view/checks, gh api user, gh api repos/.../compare/...)와 GraphQL(gh api graphql, 리뷰 스레드·코멘트 집계용 고정 쿼리) 혼용
- 외부 프로그램 실행: gh(pr list/view/checks, run view --log-failed, api user, api graphql, api repos/.../compare, search prs, repo view 등), git rev-parse --show-toplevel(디렉터리 변경 추적), uname(OS 판별), open 또는 xdg-open(https:// URL만 정규식으로 제한)
- 파일 쓰기 없음. $.state 아톰에만 저장
- 모델 호출($.model.*) 없음. 'Fix with Claude'/'Address with Claude' 버튼은 $.prompt.fill(mode: append)로 프롬프트창에 초안만 채우고 $.prompt.submit은 호출하지 않음. 사용자가 직접 Enter를 눌러야 전송됨
- tool.call/tool.check/prompt.submit 훅을 아예 등록하지 않음(도구 호출을 막거나 허용하는 로직이 없음). classic.CwdChanged/ui.close 훅(gatingHooks로 .catch 없음 표시됨)도 next() 결과를 그대로 반환하는 관찰 전용
- $.config.list()로 theme 설정만 읽어 다크/라이트를 판별. 트랜스크립트·환경변수는 읽지 않음
- 기기 밖 데이터 전송: GitHub로 나가는 gh CLI 호출뿐. 사용자 자신의 로컬 gh 인증(gh auth status)을 그대로 쓰고 mod 자체 토큰을 요구하지 않음(README·SECURITY.md에 명시, 코드에서도 별도 토큰 사용 없음을 확인)
- 폴링 주기: PR 상태/체크/코멘트 수는 15초마다, 히스토리·리뷰 대기열·필수 체크·브랜치 비교는 60초마다. /pulse로 watching을 시작해야 켜짐(세션 시작만으로 자동 활성화되지 않고, 이전에 watching 중이었을 때만 재개). README에 '본인 gh 토큰의 시간당 한도를 다른 작업과 공유한다'고 자체 명시

</details>

## 더 보기

- [원본 저장소](https://github.com/gerricchaplin/pr-pulse/tree/8bf587aaa9cb3815875dcc3818c8827a37e7cb78)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
