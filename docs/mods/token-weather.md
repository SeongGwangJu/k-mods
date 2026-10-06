# 토큰 날씨

> 컨텍스트 사용량을 날씨 아이콘과 최근 턴 막대그래프로 입력창 위에 표시해요.

| | |
| --- | --- |
| 설치 이름 | `token-weather` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Claude Code DevRel](https://github.com/anthropics) |
| 라이선스 | Apache-2.0 |
| 원본 | [anthropics/claude-code-playground/claude-code/mods/token-weather @ `569c528`](https://github.com/anthropics/claude-code-playground/tree/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/token-weather) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install token-weather@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install token-weather@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 턴이 끝날 때마다 `$.session.usage()`로 컨텍스트 사용률만 다시 읽어요. 추가 네트워크·모델 호출 없어요.
- 최근 12번 턴의 토큰 수를 막대그래프로 보여줘요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `session.start`, `turn.complete`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.session.usage`, `$.ui.invalidate`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 3개 (코드를 읽으며 확인한 것)</summary>

- validate 통과, gatingHooks 없음.
- 코드 전체(단일 파일, 약 110줄) 확인: $.session.usage, $.ui.invalidate, $.ui.resolve 만 사용. 네트워크·모델 호출·외부 프로세스·파일 쓰기 전혀 없음.
- 명령을 등록하지 않고 자동으로 보여요(k-mods 기여 가이드가 권하는 '자동 표시' 패턴과 일치).

</details>

## 더 보기

- [원본 저장소](https://github.com/anthropics/claude-code-playground/tree/569c5283d9a0a7ee7938df85bb32e4f48cbb8c86/claude-code/mods/token-weather)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
