# 택시 과속카메라

> force push·rm -rf·DB 삭제·변경 폐기·운영 배포처럼 위험한 Bash 명령을 실행하기 전에 확인을 요청해요. 실행하거나 차단할지는 사용자가 정해요.

| | |
| --- | --- |
| 설치 이름 | `taxi-speedcam` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| 라이선스 | MIT |
| 원본 | [devbrother2024/devbrothers-mods/plugins/taxi-speedcam @ `82b075c`](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-speedcam) |
| 유형 | 🛡️ 지킴이 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/speedcam` |
| 권한 | 🛡️ 도구 호출 제어 · 🔊 소리 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install taxi-speedcam@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install taxi-speedcam@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 🔊 **소리**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=speedcam}`, `session.start`, `tool.call{tool=Bash}`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.audio.play`, `$.audio.speak`, `$.clock.after`, `$.clock.now`, `$.command.register`, `$.ui.ask`, `$.ui.invalidate`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 3개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음(음성·효과음은 $.audio.* 엔진 API), 모델 호출 없음, 파일 쓰기 없음. 전부 로컬 정규식 패턴 매칭(force push, rm -rf, DB drop/truncate, git reset --hard 등, 운영 배포 플래그).
- tool.call{tool=Bash} 훅이 .catch 없이 등록돼 --strict에서는 탈락하지만, 내부 로직은 fail-closed로 설계됨: mode='ask'(기본값)일 때 $.ui.ask가 실패하면 answer 변수가 초기값 '세워주세요'(STOP)로 남아 명령을 막고, mode='block'이면 물어보지 않고 항상 막음. 예외 상황에서도 위험한 명령을 통과시키지 않는 쪽으로 떨어짐.
- env 읽기 없음, 트랜스크립트 읽기 없음. 기기 밖 데이터 전송 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/devbrother2024/devbrothers-mods/tree/82b075ca7af3e066a4c88f542dabb95888225e1e/plugins/taxi-speedcam)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
