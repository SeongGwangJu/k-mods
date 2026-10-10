# session-wrapped

> `/wrapped`로 이번 세션의 도구 호출·테스트·비용 통계를 애니메이션으로 표시해요. 공유용 PNG 카드는 데스크톱에 저장해요.

<img src="https://raw.githubusercontent.com/OneWave-AI/claude-code-mods/e6da26ca36a88eec3be25605d30fa20f2c1c0cec/screenshots/session-wrapped.png" alt="session-wrapped" width="640">

| | |
| --- | --- |
| 설치 이름 | `session-wrapped` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [OneWave AI](https://www.onewave-ai.com) |
| 라이선스 | MIT |
| 원본 | [OneWave-AI/claude-code-mods/session-wrapped @ `e6da26c`](https://github.com/OneWave-AI/claude-code-mods/tree/e6da26ca36a88eec3be25605d30fa20f2c1c0cec/session-wrapped) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/wrapped` |
| 준비물 | python3 |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install session-wrapped@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install session-wrapped@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- PNG 카드는 `~/Desktop`에 저장돼요.
- 세션 종료 시 토스트 알림만 자동으로 뜨고, 실제 리캡 화면은 `/wrapped`를 직접 실행해야 열려요.
- 통계는 전부 도구 호출 횟수·테스트 결과·토큰 사용량을 코드로 집계한 값이고, 요약 문구 생성에 모델을 쓰지 않아요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `base64`, `python3`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=wrapped}`, `prompt.submit`, `session.end`, `session.start`, `tool.call`, `turn.complete`, `ui.render{component=Pane, requestId=session-wrapped}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.env.get`, `$.process.run`, `$.session.model`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `HOME`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 10개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음. register.tsx·card.ts·png.ts·font.ts·stats.ts·scripts/usage.py·scripts/write_b64.py 전체에 fetch나 http(s) 요청이 없어요.
- 외부 프로그램 실행: `python3 scripts/usage.py`(로컬 트랜스크립트 집계, 최대 120초), `base64 -D -o <path>`(PNG 디코딩 저장), base64 실패 시 대체로 `python3 scripts/write_b64.py <path>`. 전부 로컬 전용.
- 파일 쓰기: 통계 PNG 카드를 `~/Desktop/claude-wrapped-<타임스탬프>[-demo].png`에, 트랜스크립트 집계 캐시를 `~/.cache/session-wrapped/usage-v3.json`에 저장해요. 캐시에는 집계 수치만 남고 프롬프트 원문은 남기지 않아요(명령어 패턴만 추출 후 버림).
- 모델 호출(`$.model.*`) 없음. 모든 카드 수치는 도구 호출·테스트 결과·토큰 사용량을 코드로 집계한 값이고, 요약 생성에 LLM을 쓰지 않아요.
- `prompt.submit`·`tool.call` 훅 둘 다 validate에서 `hasCatch: false`로 표시돼요. 다만 두 훅 모두 deny 로직이 없는 관찰자 패턴(턴 시작 시각 기록, 호출 통계 누적)이라 의도적인 차단은 없어요. 다만 예외 발생 시 의도치 않게 해당 턴/도구 호출이 막힐 가능성은 이론상 있어요(fail-closed 부작용).
- 트랜스크립트 읽기: `~/.claude/projects/**/*.jsonl`을 로컬에서 읽어 주간·월간 토큰·세션·도구·스킬·커넥터 사용량을 집계해요. 집계 결과만 캐시에 남고 기기 밖으로는 전송하지 않아요.
- 기기 밖 데이터 전송: 없음.
- 타이머: 리빌 애니메이션 동안 650ms 간격 `$.clock.every` 하나만 쓰고 리빌이 끝나면 취소돼요. 상시 폴링 아님. 세션 시작 시 한 번, 1분 주기도 아닌 단발 사용량 스캔(scanUsage)만 백그라운드로 돌아요.
- env 읽기는 `HOME`뿐(Desktop·캐시 경로 구성용), env 쓰기는 없어요.
- `claude plugin validate --json` 성공(success:true, strict:false). 수동 코드 읽기로 위 동작을 모두 교차 확인했어요.

</details>

## 더 보기

- [원본 저장소](https://github.com/OneWave-AI/claude-code-mods/tree/e6da26ca36a88eec3be25605d30fa20f2c1c0cec/session-wrapped)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
