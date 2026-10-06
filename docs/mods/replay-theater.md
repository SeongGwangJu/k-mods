# Replay 극장

> 이번 턴에서 Claude가 고친 파일들을 한 스텝씩 diff로 넘겨보며 다시 볼 수 있어요.

<img src="https://raw.githubusercontent.com/anthropics/claude-code-playground/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/replay-theater/screenshots/replay-theater-pane.png" alt="Replay 극장" width="640">

| | |
| --- | --- |
| 설치 이름 | `replay-theater` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Claude Code DevRel](https://github.com/anthropics) |
| 라이선스 | Apache-2.0 |
| 원본 | [anthropics/claude-code-playground/claude-code/mods/replay-theater @ `569c528`](https://github.com/anthropics/claude-code-playground/tree/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/replay-theater) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/replay` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install replay-theater@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install replay-theater@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- Write로 기존 파일을 덮어쓸 때는 그 파일의 원래 내용을 읽어와 diff를 만들어요(그 외 다른 파일은 읽지 않아요).
- 리플레이 기록은 메모리에만 있어서 세션을 새로고침하면 사라져요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=replay}`, `session.start`, `tool.call`, `turn.complete`, `turn.start`, `ui.close`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.clock.sleep`, `$.command.register`, `$.fs.exists`, `$.fs.read`, `$.session.cwd`, `$.ui.close`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 3개 (코드를 읽으며 확인한 것)</summary>

- validate 통과. tool.call·ui.close가 .catch 없이 플래그됐지만, 코드 주석 'Never blocks the call'대로 try/catch로 기록 단계만 감싸고 무조건 next(e)를 반환. 실제 편집을 막는 로직 없음.
- 네트워크·모델 호출·외부 프로세스 없음. $.fs.read/$.fs.exists는 Write 대상 파일 자신의 이전 내용을 diff 생성용으로만 읽음.
- 편집 기록은 모듈 변수에만 보관되고 파일·store에 저장하지 않음. 세션 종료 시 사라짐.

</details>

## 더 보기

- [원본 저장소](https://github.com/anthropics/claude-code-playground/tree/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/replay-theater)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
