# pixel-pals

> Claude가 일하는 동안 입력창 위에 냥캣·Clawd·썬더 같은 픽셀 친구들이 지나가요. 엄선한 장면 6종에 clawd-tales의 Clawd 이야기를 합친 한국어판이에요

<img src="../../docs/assets/mods/pixel-pals.gif" alt="pixel-pals" width="640">

| | |
| --- | --- |
| 설치 이름 | `pixel-pals` |
| 종류 | 한국 수정판 |
| 만든 사람 | hoobnn · plaxagoras |
| 라이선스 | MIT |
| 원본 | [hoobnn/hoobnn-agent-mods/claude-code/spinner @ `8fb6f67`](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/pals` `/tales` |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install pixel-pals@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install pixel-pals@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 함께 쓸 때

- **clawd-tales** (`clawd-tales`): pixel-pals에 clawd-tales가 tales 테마로 들어 있어요. 같이 설치하면 Clawd 이야기 띠가 두 번 그려질 수 있어요
- **clawd-spinner** (`clawd-spinner`): 둘 다 입력창 위에 Clawd 장면을 그려요. 같이 켜면 띠가 겹쳐 보여요

## 알아 둘 점

- 원본 두 개를 합쳤어요: 장면·펫은 hoobnn의 spinner(hoobnn/hoobnn-agent-mods @ 8fb6f67), tales 테마는 plaxagoras의 clawd-tales(@ 89c7f95). 둘 다 MIT이고 원본 저작권 표기를 LICENSE·LICENSE-clawd-tales·NOTICE에 그대로 뒀어요.
- 원본 spinner의 15종 중 nyan·clawd·thunder·chomp·sparky·bluecat 6종만 남기고, clawd-tales를 7번째 테마 tales로 더했어요. random은 7종 중 턴마다 골라요. 시스템 소리를 읽던 audio 테마는 빼서 프로그램 실행(swiftc) 권한이 없어요.
- 기본값이 한국어예요. /pals·/tales 응답과 피날레, Clawd 이야기의 캡션까지 한국어로 나와요(Clawd 이야기는 한국어·영어만).
- 명령은 /pals(테마·펫·끄기)와 /tales(Clawd 이야기의 데모·모자·calm 모드) 두 개예요. tales 미리 보기는 /tales demo로 해요.
- nyan·chomp·sparky·bluecat은 원작자가 '픽셀 오마주'라고 부른 장면이고, Clawd는 Anthropic 마스코트예요. 비공식 팬 작품이에요.
- 터미널에서만 장면이 보여요. 데스크톱 앱에서는 tales 테마일 때만 띠가 그려져요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.296
- 결과: 통과
- 다루는 이벤트: `agent.spawn`, `classic.PermissionRequest`, `classic.SessionStart`, `classic.UserPromptSubmit`, `command.run{command=pals}`, `command.run{command=tales}`, `prompt.edit`, `prompt.submit`, `session.compact`, `session.measure`, `session.start`, `tool.call`, `tool.check`, `turn.complete`, `turn.start`, `ui.message`, `ui.render{component=AbovePrompt}`, `ui.render{component=SessionMode}`, `ui.render{component=Spinner}`
- 부르는 API: `$.agent.list`, `$.clock.after`, `$.clock.every`, `$.clock.now`, `$.command.register`, `$.config.set`, `$.env.get`, `$.session.root`, `$.session.usage`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.store.set`, `$.ui.ask`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `LANG`, `LC_ALL`, `LC_MESSAGES`

</details>

## 검토 기록

- 2026-10-11 · k-mods · Claude Code 2.1.296 · 정적 검사, 코드 읽기, 테스트

<details><summary>검토 노트 3개 (코드를 읽으며 확인한 것)</summary>

- 장면 쪽은 spinner 한국 수정판(이전 k-mods 항목)의 코드를 그대로 이어받고, audio 탭(swiftc 컴파일·프로세스 실행)과 hud 연동(hud.dock 읽기, hud.petPats 훅)을 뺐다. 네트워크 호출 없음.
- tales 쪽은 clawd-tales 89c7f95의 hooks를 옮겨 상태 이름만 pixel-pals로 바꾸고 화면 문구를 tr(영어, 한국어)로 감쌌다. 이야기 로직·그림은 원본 그대로이며 네트워크·모델 호출 없음($.agent.list 폴링, $.session.usage 읽기만).
- 입력창 위 띠(AbovePrompt)는 테마가 tales이고 숨김·띠 끄기·미리 보기가 아닐 때만 clawd-tales가, 그 밖에는 장면 쪽이 그린다. 두 쪽이 한 번에 그리지 않는다.

</details>

## 더 보기

- [mod 설명서](../../mods/pixel-pals/README.md)
- [원본 저장소](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
