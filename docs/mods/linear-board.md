# Linear 보드 패널

> Linear 프로젝트·마일스톤·이슈를 패널에 표시해요. 계획·실행·제품 버튼으로 프롬프트를 바로 입력할 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `linear-board` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [linear-mod contributors](https://github.com/SaharCarmel/linear-mod) |
| 라이선스 | MIT |
| 원본 | [SaharCarmel/linear-mod/linear-mod @ `1e6fef1`](https://github.com/SaharCarmel/linear-mod/tree/1e6fef15490b08080965415e9ab5406b51aa5475/linear-mod) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/linear` |
| 준비물 | Linear API 키 (lin_api_...). /plugin configure 또는 LINEAR_API_KEY 환경 변수 |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 💬 프롬프트 입력 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install linear-board@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install linear-board@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `https://api.linear.app/graphql`
- ⚙️ **프로그램 실행**.
- 💬 **프롬프트 입력**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=linear}`, `session.start`, `turn.complete`, `turn.start`, `ui.close{id=linear}`, `ui.focus{requestId=linear}`, `ui.render{component=Pane}`, `ui.scroll{requestId=linear}`
- 부르는 API: `$.clock.after`, `$.clock.now`, `$.command.register`, `$.env.get`, `$.http.fetch`, `$.process.run`, `$.prompt.fill`, `$.prompt.submit`, `$.session.cwd`, `$.store.delete`, `$.store.get`, `$.store.set`, `$.ui.close`, `$.ui.focus`, `$.ui.invalidate`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `LINEAR_API_KEY`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 목적지: https://api.linear.app/graphql 단 한 곳. 플러그인 본연의 기능(Linear 연동)에 필요한 호출, 사용자가 직접 넣은 API 키로만 인증.
- 외부 프로그램 실행: $.process.run으로 로컬 'git rev-parse --abbrev-ref HEAD' 한 줄만 실행(현재 브랜치명을 읽어 이슈의 branchName과 맞춰보는 용도). 읽기 전용, 자격 증명 없음.
- 파일 쓰기 없음. 모델 호출 없음.
- gating 훅: ui.close/ui.focus/ui.scroll 3개가 .catch 없이 등록되지만 모두 UI 포커스·스크롤 이벤트이고 차단 로직이 없는 패스스루.
- env 읽기: LINEAR_API_KEY 하나뿐(sensitive 처리됨). 트랜스크립트 직접 읽기 없음.
- 기기 밖 데이터 전송: Linear API 호출(이슈 열람·코멘트 작성 등)이 핵심 기능이며 사용자 소유 API 키로만 이뤄짐. 그 외 전송 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/SaharCarmel/linear-mod/tree/1e6fef15490b08080965415e9ab5406b51aa5475/linear-mod)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
