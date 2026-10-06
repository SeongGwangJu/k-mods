# 택시팩

> 미터기(요금·한도), 내비(할 일 진행 상황), 과속카메라(위험 명령 확인), 블랙박스(도구 호출 기록)를 한 번에 설치해요

| | |
| --- | --- |
| 설치 이름 | `taxi-pack` |
| 종류 | 묶음 |
| 만든 사람 | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| 라이선스 | MIT |
| 유형 | 📦 묶음 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install taxi-pack@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install taxi-pack@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 함께 설치되는 mod

- [택시 미터기](taxi-meter.md) `taxi-meter`: 입력창 위 택시 미터기 패널에 세션 요금과 5시간·주간 한도를 표시해요. /meter·/receipt로 자세히 볼 수 있어요.
- [택시 내비게이션](taxi-navi.md) `taxi-navi`: 할 일 목록에서 현재 진행 상태와 다음 할 일을 표시해요. 계획이 바뀌면 새 순서에 맞춰 목록을 갱신해요.
- [택시 과속카메라](taxi-speedcam.md) `taxi-speedcam`: force push·rm -rf·DB 삭제·변경 폐기·운영 배포처럼 위험한 Bash 명령을 실행하기 전에 확인을 요청해요. 실행하거나 차단할지는 사용자가 정해요.
- [택시 블랙박스](taxi-blackbox.md) `taxi-blackbox`: 도구 호출을 기록하고 오류나 거부 직전의 기록을 /blackbox에서 다시 확인할 수 있어요. 토큰·비밀번호는 가려서 기록해요.

## 이 mod가 내 컴퓨터에서 하는 일

코드가 없는 묶음이에요. 위 mod들의 권한을 합치면 아래와 같아요.

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 🔊 **소리**.

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사

## 더 보기

- [묶음 설명](../../bundles/taxi-pack/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
