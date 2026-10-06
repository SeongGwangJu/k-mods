# 나우 플레잉

> macOS에서 Spotify로 재생 중인 곡과 가사를 입력창 위에 보여주고, 버튼이나 /music으로 재생·일시정지·이전·다음을 조작해요.

<img src="https://raw.githubusercontent.com/hamzafer/claude-code-mods/adf9d72d81cb04284416371f9de8a6f937dcc631/images/now-playing.png" alt="나우 플레잉" width="640">

| | |
| --- | --- |
| 설치 이름 | `now-playing` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/now-playing @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/now-playing) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/music` |
| 준비물 | macOS, Spotify 데스크톱 앱 |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install now-playing@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install now-playing@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- macOS가 아니면 session.start에서 uname -s로 확인해 명령 등록·폴링을 전혀 하지 않고 조용히 꺼져 있어요(Linux/Windows에서 아무 영향 없음).

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `https://lrclib.net/api`
- ⚙️ **프로그램 실행**. 실행하는 프로그램: `osascript`, `pgrep`, `uname`

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=music}`, `session.end`, `session.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.clock.sleep`, `$.command.register`, `$.http.fetch`, `$.process.run`, `$.state.get`, `$.state.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음, gatingHooks 없음.
- 네트워크 목적지: LRCLIB(https://lrclib.net/api). 곡이 바뀔 때마다 1회, 가사(싱크 가사)를 받아오려고 트랙명·아티스트명·앨범명·재생시간을 보내요. userConfig의 lyrics 옵션을 끄면(/config) 이 호출 자체가 아예 일어나지 않아요. 대화 내용이나 코드가 아니라 공개된 곡 정보만 보내는 호출이에요.
- 외부 프로그램 실행: `osascript`로 Spotify를 AppleScript 제어(재생 상태 조회, 재생/일시정지/다음/이전. 'is running' 확인이 먼저라 Spotify를 새로 실행시키지 않음), `pgrep -x Spotify`(꺼져 있을 때 가벼운 확인용), `uname -s`(macOS 여부 확인).
- 파일 쓰기: 없음.
- 모델 호출($.model.*): 없음.
- prompt.submit/tool.call/tool.check 훅: 등록하지 않음.
- env/설정/트랜스크립트 읽기: 없음.
- 기기 밖 데이터 전송: 가사 조회 1건(위 설명) 외에는 없음. 로그인이 필요 없는 공개 API예요.
- 타이머/폴링: 재생 중엔 3초, 멈춰 있으면 5초 간격으로 Spotify 상태를 가볍게 확인해요(0.25초마다 화면의 재생 바만 로컬 계산으로 움직이고, 실제 Spotify 질의는 그보다 드물게). Spotify가 꺼져 있으면 pgrep만 돌려 가벼워요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/now-playing)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
