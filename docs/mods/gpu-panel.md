# gpu-panel

> 프롬프트 밑 한 줄에 어느 GPU가 돌고 있는지, 내 학습이 몇 개 떠 있는지, 플랜 한도와 컨텍스트가 얼마나 남았는지 보여줘요. gpu를 누르면 카드마다 누가 쓰고 있는지까지 옆 창에 나와요.

| | |
| --- | --- |
| 설치 이름 | `gpu-panel` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [tom0266](https://github.com/tom0266) |
| 라이선스 | MIT |
| 원본 | [tom0266/claude-gpu-panel/gpu-panel @ `e8d086a`](https://github.com/tom0266/claude-gpu-panel/tree/e8d086abe104fd25c565a0123ed8b713ccf60f39/gpu-panel) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/gpu` |
| 준비물 | GPU 칸은 PATH에 nvidia-smi가 있어야 나와요. 없으면 그 칸만 숨겨져요., job 칸은 ~/.claude/statusline-jobs.txt(한 줄에 패턴 하나)가 있어야 나와요. |
| 권한 | ⚙️ 프로그램 실행 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install gpu-panel@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install gpu-panel@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 추천 설정

`/plugin configure gpu-panel@k-mods` 또는 `/config`에서 바꿀 수 있어요.

| 설정 | 값 | 이유 |
| --- | --- | --- |
| `undefined` | `undefined` | undefined |
| `undefined` | `undefined` | undefined |
| `undefined` | `undefined` | undefined |
| `undefined` | `undefined` | undefined |

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `grep`, `nvidia-smi`, `ps`
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.329
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `command.run{command=effort}`, `command.run{command=gpu}`, `session.measure`, `session.start`, `ui.render{component=Pane, requestId=gpu-panel-detail} (default matcher key: plugin)`, `ui.render{component=PromptHint}`, `ui.status`
- 부르는 API: `$.agent.list`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.command.run`, `$.env.get`, `$.fs.read`, `$.process.hookEnv`, `$.process.run`, `$.session.compact`, `$.session.info`, `$.session.model`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.open`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `HOME`, `USER`

</details>

## 검토 기록

- 2026-11-20 · tom0266 · Claude Code 2.1.329 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 10개 (코드를 읽으며 확인한 것)</summary>

- 작성자 본인이 등록한 항목이에요(자기 검토).
- 네트워크 호출 없음($.http.fetch 미사용). 모델 호출 없음.
- 외부 프로그램 실행: 10초마다 nvidia-smi와 ps, 30초마다 세션 기록 파일에서 제목을 찾는 grep. GPU 창이 열려 있을 때만 nvidia-smi --query-compute-apps와 ps로 카드별 사용 계정을 조회해요.
- 파일 읽기: ~/.claude/statusline-jobs.txt(감시 패턴)와 현재 세션 기록 파일(세션 이름). 파일 쓰기 없음.
- 저장: 실제로 본 모델 id에서 배운 버전 번호만 $.store에 남겨요(세션 간 유지).
- ui.status 훅은 hideQuietStatus 옵션을 켰을 때만 등록돼요(기본 꺼짐). 켜면 다른 mod의 상태 줄 가운데 'no active cases', 'waste≈0'이 들어간 줄만 숨기고 경고는 그대로 지나가요.
- gating 훅(command.run effort, agent.spawn, 옵션을 켰을 때의 ui.status)은 모두 .catch로 next(e)를 통과시켜요. 서브에이전트 생성을 막지 않아요.
- 버튼은 /effort, /model 실행과 $.session.compact 호출이에요. 사용자가 눌렀을 때만 동작해요.
- env 읽기: HOME, USER. 기기 밖 데이터 전송 없음.
- plugin.json에 network.hosts를 빈 목록으로 선언했어요. claude plugin validate --strict 통과.

</details>

## 더 보기

- [원본 저장소](https://github.com/tom0266/claude-gpu-panel/tree/e8d086abe104fd25c565a0123ed8b713ccf60f39/gpu-panel)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
