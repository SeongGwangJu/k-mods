# subagent-tuner

> 서브에이전트가 시작될 때 쓸 모델과 추론 강도를 직접 고르거나, 작업 종류별 추천과 저장한 기본값으로 정해요.

| | |
| --- | --- |
| 설치 이름 | `subagent-tuner` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Aleh Kruhlikau](https://github.com/Kruhlikau) |
| 라이선스 | MIT |
| 원본 | [Kruhlikau/subagent-tuner @ `46bee01`](https://github.com/Kruhlikau/subagent-tuner/tree/46bee016e183ca81ede82139fa01b17048ee721e) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🛡️ 도구 호출 제어 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install subagent-tuner@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install subagent-tuner@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- `claude -p`와 SDK 실행, 포크는 건드리지 않아요.
- 입력창 위 띠에서 Manual(묻기)과 Auto(저장한 기본값 우선)를 바꿔요. 터미널이 144칸 이상이면 옆 패널로, 좁으면 대화상자로 물어봐요.
- 설치 직후는 Manual이라 서브에이전트를 띄울 때마다 물어봐요. 패널은 답이 없으면 10분 뒤 진행하고, 대화상자는 답할 때까지 기다려요. 자리를 비울 때는 Auto로 두세요.
- 저장한 기본값과 내장 에이전트의 추천값은 에이전트 정의(frontmatter)에 적은 모델·추론 강도보다 우선해요. 직접 만든 에이전트는 저장한 기본값이 없으면 건드리지 않고 정의에 적은 값을 그대로 써요. 추천값은 에이전트 종류나 작업 설명의 단어(review, fix, research 등)로 골라요. Claude Code가 내장 에이전트를 호출 뒤에야 알려 주면, 에이전트가 시작될 때 추천 모델만 적용해요(추론 강도는 적용되지 않아요).

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**.
- ✏️ **파일 쓰기**.
- 🛡️ **도구 호출 제어**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `agent.offer`, `agent.spawn`, `session.start`, `tool.call{tool=Agent}`, `ui.close`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane}`
- 부르는 API: `$.clock.now`, `$.clock.sleep`, `$.fs.write`, `$.process.run`, `$.session.surfaces`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.ask`, `$.ui.close`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-15 · k-mods · Claude Code 2.1.296 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- validate 통과, errors/warnings 없음. 원본 저장소 CI에서 validate --strict와 테스트 196개가 통과했어요.
- 네트워크 호출과 모델 호출은 없어요. 대화 내용을 기기 밖으로 보내지 않아요.
- 외부 프로그램은 대기용 sh(macOS·Linux) 또는 powershell.exe(Windows)만 실행해요. 패널 대기와, 플러그인 폴더의 .waits/ 쓰기 확인 파일 삭제에만 써요. 파일 경로는 셸 인자나 이스케이프한 문자열로 넘겨요.
- 파일 쓰기는 플러그인 폴더의 .waits/ 아래 빈 신호 파일과 확인용 .probe 파일뿐이고, 끝나면 지워요. 설정(모드·기본값)은 Claude Code의 플러그인 저장소에 저장해요.
- tool.call{tool=Agent}를 가로채 model과 effort 필드만 바꾸고, 사용자가 취소하면 호출을 거절해요(deny). 훅이 실패하면 .catch로 원래 호출을 그대로 통과시켜요.
- ui.close 훅은 .catch 없이 등록되지만 패널을 닫은 결정만 기록하고 항상 next()로 넘겨요.
- agent.offer 훅은 어떤 에이전트가 내장인지 기록만 하고 항상 next()로 원래 제안을 그대로 넘겨요.
- agent.spawn 훅은 호출 때 이름으로만 판단한 Auto 호출에 한해, 엔진이 제공한 내장 에이전트면 모델만 바꾸고 항상 .catch로 원래 흐름을 이어 줘요.

</details>

## 더 보기

- [원본 저장소](https://github.com/Kruhlikau/subagent-tuner/tree/46bee016e183ca81ede82139fa01b17048ee721e)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
