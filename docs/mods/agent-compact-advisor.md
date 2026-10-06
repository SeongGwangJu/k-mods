# 컴팩트 타이밍 어드바이저

> 지금이 /compact 하기 좋은 때인지 상태줄에 0~100점으로 표시해요. 압축할 때마다 목표·결정·남은 일을 포함한 보존 템플릿을 자동으로 추가해요.

<img src="https://raw.githubusercontent.com/apolenkov/agent-compact-advisor/86b6831edea7e7f413e146a8c063dce06344a420/demo/demo.gif" alt="컴팩트 타이밍 어드바이저" width="640">

| | |
| --- | --- |
| 설치 이름 | `agent-compact-advisor` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [apolenkov](https://github.com/apolenkov) |
| 라이선스 | MIT |
| 원본 | [apolenkov/agent-compact-advisor @ `86b6831`](https://github.com/apolenkov/agent-compact-advisor/tree/86b6831edea7e7f413e146a8c063dce06344a420) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/compact-advisor` |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install agent-compact-advisor@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install agent-compact-advisor@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 추천 설정

`/plugin configure agent-compact-advisor@k-mods` 또는 `/config`에서 바꿀 수 있어요.

| 설정 | 값 | 이유 |
| --- | --- | --- |
| `language` | `"en"` | 기본값이 러시아어(ru)예요. 한국어 옵션은 아직 없어서, 상태줄·토스트·설명 문구를 영어로라도 보려면 en으로 바꿔야 해요. |
| `leftoverPrefixes` | `"Leftovers for agent:|Leftovers for owner:"` | 기본값이 러시아어 문구("Хвосты для агента:" 등)라 한국어·영어로 답하는 에이전트의 답변에서는 절대 안 걸려요. 못 찾으면 리더오버 신호(점수 비중 30)가 항상 '미확인'이 돼 점수가 60점에 캡돼요. 에이전트가 실제로 쓸 접두어로 바꿔야 이 기능이 작동해요. |

## 알아 둘 점

- P1(목표 달성 확률, 점수 비중 20)은 로컬 127.0.0.1:8010에 떠 있는 'Kev의 System One'이라는 별도 서비스가 있어야 값이 나와요. 없으면 조용히 빠지고 나머지 항목만으로 재계산돼요. 추가 설치 없이도 상태줄 점수·압축 보존 템플릿 같은 핵심 기능은 전부 동작해요.
- 같은 저자의 다른 mod agent-shell-watch가 설치돼 있으면 백그라운드 작업(대기·실행 중)도 점수에 반영돼요. 없으면 그 부분이 '알 수 없음' 취급돼 점수가 60점에 캡돼요(정상 동작, 설치 필수 아님).
- 리더오버 판정은 에이전트의 마지막 답변에서 정해진 접두어로 시작하는 줄만 봐요. 프롬프트에 '해야 할 일이 남아있다'는 식의 자연어 서술은 감지 못 해요(README에 명시된 한계).

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `http://127.0.0.1:8010`
- ⚙️ **프로그램 실행**. 실행하는 프로그램: `git`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=compact-advisor}`, `session.compact`, `session.measure`, `session.start`, `tool.call`, `turn.complete`, `turn.start`
- 부르는 API: `$.agent.list`, `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.clock.sleep`, `$.command.register`, `$.http.fetch`, `$.process.run`, `$.prompt.suggest`, `$.session.root`, `$.state.get`, `$.state.set`, `$.ui.status`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 13개 (코드를 읽으며 확인한 것)</summary>

- validate 통과(success: true, 에러 0). gatingHooks 2개(tool.call, session.compact)가 hasCatch:false. non-strict라 통과. tool.call은 next() 결과를 그대로 반환하면서 수정된 경로만 곁다리로 기록하는 관찰용이고, session.compact도 next()로 넘기기 전 instructions만 보강할 뿐 압축을 막거나 취소하지 않아 실패해도 '잘못된 승인'이 아니라 이 mod의 부가 기록/템플릿 기능이 끊기는 정도예요.
- 모델 호출 $.model.*: 전혀 없음(코드 전체 grep으로 확인). 점수의 80%(채움률 40+리더오버 30+캐시 10 가중치)는 순수 휴리스틱(토큰 비율·텍스트 줄 매칭·경과 시간)이에요. 나머지 20%(P1)도 $.model이 아니라, 사용자가 직접 띄워야 하는 별도 로컬 서비스('Kev의 System One')에 $.http.fetch로 묻는 선택 기능이고 꺼져 있으면 나머지 비중으로 자동 재계산돼요. Claude 사용량 비용 없음.
- 네트워크 목적지: 코드 전체에서 $.http.fetch 호출은 askKev 한 곳뿐이고 대상은 config.kevUrl. config.ts의 정규식(LOOPBACK, 127.0.0.1/localhost/[::1]만 허용)이 로컬호스트가 아니면 kevUrl을 코드로 강제로 undefined 처리해요(문서 설명뿐 아니라 실제 검증 로직 존재, 기본값 http://127.0.0.1:8010). 마지막 답변 끝 8000자를 '작업이 끝났는지'를 묻는 용도로 POST해요.
- 외부 프로그램 실행: $.process.run(["git", ...])만 사용(record.ts). status --porcelain, rev-parse, symbolic-ref, config, diff --name-only, rev-list --count 등 읽기 전용 조회뿐이고 커밋·푸시·수정 명령은 없음. 세션 작업 디렉터리와 수정된 파일이 속한 저장소에서만 실행돼요.
- 파일 쓰기: 코드 전체에 $.fs 호출이 전혀 없어요. 직접 파일을 읽거나 쓰지 않고, 건드린 경로 목록은 도구 호출의 입력/결과(Edit·Write·NotebookEdit·MultiEdit의 file_path, Bash의 bashEditDiff.changedFiles)에서만 뽑아요.
- tool.call/tool.check/prompt.submit 훅: tool.call 핸들러 1개만 있고 차단·거부 없이 항상 next() 결과를 그대로 반환해요(관찰용). prompt.submit·tool.check 훅 자체가 없어요.
- env/설정/트랜스크립트 읽기: 과거 턴 전체는 읽지 않아요. turn.complete가 주는 '이번 턴의 마지막 답변 텍스트'(e.answer)만 그때그때 받아 리더오버 줄 파싱과 P1 질문에 써요. session.measure로 엔진이 계산한 컨텍스트 토큰 수/퍼센트를 받고(직접 계산 안 함), $.state로 자기 자신의 이전 상태와 (설치돼 있다면) 동반 mod agent-shell-watch의 상태를 읽어요.
- 기기 밖 데이터 전송: 기본 설정에서는 없어요(루프백만 호출되고 보통 그 포트엔 아무것도 안 떠 있어 바로 실패함). 사용자가 직접 로컬에 'Kev의 System One' 같은 서비스를 띄운 경우에만 마지막 답변 8000자가 그 로컬 프로세스로 전달돼요. 저자가 README·SECURITY.md에서 '그 포트에 떠 있는 서비스가 리다이렉트 등으로 재전송할 가능성'까지 정직하게 공개함(이 mod 코드 자체의 결함은 아님).
- 타이머/폴링: $.clock.every(30_000, ...)로 30초마다 상태줄을 재계산(순수 로컬 연산 + $.state 읽기, 네트워크 없음). 가벼움. P1 질문은 턴 종료마다 최대 1회, 20초 타임아웃.
- 압축(컴팩션) 개입: guardCompactions 기본 true. /compact 및 자동 압축(메인 대화, 서브에이전트 제외)마다 목표·결정·리더오버·수정 경로를 보존하라는 고정 템플릿을 instructions에 추가해요. 압축 자체를 막거나 취소하지는 않음(README·코드 양쪽에서 확인).
- 한국 사용자 주의: 기본 language가 러시아어(ru)이고 leftoverPrefixes/noneWords 기본값도 러시아어 문자열이라, 바꾸지 않으면 한국어·영어로 답하는 에이전트에서는 리더오버 신호를 절대 못 읽어 점수가 항상 60점 캡에 걸려요(settings에 en 전환과 접두어 교체 권장을 남김).
- LICENSE 파일(MIT) 내용과 GitHub API license.spdx_id(MIT)가 일치. engine-types/claude-code.d.ts 1개 파일만 Anthropic 저작물로 별도 고지(NOTICE.md)돼 있음. mod 자체 코드 라이선스와는 무관.
- README에 명시된 최소 버전: Claude Code 2.1.287+. CI(깃허브 액션)·CodeQL·OpenSSF Scorecard·단위 테스트(모델 폴더별)·릴리스 자동화가 갖춰진 프로젝트예요.

</details>

## 더 보기

- [원본 저장소](https://github.com/apolenkov/agent-compact-advisor/tree/86b6831edea7e7f413e146a8c063dce06344a420)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
