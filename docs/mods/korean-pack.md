# 한국어 팩

> 메뉴·설정 번역(ko-ui)과 작업 상태 한국어(status-ko)를 한 번에 설치해 Claude Code 화면을 한국어로 바꿔요

| | |
| --- | --- |
| 설치 이름 | `korean-pack` |
| 종류 | 묶음 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 📦 묶음 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install korean-pack@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install korean-pack@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 함께 설치되는 mod

- [ko-ui](ko-ui.md): 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 번역 사전에 맞춰 한국어로 표시해요.
- [작업 상태 한국어](status-ko.md) `status-ko`: 작업 중에는 '읽는 중 · page.tsx'처럼 지금 하는 일을 보여줘요. 끝나면 모델·시간·도구·캐시를 한 줄로 정리해요

## 이 mod가 내 컴퓨터에서 하는 일

코드가 없는 묶음이에요. 위 mod들의 권한을 합치면 아래와 같아요.

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 📂 **파일 읽기**.

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사

## 더 보기

- [묶음 설명](../../bundles/korean-pack/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
