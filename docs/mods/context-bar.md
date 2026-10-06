# 컨텍스트 바 (hamzafer)

> 컨텍스트 창을 /context와 같은 색으로 구간별 막대 그래프로 보여주고, 토큰 수·압축 시점·범례까지 입력창 위에 표시해요.

<img src="https://raw.githubusercontent.com/hamzafer/claude-code-mods/adf9d72d81cb04284416371f9de8a6f937dcc631/images/context-bar.png" alt="컨텍스트 바 (hamzafer)" width="640">

| | |
| --- | --- |
| 설치 이름 | `context-bar` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Hamza Zafar](https://github.com/hamzafer) |
| 라이선스 | MIT |
| 원본 | [hamzafer/claude-code-mods/mods/context-bar @ `adf9d72`](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/context-bar) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/context-bar` |
| 권한 | 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install context-bar@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install context-bar@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- k-mods 자체 mod인 ctx-strip과 개념이 겹쳐요(둘 다 컨텍스트 창을 막대로 보여줌). 이름은 다르므로(string 충돌 아님) 등록은 했지만, 기계적으로는 ctx-strip이 '막대 + 서브에이전트 한 줄'을 한 번에 보여주는 반면 context-bar는 /context와 동일한 카테고리별 색상·범례·압축 임계값 표시에 집중한 순수 컨텍스트 전용 버전이라는 차이가 있어요. 최종적으로 사용자에게 둘 다 보여줄지, 하나만 추천할지는 교차 조율이 필요해 보여요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=context-bar}`, `session.compact`, `session.start`, `turn.complete`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.command.register`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- validate 성공(success:true), errors/warnings 없음, gatingHooks 없음(이 mod는 세션 이벤트와 화면 그리기만 다뤄요).
- 네트워크 목적지: 없음.
- 외부 프로그램 실행: 없음.
- 파일 쓰기: 없음. 숨김 여부는 $.store(isHidden)에만 저장돼요.
- 모델 호출($.model.*): 없음. 컨텍스트 분해는 $.session.usage({breakdown:'summary'})로 Claude Code가 이미 계산해 둔 값을 그대로 읽어요(별도 토큰 계산 API 호출 없음).
- prompt.submit/tool.call/tool.check 훅: 등록하지 않음.
- env/설정/트랜스크립트 읽기: 없음.
- 기기 밖 데이터 전송: 없음.
- 타이머/폴링: 없음. 매 턴 종료(turn.complete)와 /compact 직후에만 다시 그려요.

</details>

## 더 보기

- [원본 저장소](https://github.com/hamzafer/claude-code-mods/tree/adf9d72d81cb04284416371f9de8a6f937dcc631/mods/context-bar)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
