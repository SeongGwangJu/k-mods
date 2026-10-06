# 컨텍스트 핸드오프

> 컨텍스트가 한계에 가까워지면 새 대화용 핸드오프를 만들고 자동으로 전환해요. 사용자가 55분 동안 입력하지 않으면 프롬프트 캐시를 최대 3번 갱신해요.

| | |
| --- | --- |
| 설치 이름 | `ctx-handoff` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [cablate](https://github.com/cablate) |
| 라이선스 | MIT |
| 원본 | [cablate/ctx-handoff-mod @ `bd3bfd2`](https://github.com/cablate/ctx-handoff-mod/tree/bd3bfd2c5b86d2587ad2155be5bf5a69c4de7711) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/handoff` |
| 권한 | ✏️ 파일 쓰기 · 🤖 모델 호출 · 💬 프롬프트 입력 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install ctx-handoff@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install ctx-handoff@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ✏️ **파일 쓰기**.
- 🤖 **모델 호출**.
- 💬 **프롬프트 입력**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.Stop`, `command.run{command=handoff|ctx-handoff}`, `prompt.context`, `prompt.submit`, `session.start`, `turn.complete`
- 부르는 API: `$.agent.list`, `$.clock.after`, `$.clock.now`, `$.command.register`, `$.command.run`, `$.env.get`, `$.fs.read`, `$.fs.write`, `$.model.complete`, `$.model.fork`, `$.prompt.submit`, `$.session.id`, `$.session.messages`, `$.session.root`, `$.session.turns`, `$.session.usage`, `$.store.delete`, `$.store.get`, `$.store.keys`, `$.store.set`, `$.ui.log`, `$.ui.status`, `$.ui.toast`
- 읽는 환경 변수: `CLAUDE_CONFIG_DIR`, `HOME`, `USERPROFILE`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음($.http.fetch 미사용). 모델 호출은 Claude Code 자체 $.model.fork/$.model.complete로만 이뤄짐. 사용자 자신의 사용량 소비: (1) 컨텍스트 임계값 도달 시 핸드오프 요약 생성, (2) 유휴 55분마다 최대 3회 캐시 리프레시, (3) 사용자 메시지 30개마다 또는 핸드오프 직전 '배경 정리'로 대화 내용을 모델에 보내 프로젝트 메모(규칙/기억)로 압축.
- 파일 쓰기: 위 '배경 정리' 결과를 <claude 설정 폴더>/projects/<워크스페이스>/memory/ctx-handoff.md에 로컬로만 저장. 기기 밖 전송 없음.
- 비밀값 보호: 정리 결과에 금칙어 정규식(sk-, gh_, xox-, AKIA, BEGIN, password 등)이 걸리면 해당 줄 전체를 버리고 로그 샘플에도 내용을 남기지 않음.
- gating 훅: classic.Stop은 .catch 없이 등록되지만 함수 본문이 자체적으로 try/catch로 감싸 예외를 삼키고 로그만 남김(사실상 안전). prompt.submit도 .catch 없이 등록되나, 핸드오프 진행 중에만 메시지를 잠시 보류했다가 재전송하는 흐름 제어이며 보안 차단이 아님.
- env 읽기: CLAUDE_CONFIG_DIR, HOME, USERPROFILE(경로 계산용). 트랜스크립트는 $.session.messages()로 읽어 핸드오프 요약·배경 정리에만 쓰고 로컬 모델 호출·로컬 파일 저장 밖으로 나가지 않음.
- 기기 밖 데이터 전송 없음. 무거운 타이머: $.clock.after로 유휴 55분 타이머 1개 수준, 과도하지 않음.

</details>

## 더 보기

- [원본 저장소](https://github.com/cablate/ctx-handoff-mod/tree/bd3bfd2c5b86d2587ad2155be5bf5a69c4de7711)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
