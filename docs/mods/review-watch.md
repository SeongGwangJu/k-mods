# 리뷰 워치

> 실행 중인 codex review나 '리뷰' 서브에이전트마다 모델·대상·경과 시간을 한 줄로 표시해요. 끝나면 발견 항목 수를 화면 알림으로 알려줘요.

<img src="https://raw.githubusercontent.com/hamzafer/claude-code-mods/adf9d72d81cb04284416371f9de8a6f937dcc631/images/review-watch.png" alt="리뷰 워치" width="640">

| | |
| --- | --- |
| 설치 이름 | `review-watch` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/review-watch @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/review-watch) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 준비물 | ps, tail (macOS/Linux 기본 제공), Codex CLI (선택. codex review 추적 시에만 의미 있음) |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install review-watch@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install review-watch@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 저장소 설명에 'codex review 감시' 기능이 있다고 해서 codex 바이너리를 직접 실행하는지 코드로 확인했어요. 직접 실행하지 않아요. Claude가 이미 Bash로 실행한 `codex review` 명령을 ps/tail로 관찰만 하고, 실행 여부 결정이나 차단은 merge-gate(같은 저장소)의 역할이에요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `ps`, `tail`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `session.start`, `tool.call{tool=Bash}`, `turn.complete`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.agent.list`, `$.clock.every`, `$.env.get`, `$.process.run`, `$.state.get`, `$.state.set`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `HOME`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음. gatingHooks 2건(tool.call{tool=Bash}, agent.spawn)이 .catch 없이 등록되지만, 둘 다 deny를 전혀 하지 않는 관찰용 훅이에요(라벨만 기록하고 항상 next() 통과).
- 네트워크 목적지: 없음.
- 외부 프로그램 실행: codex 바이너리는 직접 실행하지 않음. 대신 `ps -axww -o command=`(실행 중인 codex review 프로세스 탐지), `tail -c 40000 --/-n 30 -- <파일>`(codex가 '> file'로 적어둔 출력을 읽어 마지막 줄·발견 개수 파악), `sh -c 'grep -E "^model *=" "$HOME/.codex/config.toml" | head -n1'`(명령줄에 모델이 없을 때 설정 파일에서 기본 모델명만 읽음). 모두 읽기 전용 로컬 명령이에요.
- 파일 쓰기: 없음.
- 모델 호출($.model.*): 없음.
- tool.call{Bash}/agent.spawn 훅 동작: Bash 명령이 `codex review` 패턴에 맞으면 추적 항목을 추가하고 ps로 생사를 주기적으로 확인, description에 'review'가 들어간 서브에이전트도 같은 방식으로 추적해요. 어느 경우도 차단하지 않아요.
- env/설정/트랜스크립트 읽기: HOME(~/.codex/config.toml 경로용)만 읽어요. 대화 내용·세션 메시지를 읽는 코드는 없어요.
- 기기 밖 데이터 전송: 없음.
- 타이머/폴링: 추적 중인 리뷰가 있을 때만 3초 간격으로 ps를 폴링(겹쳐 돌지 않도록 가드 있음), 화면 갱신용 1초 타이머는 보여줄 내용이 있을 때만 동작해요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/review-watch)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
