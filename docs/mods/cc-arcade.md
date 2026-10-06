# CC 아케이드

> 입력창 위에서 스네이크·테트리스·2048·지뢰찾기 등 9가지 미니게임을 즐길 수 있어요. Claude가 일하는 동안 자라는 펫도 키울 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `cc-arcade` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Seza Akgün](https://github.com/sezaakgun) |
| 라이선스 | MIT |
| 원본 | [sezaakgun/cc-arcade @ `0baff06`](https://github.com/sezaakgun/cc-arcade/tree/0baff06d31295850283c2eebe052f39bbc35473f) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/arcade` |
| 준비물 | 대화형 터미널(비대화형 `-p` 모드에서는 동작하지 않아요), Claude Code 2.1.287 미만이면 CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 환경 변수 필요 |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install cc-arcade@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install cc-arcade@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 장르를 본뜬 클론이며 Tetris Holding·Taito·Atari·id Software와 무관해요(업스트림 설명 그대로).
- 최고 점수와 펫 상태는 로컬 $.store에만 저장돼요.
- `/arcade colorblind`로 Doom을 빨강·초록 구분 없는 팔레트로 바꿀 수 있어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=arcade}`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.message`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.now`, `$.command.register`, `$.store.get`, `$.store.set`, `$.ui.invalidate`, `$.ui.log`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 4개 (코드를 읽으며 확인한 것)</summary>

- validate 통과(마켓플레이스 루트 기준, 플러그인 자체 에러 없음). tool.call이 .catch 없이 플래그됐지만 next(e)를 먼저 호출한 뒤 펫 상태만 갱신하는 관찰용 훅. 차단 로직 없음.
- 네트워크·모델 호출·외부 프로세스 없음(validate calls: clock/command/store/ui 뿐이며 boards 10개 전부 surface module로 분석됨).
- $.store 읽기·쓰기를 전부 .catch로 감싸 저장소 실패가 게임 자체를 막지 않게 함.
- 게임 보드는 e.surface !== 'terminal'이면 통과하도록 코드로 명시 가드됨. desktop 등에서는 그려지지 않음.

</details>

## 더 보기

- [원본 저장소](https://github.com/sezaakgun/cc-arcade/tree/0baff06d31295850283c2eebe052f39bbc35473f)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
