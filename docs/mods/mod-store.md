# 모드 상점

> `/k-mods`를 입력하면 카탈로그가 열려요. 버튼으로 mod를 설치하거나 제거할 수 있어요

| | |
| --- | --- |
| 설치 이름 | `mod-store` |
| 종류 | 오리지널 |
| 만든 사람 | [SeongGwangJu](https://github.com/SeongGwangJu) |
| 라이선스 | MIT |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/k-mods` |
| 권한 | ⚙️ 프로그램 실행 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install mod-store@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install mod-store@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `claude`
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=k-mods}`, `session.start`, `ui.render{component=Pane}`
- 부르는 API: `$.command.register`, `$.command.run`, `$.process.run`, `$.settings.read`, `$.store.get`, `$.store.set`, `$.ui.ask`, `$.ui.close`, `$.ui.copy`, `$.ui.invalidate`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인

## 더 보기

- [mod 설명서](../../mods/mod-store/README.md)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
