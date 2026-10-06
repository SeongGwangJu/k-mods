# 상태 카드

> 모델, 이펙트, 컨텍스트, 5시간·주간 한도, 비용, 브랜치를 프롬프트 위 카드 하나에 표시해요.

| | |
| --- | --- |
| 설치 이름 | `statuspane` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Anji Xu](https://github.com/xuanji86) |
| 라이선스 | MIT |
| 원본 | [xuanji86/claude-statuspane @ `8eafdaf`](https://github.com/xuanji86/claude-statuspane/tree/8eafdaf51de15a4177145ad58764327bdc7cbfa7) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 |
| 명령어 | `/statuspane` |
| 준비물 | gh CLI (ciBranch 또는 ciPush 설정을 켰을 때만 필요해요, 기본은 둘 다 꺼져 있어요) |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install statuspane@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install statuspane@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 데스크톱 앱에서는 모델·이펙트·컨텍스트를 자체적으로 보여주기 때문에 이 카드는 터미널에서만 그려져요.
- Claude Code 2.1.287 이상 필요, 2.1.288에서 테스트됐다고 README에 적혀 있어요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `gh`, `git`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=statuspane}`, `engine.create`, `session.compact`, `session.measure`, `session.start`, `tool.call{tool=Bash}`, `turn.complete`, `turn.step`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.command.run`, `$.env.get`, `$.fs.exists`, `$.fs.list`, `$.fs.read`, `$.process.run`, `$.session.cwd`, `$.session.model`, `$.session.repo`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `HOME`, `STATUSPANE_PROGRESS_DIR`, `USERPROFILE`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- 모드 자체는 네트워크 호출을 직접 하지 않아요. ciBranch/ciPush 옵션을 사용자가 직접 켜야(기본 둘 다 꺼짐) gh CLI를 거쳐 GitHub API를 간접 조회해요
- 외부 프로그램 실행: `git branch --show-current`(브랜치 표시용, 3초 타임아웃), ciBranch/ciPush를 켰을 때만 `gh run list`, `gh run view`, `gh pr view`
- 파일 쓰기 없음. 진행률 표시줄은 다른 모드·스크립트가 로컬에 적어 둔 JSON 파일을 읽기만 해요(기본 경로 ~/.claude/statuspane/progress, STATUSPANE_PROGRESS_DIR로 변경 가능)
- 모델 호출($.model.*) 없음
- tool.call{tool=Bash} 훅은 git push/gh pr merge 명령을 감지해 CI 폴링을 깨우기만 하고 deny·승인 로직 없이 항상 next(e)로 통과시켜요.catch는 없지만(validate: hasCatch false) 명령 문자열 매칭 후 비동기로 폴링만 트리거하는 단순 구조라 예외 발생 가능성은 낮아 보여요
- env 읽기: HOME, USERPROFILE, STATUSPANE_PROGRESS_DIR
- 기기 밖 데이터 전송: 기본값으로는 없어요. ciBranch/ciPush를 사용자가 켜면 이미 인증된 gh 세션으로 브랜치·PR 상태를 조회해요(새로운 전송은 아니에요)
- 타이머: 30초마다 브랜치 재확인, 1초마다 진행률 파일 재확인, CI를 켰을 때만 5초마다 폴링 대상 확인. 과도하지 않은 수준이에요

</details>

## 더 보기

- [원본 저장소](https://github.com/xuanji86/claude-statuspane/tree/8eafdaf51de15a4177145ad58764327bdc7cbfa7)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
