# usage-band-pawandeep

> 입력창 위에 5시간·주간 사용량 퍼센트와 초기화 카운트다운을 항상 표시해요. 새 채팅·GitHub 푸시 버튼도 함께 제공해요.

<img src="https://raw.githubusercontent.com/pawandeepdhall/claude-mods/e00264e286951fd6522a12e321cc56f3ebe3c598/docs/usage-band.png" alt="usage-band-pawandeep" width="640">

| | |
| --- | --- |
| 설치 이름 | `usage-band-pawandeep` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | Pawandeep |
| 라이선스 | MIT |
| 원본 | [pawandeepdhall/claude-mods/plugins/usage-band @ `e00264e`](https://github.com/pawandeepdhall/claude-mods/tree/e00264e286951fd6522a12e321cc56f3ebe3c598/plugins/usage-band) |
| 유형 | 📊 상태줄 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · 💬 프롬프트 입력 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install usage-band-pawandeep@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install usage-band-pawandeep@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- ↑ 푸시 버튼은 git 명령을 직접 실행하지 않아요. 커밋 후 푸시해 달라는 요청을 사용자가 직접 입력한 것처럼 Claude에게 제출할 뿐이라, 실제 git 실행은 평소 권한 설정(permission)을 그대로 따라요.
- ＋ 새 채팅 버튼은 Windows에서는 번들된 VBScript(wscript.exe)로, macOS에서는 osascript로 Ctrl+N/Cmd+N 키 입력을 흉내 내요.
- 같은 저장소의 `next-steps` 플러그인은 이번 심사 대상이 아니에요(모델 호출 `$.model.complete`을 써서 별도 검토가 필요해요).
- 비슷한 성격의 사용량 표시 mod로 `mod-usage`(Desktop/VS Code 전용, 다국어)와 `taxi-meter`(택시 미터기 테마, 원화 환산)도 등록돼 있어요. 이 mod는 터미널·데스크톱 모두 되고 새 채팅·GitHub 푸시 버튼이 있다는 점이 달라요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `git`, `osascript`, `wscript.exe`
- 💬 **프롬프트 입력**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `session.measure`, `session.start`, `ui.render{component=AbovePrompt}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.process.run`, `$.prompt.submit`, `$.session.usage`, `$.state.get`, `$.state.set`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음. register.tsx 전체에 fetch나 외부 URL 요청이 없어요(SVG 안의 `http://www.w3.org/2000/svg`는 XML 네임스페이스 문자열일 뿐 실제 요청이 아니에요).
- 외부 프로그램 실행: `git rev-parse --is-inside-work-tree`(저장소 여부 확인, 읽기 전용), Windows에서 `wscript.exe //B //Nologo scripts/new-chat.vbs`(Ctrl+N 시뮬레이션), macOS에서 `osascript -e 'keystroke "n" using command down'`(Cmd+N). 모두 ＋ 버튼을 사용자가 직접 눌렀을 때만 실행돼요.
- 파일 쓰기: 없음.
- 모델 호출(`$.model.*`): 없음.
- 게이팅 훅(`prompt.submit`/`tool.call`/`tool.check`) 자체는 등록하지 않아요. validate 결과 `gatingHooks: []`. 다만 `pushToGitHub` 함수가 `$.prompt.submit`을 API로 호출해, ↑ 버튼 클릭 시 '커밋 후 푸시' 요청을 사용자가 입력한 메시지처럼 제출해요. Claude의 통상적인 도구 승인 절차를 그대로 거치고 mod가 git을 직접 실행하지 않아요.
- env·설정·트랜스크립트 읽기 없음. `$.session.usage()`로 현재 세션의 요금제 한도(rateLimits)만 읽어요.
- 기기 밖 데이터 전송: 없음.
- 타이머: 카운트다운 갱신용 `$.clock.every(60_000, ...)` 1분 주기 하나뿐. 가벼움, 무거운 폴링 아님.
- `claude plugin validate --json` 성공(success:true, strict:false, gatingHooks:[]).

</details>

## 더 보기

- [원본 저장소](https://github.com/pawandeepdhall/claude-mods/tree/e00264e286951fd6522a12e321cc56f3ebe3c598/plugins/usage-band)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
