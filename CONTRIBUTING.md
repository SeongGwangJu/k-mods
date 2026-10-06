# 기여 가이드

k-mods는 Claude Code mod를 검토해서 한국어로 소개하고, 마켓플레이스 하나로 설치할 수 있게 묶는 저장소예요.
기여 방법은 네 가지예요.

| 하고 싶은 일 | 방법 | 코드 필요 |
| --- | --- | :-: |
| 좋은 mod를 알려 주기 | [mod 추천하기 이슈](https://github.com/SeongGwangJu/k-mods/issues/new?template=suggest-mod.yml) | ❌ |
| 내 mod(또는 남의 mod)를 직접 등록하기 | `registry/<이름>.json` 하나를 추가하는 PR | 조금 |
| k-mods 오리지널 mod 만들기·고치기 | `mods/<이름>/` 에 PR | ✅ |
| 내 mod를 목록에서 내리기 | [삭제 요청 이슈](https://github.com/SeongGwangJu/k-mods/issues/new?template=takedown.yml) | ❌ |

## 저장소 구조

```
registry/<name>.json     카탈로그 항목 1개 = 파일 1개 (단일 원천)
registry/_audit/         자동 정적 분석 결과 (scripts/audit.mjs가 만든다)
mods/<name>/             k-mods가 직접 관리하는 mod (오리지널, 다른 프로젝트를 고친 수정판)
bundles/<name>/          다른 항목을 묶은 설치 세트 (생성물)
docs/guide/              가이드 문서
docs/mods/<name>.md      mod별 페이지 (생성물)
.claude-plugin/marketplace.json   마켓플레이스 (생성물)
scripts/                 build · audit · check
```

`marketplace.json`, `docs/mods/*.md`, `bundles/*/`, README의 표는 `node scripts/build.mjs`가 `registry/`로 만들어요. 손으로 고치지 말고 `registry/`를 고친 뒤 빌드하세요.

## 외부 mod 등록하기 (registry PR)

k-mods는 외부 mod의 코드를 복사하지 않아요. 항목의 `source`가 원본 저장소의 **검토한 커밋**을 가리키고, 사용자는 그 커밋을 원본에서 바로 받아요.

1. 원본 저장소에서 플러그인 폴더(`.claude-plugin/plugin.json`과 `hooks/hooks.json`이 있는 곳)와 현재 커밋 sha(40자)를 확인해요.
2. `registry/<이름>.json`을 만들어요. 필드 설명은 [`registry/_schema.json`](registry/_schema.json)에 있어요. 최소 예시:

   ```json
   {
     "$schema": "./_schema.json",
     "name": "token-weather",
     "displayName": "컨텍스트 일기예보",
     "summary": "입력창 위에 컨텍스트가 얼마나 찼는지 날씨 아이콘과 막대로 보여줘요",
     "summaryEn": "A weather-style forecast of your context window above the prompt",
     "category": "statusline",
     "kind": "upstream",
     "source": {
       "source": "git-subdir",
       "url": "https://github.com/anthropics/claude-code-playground.git",
       "path": "claude-code/mods/token-weather",
       "sha": "<40자 커밋 sha>"
     },
     "upstream": { "repo": "anthropics/claude-code-playground", "path": "claude-code/mods/token-weather", "commit": "<40자 커밋 sha>" },
     "author": { "name": "Anthropic", "url": "https://github.com/anthropics" },
     "license": "Apache-2.0",
     "review": { "date": "2026-10-06", "by": "<GitHub 아이디>", "claudeCode": "2.1.291", "method": ["validate", "code-read"] }
   }
   ```

   플러그인이 저장소 루트에 있으면 `"source": { "source": "github", "repo": "owner/repo", "sha": "..." }`를 써요.
3. 로컬에서 확인해요 (Node 20 이상).

   ```sh
   node scripts/audit.mjs <이름>     # 고정된 커밋을 받아 정적 분석, registry/_audit/<이름>.json 생성
   node scripts/build.mjs             # marketplace.json, 문서, README 표 생성
   ```
4. PR을 보내면 CI가 같은 검사를 다시 돌려요.

### 등록 기준

- **라이선스**: MIT, Apache-2.0, BSD, ISC, MPL-2.0, Unlicense, CC0처럼 사용을 허락하는 라이선스가 있어야 해요. 라이선스 파일이 없는 저장소는 원작자의 허락을 받기 전엔 올리지 않아요.
- **검증 통과**: `claude plugin validate`가 통과해야 해요.
- **코드 읽기**: 검토자는 hooks 모듈 전체를 읽고, 네트워크 목적지·실행하는 프로그램·파일 쓰기·모델 호출·도구 호출 승인/거절·대화 내용 전송을 `review.findings`에 적어요. 설명되지 않은 외부 전송이 있으면 올리지 않아요.
- **쓸모**: 실제로 쓸 만하거나 즐거운 것. 거의 같은 기능이 여럿이면 가장 나은 것을 골라요.
- **한국어 설명**: `displayName`, `summary`는 해요체로, 무엇이 보이고 무엇을 얻는지 구체적으로 써요.
- 자기 mod를 올려도 괜찮아요. 기준은 같아요.

### 업데이트

원본이 바뀌어도 사용자는 고정된 커밋을 받아요. 새 버전을 올리려면 `source.sha`와 `upstream.commit`을 바꾸고, 바뀐 코드를 다시 읽은 뒤 `review`를 갱신하는 PR을 보내요.

## 삭제 요청

원작자가 목록에서 내리기를 원하면 이유를 묻지 않고 내려요. 이슈를 남기거나 PR로 `registry/<이름>.json`을 지워 주세요.

## k-mods mod 만들기·고치기 (mods/)

### 구조

```
mods/<name>/
├── .claude-plugin/plugin.json   name, version, description, author, license, homepage, repository, keywords, userConfig
├── hooks/hooks.json             { "modules": ["./register.ts"] }
├── hooks/register.ts            진입점. export function register(on, options)
├── hooks/*.ts                   $를 받지 않는 순수 함수 (테스트하기 쉽게)
├── tests/*.test.ts              claude plugin test
└── README.md                    한국어 설명
```

- 새 mod는 TypeScript로 써요. 빌드 단계는 없어요 (Claude Code가 `.ts`를 바로 읽어요).
- 이름은 영문 소문자·숫자·`-`. `claude-`, `anthropic-`로 시작하면 검증에서 떨어져요.
- 내용을 바꾸면 `version`을 올려요. 설치본은 버전별로 캐시돼요.
- 다른 프로젝트를 고친 수정판은 원본 LICENSE와 저작권 표기를 그대로 두고, `CHANGES-KO.md`에 바뀐 점을 적고, [NOTICE.md](NOTICE.md)에 출처를 추가해요. 일반적인 버그 수정이라면 원본 저장소에도 보내 주면 좋아요.

### 검증

```sh
scripts/check.sh mods/<name>          # claude plugin validate --strict + claude plugin test
scripts/check.sh                      # 전체 + 마켓플레이스
scripts/dev/typecheck.sh mods/<name>  # (선택) tsc 타입 검사. 로그인된 Claude Code가 필요해요
```

`scripts/cc.sh`가 2.1.287 이상의 Claude Code를 찾아요. 설치본이 낡았으면 고정 버전(`scripts/claude-code-version`)을 `.cache/`에 받아 써요.

그리는 mod는 실제 세션에서도 꼭 확인해 주세요. 엔진이 받아들이지 않는 트리를 돌려주면 엔진은 조용히 자기 그림을 그려요.

```sh
claude --plugin-dir mods/<name>        # 저장할 때마다 다시 불러와요
# 화면을 파일로 남기고 싶다면 (tmux 없이):
uvx --with pyte python scripts/dev/tui.py --cmd "scripts/cc.sh --plugin-dir mods/<name>" --out .scratch/<name> --step wait:7 --step snap:start
```

### 정적 분석 규칙 (어기면 validate가 떨어져요)

- mods API는 항상 `$.네임스페이스.메서드(...)`로 끝까지 적어요. `const ui = $.ui`, 구조 분해 할당, `$[name]`은 안 돼요.
- `$`를 넘기는 도우미 함수는 같은 파일 최상위에 선언해요.
- `on('이벤트')`의 이벤트 이름은 문자열 리터럴로. 같은 이벤트를 matcher 없이 두 번 등록하지 않아요.
- import는 플러그인 안의 상대 경로와 `claude-code`만. Node API, `setTimeout`, 전역 `fetch` 대신 `$.clock`, `$.fs`, `$.process`, `$.http`를 써요.
- 도구 호출을 막을 수 있는 훅(`tool.call`, `tool.check`, `prompt.submit`)에는 `.catch(...)`를 달아요. 막는 mod라면 실패할 때도 막는 쪽으로.

### 화면 원칙

좁은 창, 밝은 테마, 회색 배경 터미널 같은 다양한 환경에서 읽혀야 해요.

1. **기본 색은 다크 모드 기준 파스텔.** 사용자 대부분이 어두운 터미널을 써요. 아래 k-mods 공용 팔레트를 쓰고, `palette` 설정에 `theme`(Claude Code 테마 키, 밝은 터미널용)을 함께 두면 좋아요.

   | 쓰임 | 색 |
   | --- | --- |
   | 본문 / 보조 글자 | `#E8EAED` / `#8A909B` |
   | 강조(보라) / 경고(호박) / 위험(장미) | `#C3B1F5` / `#F0C987` / `#F28B9B` |
   | 칩 글씨(파스텔 배경 위) | `#1E2127` |
   | 빈 구간·홈 | `#3A3E47` |
   | 분류 파스텔 | `#DE8E62` `#8EC5CC` `#E8A6C4` `#86A0DC` `#E3C56A` `#A8C98A` `#9F8FF2` `#B9AEF5` |
2. **색만으로 구분하지 않아요.** 상태는 글자로도 보여주고, 강조할 값은 배경색 칩 안에 글자를 넣어요: `Text({ backgroundColor: 'success', color: 'inverseText', children: ' 통과 ' })`.
3. **폭 3단계.** 넓음(100칸 이상), 보통(70~99), 좁음(70 미만). 60칸에서도 넘치지 않게.
4. **자동 표시가 먼저.** 명령어는 mod당 많아야 하나. 패널만 여닫는 명령은 `immediate: true`.
5. **확인창은 되돌릴 수 없는 작업에만.** 일상 작업(git add·push 등)까지 묻지 않아요.
6. **입력창 위 띠는 함께 쓰는 자리.** 설문이 떠 있으면(`e.props.hasSurvey`) 양보하고, 다른 mod의 그림도 `await next(e)`로 함께 그려요.
7. **데스크톱 앱도 생각해요.** `e.surface`가 `terminal`이 아니면 `Raster`·`Image` 대신 글자로.

### 한국어 문구

- 해요체, 짧게. UI 문구에 줄표(, )를 쓰지 않아요. 기술 용어는 원어 그대로 백틱으로 (`git push`).
- Claude가 읽는 문구(`deny` 사유 등)는 다음 행동을 알려 주는 문장으로 써요.
- 시간은 `1시간 12분`, `14:59`처럼.

### 안전

- 꼭 필요한 권한만 써요. 네트워크는 기능의 핵심일 때만, README에 목적지를 적어요. 텔레메트리 금지.
- 대화 내용을 기기 밖으로 보내는 기능은 기본값 꺼짐.
- 토큰·비밀번호는 `userConfig`의 `"sensitive": true`로 받아요.
- 모델 호출은 사용자 사용량을 써요. 쓴다면 언제 얼마나 부르는지 README에 적어요.

### 테스트

- 순수 로직은 단위 테스트, 이벤트 흐름은 `$.tool.call`·`$.command.run`·`$.turn.complete` 등을 쏴서 확인해요.
- 그리는 자리마다 `$.ui.mount`로 최소 하나, `terminal`과 `desktop` 둘 다.
- 공식 문서 [Test a mod](https://code.claude.com/docs/en/plugins/mods/test)의 stub 규칙을 따라요.

### README 템플릿

```markdown
# <표시 이름>
<한 문장 소개>
<스크린샷>
## 설치
## 쓰는 법
## 설정
## 어떻게 동작하나요
## 권한 (이 mod가 내 컴퓨터에서 하는 일)
## 한계
## 출처·라이선스
테스트한 Claude Code 버전: 2.1.291
```

## PR 체크리스트

- [ ] `node scripts/build.mjs`를 돌렸고 생성물이 함께 들어 있어요
- [ ] `scripts/check.sh`(바꾼 mod) 통과
- [ ] registry 항목이면 `node scripts/audit.mjs <이름>` 결과를 확인했어요
- [ ] 라이선스를 확인했어요

## 행동 강령

서로 존중해 주세요. 원작자의 작업을 존중하고, 출처를 분명히 밝혀요.
