# 변경 내역 (vs anthropics/claude-code-playground)

원본: https://github.com/anthropics/claude-code-playground, `claude-code/mods/blast-radius`
(Apache-2.0, 검토 시점 커밋 `569c5283d9a0a7ee7938df85bb32e4f48cbb8c86`).

이 mod는 메인테이너가 이미 한 번 고친 개인판(위험 명령 목록 확장 + 한글화 + 회색 배경용 색)을
k-mods가 다시 다듬은 것입니다. 두 단계를 모두 적습니다.

## 1단계 · 메인테이너의 개인판 (원본 대비, 그대로 유지)

- **파괴적인 명령만 잡음.** 원본은 `alembic upgrade`, `db:migrate`, `prisma migrate`, `manage.py
  migrate`, 그리고 인자에 `migrate`가 있는 아무 명령이나 붙잡아 "대기 중인 마이그레이션"을
  보여줬습니다. 이건 `git add`/`push`만큼이나 일상적인 작업이라, 거의 매번 확인창이 뜨는 피로감이
  있었습니다. 이 수정본은 이 분류를 전부 뺐습니다. `prisma migrate deploy`/`dev` 같은 일상
  마이그레이션은 더 이상 멈추지 않습니다.
- **대신 진짜 파괴적인 몇 가지를 추가**: `prisma db push`(마이그레이션 기록 없이 스키마를 DB에
  직접 반영), `prisma migrate reset`(DB를 지우고 처음부터 재적용), `psql`/`mysql` 명령 안의
  `DROP TABLE|DATABASE|SCHEMA|INDEX|VIEW`/`TRUNCATE`, `docker volume rm`/`prune`,
  `docker system prune`, `docker(-compose) compose down -v`.
- **문구를 한글화**했습니다 (deny 사유, 토스트, 패널의 모든 글자).
- **확인창 레이아웃을 바꿈**: 버튼을 요약 바로 아래로 옮겼습니다 (좁은 화면/band에서 버튼이
  아래로 밀려 안 보이던 문제), 홈 경로를 `~`로 줄이는 `tilde()`를 추가했습니다, band에서는 파일
  목록을 3개로 줄입니다(패널은 10개).
- **실패 시 처리(`.catch`)를 추가**: 원본에는 `tool.call` 훅에 `.catch`가 아예 없었습니다
  (k-mods 기여 가이드 기준 `--strict` 검증에서 떨어지는 지점이기도 합니다). `next`가 이미 불린 뒤의
  실패라면 다시 `next`를 시도하고, 그 전의 실패라면 막는 쪽으로 답합니다.

## 2단계 · k-mods가 다시 고친 점

1. **색을 테마 키로.** 메인테이너의 개인판은 확인창 테두리·제목(`#7c4a03`)과 영향 요약
   (`#9f1239`)을 본인의 회색 배경(`#bdbec6`)에 맞춰 짙게 고정했습니다. k-mods 기여 가이드 기준 "16진수
   색은 쓰지 않는다"에 걸려, k-mods 기본값은 Claude Code 테마 키 `warning`(제목·테두리)/
   `error`(영향 요약)로 바꿨습니다. 밝은/어두운 테마를 따라갑니다. userConfig `palette`를
   `"gray"`로 바꾸면 메인테이너의 원래 고정 색을 그대로 씁니다 (`hooks/register.mjs`의
   `PALETTES`).
2. **테스트하기 쉽게 세 곳을 이름 붙은 함수로 분리** (동작은 그대로, 전부 테스트에서 직접
   부릅니다):
   - `classify(command)`. 이제 `export`. 명령 한 줄을 넣으면 위험 분류(또는 `null`)가
     나오는 순수 함수라, `$`도 세션도 없이 바로 테스트합니다.
   - `denyText(decision, summary)`. "취소/시간초과/중단/오류"별 거절 문구를 만드는 부분을
     `tool.call` 훅에서 떼어냈습니다. 문구 테스트가 통째로 패널을 열고 닫지 않아도 됩니다.
   - `draw(t, state, colors)`. 확인창을 그리는 함수가 `export`됩니다. 버튼의 `onPress`가
     `state.decision`을 정확히 바꾸는지까지, 실제 호출-대기(hold) 없이 바로 확인합니다.
   - `handleToolCallFailure($, e, next)`. `.catch` 핸들러를 이름 붙은 함수로 빼서,
     `next.called`가 `true`/`false`인 가짜 `next`로 두 분기를 직접 테스트합니다.
   이 네 가지는 전부 **리팩터링**이지 동작 변경이 아닙니다. 실제 세션에서는 이전과 똑같이
   동작합니다.
3. **버전을 1.0.0으로.** k-mods 카탈로그에 올라가는 첫 배포본이라 1.0.0부터 시작합니다.
4. **Claude 세션 임시 폴더는 건너뜀 (1.2.0).** Claude Code가 세션마다 쓰는
   `/tmp/claude-<uid>/<프로젝트>/<세션>/`(macOS `/private/tmp/...`) 아래만 지우는 `rm`은
   멈추지 않습니다. Claude가 작업 중에 쓰고 지우는 파일까지 확인창이 떠서 작업이 자주 멈췄습니다.
   경로를 명령줄에서 그대로 읽을 수 있을 때만 건너뜁니다. 상대 경로는 같은 명령줄에서
   `cd /tmp/claude-.../`로 들어간 뒤일 때만 그 폴더 기준으로 봅니다. 변수·`.`·`..`가 있거나, 세션 폴더보다
   위를 지우거나, 대상 중 하나라도 다른 경로면 이전처럼 멈춥니다 (`isClaudeScratch`, 테스트는
   `tests/classify.test.ts`).

## 테스트 (원본·메인테이너판 모두 테스트 없음)

- `tests/classify.test.ts`: `rm` 변형, `git push --force`류, `git reset --hard`,
  `git clean`, `checkout/restore -- .`, `prisma db push`/`migrate reset`, `psql`/`mysql`의
  `DROP`/`TRUNCATE`, `docker` 볼륨·시스템 정리·`compose down -v`. 양성·음성 사례를 모두
  표로 묶었습니다. `git push`(강제 아님), `prisma migrate deploy`, `rm file.txt`(플래그 없음),
  `echo "rm -rf"`(문자열일 뿐) 같은 음성 사례도 포함합니다.
- `tests/hold.test.ts`: 확인창 렌더링과 버튼 연결(`draw`), 거절 문구(`denyText`), 실패 시
  처리(`handleToolCallFailure`), 위험하지 않은 명령은 절대 붙잡지 않는다는 것(`$.tool.call`
  직접 호출).
  - **왜 `$.ui.mount` + 실제 hold로 끝까지 밀어붙이는 테스트가 없는지**: `tool.call` 훅은
    `$.process.run(["sleep", ...])`를 반복 호출하며 대기합니다. 이 상태에서 **동시에**
    `$.ui.mount`로 패널을 열면, 테스트 키트가 그 mount를 해결하는 데 (반복 횟수나 타이밍에
    민감하게) 몇 초가 걸리거나 아예 시간을 초과했습니다. 안정적인 단위 테스트로 쓰기
    어려웠습니다. 그래서 그리기(`draw`)와 판단(`denyText`, `.catch`)을 각각 독립적으로
    테스트하는 쪽을 택했습니다. 실제 "확인창을 띄우고 누르면 명령이 진행/거절된다"는 흐름은
    tui.py로 라이브 검증했습니다 (README 참고).

테스트한 Claude Code 버전: 2.1.291
