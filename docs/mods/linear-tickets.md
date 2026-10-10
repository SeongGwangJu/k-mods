# linear-tickets

> 내게 배정된 Linear 티켓을 패널에 표시해요. 클릭하면 바로 작업을 시작할 수 있어요.

| | |
| --- | --- |
| 설치 이름 | `linear-tickets` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [rjohnt](https://github.com/rjohnt) |
| 라이선스 | MIT |
| 원본 | [rjohnt/linear-claude-mod @ `629eb7d`](https://github.com/rjohnt/linear-claude-mod/tree/629eb7d23bb8702fadf22e3a28b01ca61c0c4415) |
| 유형 | 🔗 연동 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/tickets` |
| 준비물 | Linear MCP 서버 연결 (plugin.json 기본값 plugin:linear:linear) |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 💬 프롬프트 입력 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install linear-tickets@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install linear-tickets@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**.
- ⚙️ **프로그램 실행**.
- 💬 **프롬프트 입력**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=tickets}`, `session.start`, `ui.render{component=Pane, requestId=linear-tickets}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.mcp.call`, `$.process.run`, `$.prompt.submit`, `$.state.get`, `$.state.set`, `$.ui.focus`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 5개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출: 플러그인이 직접 fetch하지 않고 사용자가 이미 연결한 Linear MCP 서버($.mcp.call)를 통해서만 Linear API에 접근. 신뢰 경계가 사용자의 기존 MCP 설정에 있음.
- 외부 프로그램 실행: 'Open in Linear' 버튼을 눌렀을 때만 $.process.run으로 OS 기본 브라우저 오프너를 실행해 티켓 URL을 염. 사용자 명시 클릭에만 동작.
- 파일 쓰기 없음. 모델 호출 없음. gating 훅 없음 (tool.call/prompt.submit/tool.check 미등록).
- env 읽기 없음, 트랜스크립트 읽기 없음. 기기 밖 데이터 전송은 Linear API 호출(이 mod의 핵심 기능)뿐이며 사용자가 설정한 MCP 서버를 통해서만 이뤄짐.
- validate 경고: plugin.json name이 'linear-claude-mod'라 'Anthropic 자체 플러그인처럼 읽힌다'는 경고가 뜸(코드 문제는 아니며 k-mods 등록 이름은 linear-tickets로 분리함). author 정보 없음 경고도 있었음(위 author는 저장소 소유자 기준).

</details>

## 더 보기

- [원본 저장소](https://github.com/rjohnt/linear-claude-mod/tree/629eb7d23bb8702fadf22e3a28b01ca61c0c4415)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
