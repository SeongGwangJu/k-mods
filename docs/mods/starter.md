# 추천 세트

> 처음이라면 이것부터: 모드 상점, 한국어 팩, 메모장, 컨텍스트 막대, 위험 명령 브레이크, 작업 끝 알림

| | |
| --- | --- |
| 설치 이름 | `starter` |
| 종류 | 묶음 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 📦 묶음 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🛡️ 도구 호출 제어 · 💬 프롬프트 입력 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 · 🔊 소리 |

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

- [모드 상점](mod-store.md) `mod-store`: /k-mods 한 번이면 카탈로그를 둘러보고 버튼으로 설치·제거해요
- [한국어 UI 번역 사전](ko-ui.md) `ko-ui`: 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 사전 기반으로 한국어로 보여줘요.
- [작업 상태 한국어](status-ko.md) `status-ko`: 작업 중 줄을 '읽는 중 · page.tsx'처럼 지금 하는 일로, 끝난 줄을 모델·시간·도구·캐시 한 줄로 보여줘요
- [메모장](memo-pad.md) `memo-pad`: Claude가 일하는 동안 다음에 시킬 일을 적어 두고, 버튼 한 번으로 입력창에 넣어요
- [컨텍스트 막대](ctx-strip.md) `ctx-strip`: 컨텍스트가 무엇으로 차 있는지(대화·도구·스킬…) 입력창 위 막대로 보여주고, 서브에이전트가 돌면 한 줄로 알려줘요
- [위험 명령 브레이크](blast-radius-ko.md) `blast-radius-ko`: rm -rf·force push·DB 초기화처럼 되돌릴 수 없는 명령을 실행 전에 멈추고, 무엇이 바뀌는지 보여준 뒤 물어봐요
- [작업 끝 알림](done-alarm.md) `done-alarm`: 오래 걸린 작업이 끝나거나 확인이 필요하면 맥 알림·한국어 음성·폰 푸시(ntfy·텔레그램·슬랙)로 알려줘요

## 이 mod가 내 컴퓨터에서 하는 일

코드가 없는 묶음이에요. 위 mod들의 권한을 합치면 아래와 같아요.

- 🌐 **네트워크**.
- ⚙️ **프로그램 실행**.
- ✏️ **파일 쓰기**.
- 🛡️ **도구 호출 제어**.
- 💬 **프롬프트 입력**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.
- 🔊 **소리**.

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사

## 더 보기

- [묶음 설명](../../bundles/starter/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
