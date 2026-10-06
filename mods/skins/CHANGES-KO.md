# 변경 내역 (vs hellosverre/claude-skins 2ee5b6a)

원본: https://github.com/hellosverre/claude-skins (커밋 `2ee5b6a3e7e765a2aa107631a9d07105753e8bd5`, MIT)

`docs/`, `scripts/`, 원본 `README.md`, `.claude-plugin/marketplace.json`, `tsconfig.json`은 가져오지 않았습니다.
`tsconfig.json`은 `scripts/dev/typecheck.sh`가 그때그때 만들어 주고 `.gitignore`가 지우므로 커밋하지 않습니다
(필요한 내용은 전부 Claude Code가 생성하는 쪽에 있고, 이 mod만의 특별한 컴파일러 옵션은 없습니다).

## 진짜 버그 픽스 (한국어 사용자에게 실질적인 문제)

1. **`hooks/markdown.ts`. 표 열 폭을 터미널 칸 수로 계산.**
   원본의 `widthOf`는 `[...text].length`(문자 수)로 열 폭을 쟀습니다. 한글·한자 등 전각 문자는
   터미널에서 2칸을 쓰는데 1칸으로 계산해, 한글이 섞인 표의 열이 실제보다 좁게 잡혀 글자가
   잘렸습니다. 터미널 칸 수로 세는 `isWide`/`widthOf`로 바꾸고, 자르는 지점(`cutCell`/`padCell`)도
   칸 수 기준으로 맞췄습니다. ASCII 전용 표는 결과가 그대로입니다(원본 테스트 그대로 통과).

2. **`hooks/rows.tsx`(`shellCard` 추가) + `hooks/register.tsx`(`ToolUse` 훅). 터미널 셸 출력 카드.**
   원본은 `Bash` 결과를 데스크톱에서만 `Svg` 카드(`terminalCard`)로 그렸습니다. 터미널은 `Svg`가
   없어 이 경로를 타지 않는데, `ToolUse`가 도구 줄을 자기 것으로 통째로 바꿔 그리면서 Claude
   Code 엔진이 원래 그리던 출력까지 함께 사라졌습니다(실제 세션에서 확인). `ToolUse` 훅이 Bash가
   끝났을 때(`!isRunning`) `e.props.output`으로 직접 `shellCard`를 그 아래에 그리도록 고쳤습니다.

3. **`hooks/rows.tsx`. 터미널 코드 블록도 카드로.**
   원본은 터미널에서 코드 펜스를 테두리 없는 markdown + 그 아래 따로 떨어진 Copy 버튼으로
   그렸습니다. 표·데스크톱 코드 카드와 맞춰 둥근 테두리를 추가했습니다. Copy는 카드 **오른쪽
   아래 안쪽**에 둡니다. 표·데스크톱 카드처럼 위쪽 테두리에 겹쳐 그리면(`position: absolute`)
   터미널에서는 그려지지 않고, 테두리째 긁어 복사하면 `│` 문자가 섞이기 때문입니다.

## 색을 테마 키로 (밝은/어두운 배경 모두 읽히게)

4. **`hooks/rows.tsx`. 표 헤더·내 메시지 강조는 유지하되, 고정 16진수 색을 뺐습니다.**
   - 표 헤더: 헤더 배경 띠(`palette.surface`)와 줄무늬(`palette.zebra`)를 빼고, 헤더 글자만
     `palette.user`(그 스킨의 유일한 강조색. 레일·스피너·턴 종료 줄이 이미 쓰는 색)로
     강조합니다. 회색 배경에서 흰 띠가 튀던 문제가 같이 없어집니다.
   - 내 메시지(prompt row): 굵은 테두리 + 밝은 바탕(`palette.surface`) + 굵은 글씨 + `❯` 표시는
     그대로 두되, 테두리·`❯` 색을 고정 보라색(`#6a52d0`) 대신 `palette.user`로 바꿨습니다.
     `palette.user`는 스킨마다 다르고(노르드는 파랑, 드라큘라는 보라 등) 밝은 배경용 값도 이미
     있어서(`hooks/light.ts`), 어떤 스킨·테마를 골라도 그 스킨의 색으로 보이고 밝은 테마에서도
     읽힙니다. 고정 보라색이면 모든 스킨에서 똑같은 보라색이 떠서 스킨을 바꾸는 의미가 줄었을
     겁니다.

## 가져오지 않은 것 (개인 취향)

5. `DEFAULT_PREFS.band`/`rail`은 원본 값(`true`/`true`)을 그대로 둡니다. 메인테이너의 개인
   세팅판은 `band: false`, `rail: false`였지만, 이건 "버그"가 아니라 메인테이너 개인 화면
   구성(자체 상태줄과 겹침)에 맞춘 취향이라 k-mods 공개판에는 가져오지 않았습니다. 끄고 싶은
   사용자는 설치 후 그대로 `/skin band off`, `/skin rail off`로 끌 수 있습니다.

## k-mods 전용 추가: status-ko와 공존

6. **스피너·턴 종료 줄을 `status-ko`에 양보.** 메인테이너의 개인판은 `Spinner`/`TurnDuration`
   훅을 손대지 않고 항상 엔진에 넘겼습니다(`return next(e)`만). 공개판은 **원본 동작이
   기본값**입니다. skins가 그 스킨의 단어와 반짝임으로 그립니다. 다만 k-mods의 `status-ko` mod가
   켜져 있으면(`$.settings.read()`의 `enabledPlugins`에 `status-ko@`로 시작하는 키가 `true`)
   자동으로 엔진에 넘겨, 두 mod가 같은 줄을 두 번 그리지 않게 합니다.
   `userConfig.status_lines`(`auto`/`skins`/`engine`, 기본 `auto`)로 사람이 직접 고를 수도
   있습니다. `hooks/command.ts`의 `statusLinesMode`, `hooks/register.tsx`의
   `isStatusKoEnabled`를 보세요.

## 테스트

- 원본 `tests/logic.test.ts`, `tests/rows.test.tsx`를 그대로 옮기고 전부 통과시켰습니다
  (promptRow의 `borderStyle`이 `round`→`bold`로 바뀐 것 등 위 변경에 맞춰 한 테스트만 값을
  고쳤습니다).
- 추가한 테스트: 한글 표 열 폭(`widthOf`/`columnWidths`/`cutCell`/`padCell`), `status_lines`
  파싱 함수, 터미널 셸 카드(`ToolUse`), 터미널 코드 카드의 테두리·Copy 위치, 표 헤더 색,
  `status_lines`의 `auto`/`skins`/`engine` 세 동작(스피너·턴 종료 줄).

테스트한 Claude Code 버전: 2.1.291
