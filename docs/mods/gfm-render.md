# gfm-render

> 대화 기록에 있는 GFM 경고문·체크리스트·취소선·Mermaid 다이어그램을 화면에 표시해요.

| | |
| --- | --- |
| 설치 이름 | `gfm-render` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [briangtn](https://github.com/briangtn) |
| 라이선스 | MIT |
| 원본 | [briangtn/claude-gfm-render @ `a209ad5`](https://github.com/briangtn/claude-gfm-render/tree/a209ad5a0ec35c0813d2d80ab62b596140b0c807) |
| 유형 | 🎨 테마 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install gfm-render@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install gfm-render@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `node`
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `ui.render{component=AssistantMessage}`
- 부르는 API: `$.process.run`, `$.state.get`, `$.state.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음. $.http.fetch 사용처 없음.
- 외부 프로그램 실행: $.process.run으로 플러그인에 내장된 로컬 Node 스크립트(renderer/svg.mjs, 번들된 beautiful-mermaid·elkjs)만 실행. Mermaid 다이어그램을 SVG로 레이아웃하는 용도, 네트워크·외부 바이너리 없음.
- 파일 쓰기 없음. 모델 호출 없음 ($.model.* 미사용).
- gating 훅 없음. tool.call/prompt.submit/tool.check 등록 안 함.
- env 읽기 없음, 트랜스크립트 직접 읽기 없음 (ui.render로 받은 AssistantMessage만 처리). 기기 밖 데이터 전송 없음. 무거운 타이머 없음.
- renderer/ 폴더에 MIT(beautiful-mermaid, Craft Docs 저작권)와 EPL-2.0(elkjs) 두 서드파티 라이브러리를 라이선스 파일과 함께 번들. 저장소 자체 라이선스(MIT)와 별개로 고지되어 있음.

</details>

## 더 보기

- [원본 저장소](https://github.com/briangtn/claude-gfm-render/tree/a209ad5a0ec35c0813d2d80ab62b596140b0c807)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
