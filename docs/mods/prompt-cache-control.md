# 프롬프트 캐시 미터

> 요청마다 캐시를 읽고 새로 쓴 양을 입력창 위에 표시해요. 만료가 임박하면 알리고 /compact·/clear 시점을 제안해요

| | |
| --- | --- |
| 설치 이름 | `prompt-cache-control` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [claude-code-templates](https://www.aitmpl.com) |
| 라이선스 | MIT |
| 원본 | [davila7/claude-code-templates/cli-tool/components/mods/observability/prompt-cache-control @ `375af90`](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/observability/prompt-cache-control) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/cache` |
| 권한 | 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install prompt-cache-control@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install prompt-cache-control@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- TTL(캐시 유지 시간)은 환경변수·설정·계정 종류(구독/API 키)로 자동 추정되고, 요청 간격을 관찰해 스스로 보정해요
- 1초 간격 타이머가 돌지만 표시 내용이 바뀔 때만 다시 그려서 유휴 세션엔 비용이 없어요

## 이 mod가 내 컴퓨터에서 하는 일

- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=cache}`, `session.end`, `session.start`, `turn.step`, `ui.close`, `ui.press`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.clock.every`, `$.command.register`, `$.env.get`, `$.fs.read`, `$.session.cwd`, `$.session.usage`, `$.ui.close`, `$.ui.invalidate`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`, `$.ui.status`, `$.ui.toast`
- 읽는 환경 변수: `CLAUDE_CODE_PROMPT_CACHE_TTL`, `DISABLE_PROMPT_CACHING`, `DISABLE_PROMPT_CACHING_HAIKU`, `DISABLE_PROMPT_CACHING_OPUS`, `DISABLE_PROMPT_CACHING_SONNET`, `ENABLE_PROMPT_CACHING_1H`, `FORCE_PROMPT_CACHING_5M`, `HOME`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 7개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음, 모델 호출($.model.*) 없음
- 파일 읽기만 있음: .claude/settings.local.json, .claude/settings.json, ~/.claude/settings.json 에서 promptCacheTtl 값을 읽음(쓰기는 없음)
- env 읽기: CLAUDE_CODE_PROMPT_CACHE_TTL, DISABLE_PROMPT_CACHING(_HAIKU/_SONNET/_OPUS), ENABLE_PROMPT_CACHING_1H, FORCE_PROMPT_CACHING_5M, HOME
- turn.step에서 매 요청의 캐시 토큰 사용량(cache_read/cache_creation/input)을 읽어 집계, $.clock.every(1000)로 1초마다 카운트다운 갱신(표시가 바뀔 때만 다시 그림)
- ui.close 훅이 validate에서 gatingHooks(hasCatch:false)로 표시되지만 자기 패널을 닫는 관찰용 분기만 있고 deny 로직 없음
- 기기 밖으로 데이터 전송 없음, 무거운 폴링 없음
- 명시된 최소 Claude Code 버전: 2.1.287. 외부 CLI 도구 불필요. 터미널·데스크톱(HTML) 모두 같은 화면으로 렌더링된다고 README에 명시

</details>

## 더 보기

- [원본 저장소](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/observability/prompt-cache-control)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
