# 작업 끝 알림

> 오래 걸린 작업이 끝나거나 확인이 필요하면 맥 알림·한국어 음성·폰 푸시(ntfy·텔레그램·슬랙)로 알려줘요

| | |
| --- | --- |
| 설치 이름 | `done-alarm` |
| 종류 | 오리지널 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/alarm` |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install done-alarm@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install done-alarm@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `https://api.telegram.org/bot${token}/sendMessage`, `https://ntfy.sh`
- ⚙️ **프로그램 실행**. 실행하는 프로그램: `notify-send`, `osascript`, `uname`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔊 **소리**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `classic.Notification`, `command.run{command=alarm}`, `session.start`, `tool.call{tool=AskUserQuestion}`, `turn.complete`, `ui.render{component=PromptHint}`
- 부르는 API: `$.audio.speak`, `$.clock.now`, `$.command.register`, `$.http.fetch`, `$.process.run`, `$.session.cwd`, `$.ui.invalidate`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/done-alarm/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
