# 메모장

> Claude가 일하는 동안 다음에 시킬 일을 적어 두고 버튼 한 번으로 입력창에 추가해요

| | |
| --- | --- |
| 설치 이름 | `memo-pad` |
| 종류 | 오리지널 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/m` |
| 권한 | 💬 프롬프트 입력 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install memo-pad@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install memo-pad@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 💬 **프롬프트 입력**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=m}`, `session.start`, `ui.close`, `ui.render{component=Pane}`, `ui.render{component=PromptHint}`
- 부르는 API: `$.command.register`, `$.prompt.fill`, `$.session.cwd`, `$.store.get`, `$.store.set`, `$.ui.close`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/memo-pad/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
