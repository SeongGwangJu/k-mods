# reels

> Claude가 작업하는 동안 YouTube Shorts를 터미널 패널에서 재생하고 작업이 끝나면 자동으로 멈춰요. `/reels`를 입력했을 때만 재생돼요.

<img src="https://raw.githubusercontent.com/hamzafer/claude-code-mods/adf9d72d81cb04284416371f9de8a6f937dcc631/images/reels-demo.gif" alt="reels" width="640">

| | |
| --- | --- |
| 설치 이름 | `reels` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/reels @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/reels) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/reels` |
| 준비물 | Playwright (최초 /reels 실행 시 설치 안내가 떠요: npm install --prefix <plugin> playwright) |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install reels@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install reels@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 코드(helper/reels.cjs)까지 직접 읽어 확인했어요. Playwright로 헤드리스 Chrome을 띄워 https://www.youtube.com/shorts 를 열고, 화면을 CDP 스크린캐스트로 캡처해 PNG로 저장한 뒤 패널에 보여줘요. 제어는 로컬 유닉스 소켓(파일 경로를 쓰는 IPC)으로만 하고, 바깥에 열린 네트워크 포트는 아니에요.
- 프로필(쿠키 등)은 ~/.claude-mods/reels/profile에 로컬로만 저장돼요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `http://reels${path}`
- ⚙️ **프로그램 실행**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=reels}`, `session.end`, `session.start`, `turn.complete`, `turn.start`, `ui.render{component=Pane, requestId=reels}`
- 부르는 API: `$.command.register`, `$.env.get`, `$.fs.exists`, `$.http.fetch`, `$.process.spawn`, `$.state.get`, `$.state.set`, `$.ui.blit`, `$.ui.close`, `$.ui.log`, `$.ui.open`, `$.ui.resolve`
- 읽는 환경 변수: `HOME`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음, gatingHooks 없음.
- 네트워크 목적지: https://www.youtube.com/shorts. 이 mod의 핵심 기능 자체(Shorts 재생)라 당연한 목적지예요. /reels login으로 쿠키 동의·로그인을 할 때도 같은 YouTube 도메인이에요.
- 외부 프로그램 실행: `node <plugin>/helper/reels.cjs <소켓> <프로필폴더> <프레임폴더> pane|login`. Playwright로 Chrome을 실행하는 헬퍼 프로세스예요(소스 코드까지 직접 읽어 확인).
- 파일 쓰기: ~/.claude-mods/reels/ 아래에 Chrome 프로필, 캡처된 프레임 PNG(f-0/1/2.png 순환)만 로컬로 써요.
- 모델 호출($.model.*): 없음.
- prompt.submit/tool.call/tool.check 훅: 등록하지 않음.
- env/설정/트랜스크립트 읽기: HOME(저장 경로 계산)만 읽어요.
- 기기 밖 데이터 전송: YouTube 접속 자체 외에는 없음.
- 타이머/폴링: 헬퍼 프로세스가 초당 약 15프레임으로 화면을 캡처해 파일에 쓰고, 이 mod는 그 줄 출력을 그대로 읽어 패널만 갱신해요. opt-in이고 /snake처럼 Claude가 쉬면 자동으로 영상을 멈춰요(watch 쿼리 자체는 멈추지 않지만 overlay로 가리고 video.pause()를 호출).

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/reels)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
