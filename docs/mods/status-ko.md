# 작업 상태 한국어

> 작업 중에는 '읽는 중 · page.tsx'처럼 지금 하는 일을 보여줘요. 끝나면 모델·시간·도구·캐시를 한 줄로 정리해요

| | |
| --- | --- |
| 설치 이름 | `status-ko` |
| 종류 | 오리지널 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install status-ko@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install status-ko@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `tool.call`, `turn.complete`, `turn.start`, `ui.render{component=Spinner}`, `ui.render{component=TurnDuration}`
- 부르는 API: `$.clock.now`, `$.session.model`, `$.ui.invalidate`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/status-ko/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
