# 추천 세트

> 처음 설치하기 좋은 추천 세트예요. ko-ui, status-ko, skins, spinner, ctx-strip, mod-store를 한 번에 설치해요

| | |
| --- | --- |
| 설치 이름 | `starter` |
| 종류 | 묶음 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 📦 묶음 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install starter@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install starter@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 함께 설치되는 mod

- [ko-ui](ko-ui.md): 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 번역 사전에 맞춰 한국어로 표시해요.
- [작업 상태 한국어](status-ko.md) `status-ko`: 작업 중에는 '읽는 중 · page.tsx'처럼 지금 하는 일을 보여줘요. 끝나면 모델·시간·도구·캐시를 한 줄로 정리해요
- [skins](skins.md): 도구 호출·표·코드·셸 출력을 테마 카드 형식으로 표시해요. 원본에서 한글 표가 잘리던 문제를 고쳤어요
- [spinner](spinner.md): Claude가 일하는 동안 입력창 위에 냥캣·Clawd 같은 픽셀 장면을 표시하고 펫을 키워요. 한국어·간결한 기본값으로 고친 수정판이에요
- [컨텍스트 막대](ctx-strip.md) `ctx-strip`: 컨텍스트 구성(대화·도구·스킬…)을 입력창 위 막대로 표시해요. 서브에이전트가 실행되면 한 줄로 알려줘요
- [모드 상점](mod-store.md) `mod-store`: `/k-mods`를 입력하면 카탈로그가 열려요. 버튼으로 mod를 설치하거나 제거할 수 있어요

## 이 mod가 내 컴퓨터에서 하는 일

코드가 없는 묶음이에요. 위 mod들의 권한을 합치면 아래와 같아요.

- ⚙️ **프로그램 실행**.
- ✏️ **파일 쓰기**.
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

## 검토 기록

- 2026-10-08 · k-mods · Claude Code 2.1.294 · 정적 검사

## 더 보기

- [묶음 설명](../../bundles/starter/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
