# 택시팩

> Claude Code를 택시로: 미터기(요금·한도), 내비(할 일 경로), 과속카메라(위험 명령 확인), 블랙박스(도구 호출 녹화)를 한 번에 설치해요

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

- [택시 미터기](taxi-meter.md) `taxi-meter`: 입력창 위 택시 미터기 패널로 세션 요금과 5시간·주간 한도를 보여줘요. /meter·/receipt로 자세히 볼 수 있어요.
- [택시 내비게이션](taxi-navi.md) `taxi-navi`: 할 일 목록을 내비게이션처럼 보여줘요. 진행 경로와 다음 안내가 표시되고, 계획이 바뀌면 경로를 다시 찾아줘요.
- [택시 과속카메라](taxi-speedcam.md) `taxi-speedcam`: force push·rm -rf·DB 삭제·변경 폐기·운영 배포처럼 위험한 Bash 명령 앞에서 찰칵 찍고 물어봐요. 실행할지 세울지는 사용자가 정해요.
- [택시 블랙박스](taxi-blackbox.md) `taxi-blackbox`: 도구 호출을 블랙박스처럼 녹화해서, 오류나 거부 직전 상황을 /blackbox에서 돌려볼 수 있어요. 토큰·비밀번호는 가려서 기록해요.

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
