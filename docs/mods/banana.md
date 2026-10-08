# 바나나 클리커

> Claude가 생각하는 동안 대화 옆에 바나나 창이 열려요. 바나나를 눌러 코인과 희귀 바나나를 모으고, 모은 코인을 스폰서가 주는 LLM 토큰 $1과 바꿀 수 있어요.

<img src="https://raw.githubusercontent.com/somethingwentwell/cc-mod-banana-game/main/docs/hero.png" alt="바나나 클리커" width="640">

| | |
| --- | --- |
| 설치 이름 | `banana` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [somethingwentwell](https://github.com/somethingwentwell) |
| 라이선스 | MIT |
| 원본 | [somethingwentwell/cc-mod-banana-game @ `ee3d166`](https://github.com/somethingwentwell/cc-mod-banana-game/tree/ee3d1660c509716fc8fbd893cb363c513220e2d8) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/banana` |
| 준비물 | Claude Code 2.1.287 이상, 토큰으로 바꾸려면 스폰서 게이트웨이(New API) 계정이 필요해요. 가입한 뒤 `/banana link <아이디>`로 연결해요 |
| 권한 | 🌐 네트워크 · ⚙️ 프로그램 실행 · 👀 대화 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install banana@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install banana@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 설정이 없으면 스폰서 서버 https://banana.jevable.ai/game 에 접속해요. 보내는 것은 무작위 플레이어 ID, 클릭·코인·드롭 수, 직접 설정한 리더보드 이름과 게이트웨이 아이디, mod 버전, 화면 종류(터미널·데스크톱)뿐이에요. 프롬프트·코드·파일·대화는 보내지 않아요.
- 플러그인 설정에서 Server URL과 Content URL을 비우면 서버 없이 혼자 플레이해요.
- 코인과 바나나는 얻은 지 7일 뒤 사라져요. 누적 클릭·코인은 사라지지 않고 리더보드에 쓰여요.
- 터미널이 144칸 이상이면 Claude가 생각할 때 저절로 열리고, 좁으면 `/banana`로 열어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `http://localhost`, `http://www.w3.org/2000/svg`, `https://banana.jevable.ai/register`
- ⚙️ **프로그램 실행**.
- 👀 **대화 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=banana}`, `session.start`, `turn.complete`, `turn.start`, `ui.render{component=Pane, requestId=banana}`
- 부르는 API: `$.clock.every`, `$.clock.sleep`, `$.command.register`, `$.fs.exists`, `$.fs.read`, `$.http.fetch`, `$.process.run`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.close`, `$.ui.copy`, `$.ui.open`, `$.ui.panes`, `$.ui.resolve`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-08 · somethingwentwell · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트, 실제 세션 확인
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 5개 (코드를 읽으며 확인한 것)</summary>

- 작성자 본인 등록. validate 통과, claude plugin test 22개 통과, 터미널 실제 세션에서 클릭·가방·상점·교환·순위를 확인.
- 네트워크: $.http.fetch로 serverUrl(기본 https://banana.jevable.ai/game)의 /hello·/sync·/rate·/stock·/leaderboard·/redeem과 contentUrl(기본 .../game/content)만 호출. 프롬프트·대화·파일 내용은 보내지 않음.
- 외부 프로세스: 'Update required' 화면의 Update now 버튼을 누를 때만 $.process.run을 argv로 실행. 마켓플레이스 설치면 `claude plugin marketplace update banana`와 `claude plugin update banana@banana`, 클론이면 `git -C <플러그인 루트> pull --ff-only`.
- 파일: $.fs.read로 자기 plugin.json만 읽고, $.fs.exists로 .git 존재만 확인. 파일 쓰기 없음. 진행 상황은 $.store에 저장.
- 모델 호출·도구 승인/거절 없음. 훅은 session.start·turn.start·turn.complete·command.run·ui.render뿐. audit의 chat 표시는 turn.complete 훅 때문이며, 이 훅은 답변 내용(e.answer)을 읽지 않고 e.agentId만 보고 창을 닫은 뒤 클릭 수 동기화를 최대 2초 기다리고 next(e)를 넘김.

</details>

## 더 보기

- [원본 저장소](https://github.com/somethingwentwell/cc-mod-banana-game/tree/ee3d1660c509716fc8fbd893cb363c513220e2d8)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
