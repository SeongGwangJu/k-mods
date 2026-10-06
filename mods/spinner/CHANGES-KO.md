# 원본 대비 변경 내역

원본: [hoobnn/hoobnn-agent-mods](https://github.com/hoobnn/hoobnn-agent-mods) 커밋 `8fb6f67cad9fd023cc7c06b7923518b4bbc45aea`, 경로 `claude-code/spinner` (MIT)

담은 것: `.claude-plugin/`, `hooks/`, `tests/`, `types/`, 저장소 루트의 `LICENSE`. 담지 않은 것: `assets/`(그림 3.7MB, README에서 원본 주소로 참조), `README.md`·`README.en.md`(한국어 README로 대체), `tsconfig.json`.

1. `.claude-plugin/plugin.json`: 기본값 `language` `auto` → `ko`, `companion` `true` → `false`, `footerButton` `true` → `false`. 버전 `0.6.0-ko.1`, 설명·homepage·repository를 k-mods 기준으로.
2. `hooks/themes.ts`: `random`이 고르는 테마를 `RANDOM_POOL`(nyan·clawd·thunder·chomp)로 한정. 원본은 audio를 뺀 14종.
3. `hooks/register.tsx` `turn.start`: `random`이면 턴마다 테마를 새로 고른다. 원본은 세션마다.
4. `hooks/register.tsx` Spinner 사이트: 스피너 줄 앞 마스코트를 그리지 않는다(`SPINNER_MASCOT = false`). 마스코트가 줄 앞에 들여쓰기를 만들어서, 장면은 입력창 위 띠에서만 보여준다.
5. `tests/spinner.test.tsx`: 원본 테스트는 원본 기본값(`UPSTREAM`)을 주입해 그대로 돌리고, 4번에 맞춰 마스코트 테스트의 기대값을 바꿨다. 한국어 기본값과 `RANDOM_POOL` 테스트 2개를 더했다.
