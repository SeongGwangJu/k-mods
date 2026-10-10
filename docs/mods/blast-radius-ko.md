# blast-radius-ko

> rm -rf·force push·DB 초기화처럼 되돌릴 수 없는 명령은 실행 전에 멈춰요. 변경 범위를 보여준 뒤 실행할지 물어봐요

| | |
| --- | --- |
| 설치 이름 | `blast-radius-ko` |
| 종류 | 한국 수정판 |
| 만든 사람 | [Anthropic](https://github.com/anthropics) |
| 라이선스 | Apache-2.0 |
| 원본 | [anthropics/claude-code-playground/claude-code/mods/blast-radius @ `569c528`](https://github.com/anthropics/claude-code-playground/tree/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/blast-radius) |
| 유형 | 🛡️ 지킴이 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install blast-radius-ko@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install blast-radius-ko@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `bash`, `git`, `sleep`
- 🛡️ **도구 호출 제어**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `tool.call{tool=Bash}`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.clock.now`, `$.process.run`, `$.session.cwd`, `$.ui.close`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/blast-radius-ko/README.md)
- [원본 저장소](https://github.com/anthropics/claude-code-playground/tree/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/blast-radius)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
