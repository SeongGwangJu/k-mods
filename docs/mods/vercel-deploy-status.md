# Vercel 배포 현황

> 연결된 Vercel 프로젝트의 배포 상태를 프롬프트 위 상태줄에 대기·빌드·완료 단계별로 표시해요.

| | |
| --- | --- |
| 설치 이름 | `vercel-deploy-status` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Ray Amjad](https://github.com/ray-amjad) |
| 라이선스 | MIT |
| 원본 | [ray-amjad/awesome-claude-code-function-hooks/plugins/vercel-deploy-status @ `12b5fea`](https://github.com/ray-amjad/awesome-claude-code-function-hooks/tree/12b5fea27a4bd1b88cd9c9b6abc1efc0756c6625/plugins/vercel-deploy-status) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 준비물 | vercel CLI(PATH에 설치 및 로그인 필요, vercel whoami로 확인), 저장소에 .vercel/project.json 연결 파일(vercel link로 생성) |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install vercel-deploy-status@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install vercel-deploy-status@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- CLI나 연결 파일이 없으면 디버그 로그에 한 줄만 남기고 조용히 아무 것도 그리지 않아요.
- README에는 'CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1이 필요하다'고 적혀 있지만(초기 early-access 시절 문구로 보여요), 2.1.291에서는 별도 설정 없이 validate가 바로 통과했어요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `find`
- 🛡️ **도구 호출 제어**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `session.start`, `tool.call{tool=Bash}`, `ui.render{component=AbovePrompt, surface=terminal}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.fs.exists`, `$.fs.readFile`, `$.process.run`, `$.session.repo`, `$.ui.invalidate`, `$.ui.log`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- 모드 자체는 네트워크 호출을 직접 하지 않아요. vercel CLI를 거쳐 사용자 본인 Vercel 계정과 간접 통신해요
- 외부 프로그램 실행: `vercel ls --format json --non-interactive`(기본 15초/60초 주기 폴링), 모노레포에서 연결 파일을 못 찾으면 `find <repo> -maxdepth 4 ...`(10초 타임아웃)로 탐색
- 파일 읽기: .vercel/project.json(프로젝트 이름 확인용). 파일 쓰기 없음, 상태는 메모리에만 보관
- 모델 호출($.model.*) 없음
- tool.call{tool=Bash} 훅은 git push/gh pr merge/vercel deploy 명령을 문자열로 감지해 폴링 주기를 앞당기기만 하고, deny·승인 없이 항상 next(e)로 통과시켜요.catch는 없지만(validate: hasCatch false) 단순 문자열 매칭 후 비동기 트리거라 예외 가능성은 낮아 보여요
- env 읽기 없음(옵션은 pluginConfigs로만 받아요). 트랜스크립트 읽기 없음
- 기기 밖 데이터 전송: vercel CLI를 통한 사용자 본인 계정 통신 외에는 없어요
- 타이머: 유휴 60초/활성 15초 주기 폴링(설정 가능), push 뒤 최대 6분간 활성 주기 유지. 과도하지 않은 수준이에요

</details>

## 더 보기

- [원본 저장소](https://github.com/ray-amjad/awesome-claude-code-function-hooks/tree/12b5fea27a4bd1b88cd9c9b6abc1efc0756c6625/plugins/vercel-deploy-status)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
