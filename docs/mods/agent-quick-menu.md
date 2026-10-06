# 퀵 메뉴

> 설치된 플러그인의 명령과 설정을 한 패널에서 찾아 바로 실행할 수 있어요.

<img src="https://raw.githubusercontent.com/agentic-workbench/agent-quick-menu/29aef14bbe7814e8c7284e2a1dca601435d2dcbe/docs/screenshot.png" alt="퀵 메뉴" width="640">

| | |
| --- | --- |
| 설치 이름 | `agent-quick-menu` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [dasganni](https://github.com/dasganni) |
| 라이선스 | MIT |
| 원본 | [agentic-workbench/agent-quick-menu @ `29aef14`](https://github.com/agentic-workbench/agent-quick-menu/tree/29aef14bbe7814e8c7284e2a1dca601435d2dcbe) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/menu` |
| 권한 | 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install agent-quick-menu@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install agent-quick-menu@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 다른 플러그인의 명령을 대신 실행해 주는 구조라, 자기 플러그인이 아닌 명령은 두 번 눌러야(5초 내 재확인) 실행돼요.
- Claude Code 2.1.287 이상, macOS/Linux 터미널이나 데스크톱 Code 탭 기준이에요. VS Code 채팅 패널은 지원 안 하고 Windows는 저자가 테스트하지 않았다고 README에 적혀 있어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=menu}`, `plugin.register`, `session.start`, `ui.close`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=quick-menu}`
- 부르는 API: `$.clock.now`, `$.clock.sleep`, `$.command.list`, `$.command.register`, `$.command.run`, `$.config.list`, `$.env.get`, `$.fs.exists`, `$.fs.read`, `$.fs.stat`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.close`, `$.ui.focus`, `$.ui.invalidate`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `CLAUDE_CODE_PLUGIN_DIRS`, `CLAUDE_CONFIG_DIR`, `HOME`, `USERPROFILE`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음
- 파일 읽기: 설치된 다른 플러그인들의 quick-menu.json(최대 64KB, 신뢰할 수 없는 입력으로 간주해 엄격히 검증), installed_plugins.json 레지스트리, CLAUDE_CODE_PLUGIN_DIRS로 지정된 폴더의 plugin.json
- 파일 쓰기 없음. 즐겨찾기·접힘 상태는 $.store(플러그인 전용 로컬 저장소)에만 저장해요
- 모델 호출($.model.*) 없음
- 게이팅 훅(plugin.register, ui.close)은 .catch는 없지만(validate: hasCatch false) 둘 다 관찰만 하고 next(e)를 그대로 통과시켜요. 다른 플러그인의 명령을 실행할 때는 최초 클릭 시 '다시 누르면 실행'으로 바뀌고 5초 안에 재클릭해야 실제로 실행되는 2단계 확인 UX가 있어요(자기 플러그인 명령은 바로 실행)
- env 읽기: CLAUDE_CODE_PLUGIN_DIRS, CLAUDE_CONFIG_DIR, HOME, USERPROFILE. 트랜스크립트는 읽지 않아요
- 기기 밖 데이터 전송 없음
- 무거운 타이머·폴링 없음(이벤트 기반)

</details>

## 더 보기

- [원본 저장소](https://github.com/agentic-workbench/agent-quick-menu/tree/29aef14bbe7814e8c7284e2a1dca601435d2dcbe)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
