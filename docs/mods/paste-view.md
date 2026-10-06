# 붙여넣기 미리보기

> 붙여넣은 이미지와 긴 텍스트를 입력창 위에서 바로 미리 보여줘요.

| | |
| --- | --- |
| 설치 이름 | `paste-view` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Clément Décou](https://github.com/Amorfx) |
| 라이선스 | MIT |
| 원본 | [Amorfx/claude-paste-view @ `a71ba10`](https://github.com/Amorfx/claude-paste-view/tree/a71ba10600076c4c9e5623da79dfa576c4a30cbd) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install paste-view@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install paste-view@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `id`, `uname`
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `session.start`, `ui.close{id=paste-view}`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=paste-view}`
- 부르는 API: `$.clock.every`, `$.env.get`, `$.fs.exists`, `$.fs.list`, `$.fs.read`, `$.process.run`, `$.prompt.read`, `$.session.id`, `$.state.get`, `$.state.set`, `$.ui.close`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `CLAUDE_CODE_FORCE_TERMINAL_IMAGES`, `CLAUDE_CODE_SESSION_KIND`, `CLAUDE_CODE_TMPDIR`, `KITTY_WINDOW_ID`, `STY`, `TERM`, `TERM_PROGRAM`, `TMUX`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 모델 호출 없음.
- 외부 프로그램 실행: $.process.run으로 (1) 'id -u'(임시 폴더 경로용 사용자 ID), (2) 클립보드 읽기 도구(OS별 pbpaste 등, LANG=en_US.UTF-8 고정, 1초 타임아웃), (3) 이미지를 '원본 크기로 보기' 클릭 시 OS 기본 뷰어(open/xdg-open). 모두 로컬, 사용자 명시 동작 또는 클립보드 폴링.
- 파일 쓰기 없음(붙여넣기 캐시는 Claude Code 자체가 만든 임시 파일을 읽기만 함).
- gating 훅: ui.close가 .catch 없이 등록되나 차단 로직 없는 패스스루.
- env 읽기: CLAUDE_CODE_FORCE_TERMINAL_IMAGES, CLAUDE_CODE_SESSION_KIND, CLAUDE_CODE_TMPDIR, KITTY_WINDOW_ID, STY, TERM, TERM_PROGRAM, TMUX. 터미널 환경 감지용.
- 기기 밖 데이터 전송 없음. 무거운 타이머 없음(클립보드 폴링은 $.clock.every, 가벼움).

</details>

## 더 보기

- [원본 저장소](https://github.com/Amorfx/claude-paste-view/tree/a71ba10600076c4c9e5623da79dfa576c4a30cbd)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
