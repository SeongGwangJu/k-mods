# 작업 끝 알림

긴 작업을 Claude에게 맡기고 자리를 비워도, 끝나거나 확인이 필요할 때 데스크톱·음성·휴대폰 푸시로 알려줘요.

## 설치

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install done-alarm@k-mods
```

## 쓰는 법

설치하면 바로 동작해요. 따로 명령어를 외울 필요 없이, 기본값(데스크톱 알림 켜짐)만으로:

- Claude가 응답을 끝내면(30초 이상 걸린 작업만) macOS·Linux 알림센터에 뜹니다.
- Claude가 권한을 묻거나, 질문을 하거나(`AskUserQuestion`), 한참 가만히 있으면 "확인이 필요해요" 알림이 뜹니다.

상태가 궁금하거나 채널을 바로 확인하고 싶을 때만 `/alarm`을 씁니다.

- `/alarm`. 어떤 채널이 켜져 있는지, 기준 시간, 음소거 여부를 보여줘요
- `/alarm test`. 켜진 채널마다 테스트 알림을 보내고 채널별로 ✓/✗ 결과를 보여줘요
- `/alarm off` / `/alarm on`. 이번 세션에서만 알림을 끄고 켭니다 (세션을 새로 시작하면 다시 켜져요)

음소거 중에는 입력창 위 힌트 줄 끝에 `· 알림 꺼짐`이 조그맣게 표시됩니다.

## 설정 (`/config` 또는 `/plugin configure done-alarm@k-mods`)

| 항목 | 기본값 | 설명 |
| :- | :- | :- |
| 최소 작업 시간(초) | 30 | 이보다 짧게 끝난 작업은 알리지 않아요 |
| 데스크톱 알림 | 켜짐 | macOS는 알림센터, Linux는 `notify-send` |
| 음성 알림 | 꺼짐 | 짧은 한국어 문장을 소리 내어 읽어요 |
| ntfy 주제(topic) | (없음) | 휴대폰 무료 푸시. 아래 "ntfy로 휴대폰 받기" 참고 |
| ntfy 서버 | `https://ntfy.sh` | 직접 운영하는 서버가 있으면 바꾸세요 |
| Telegram 봇 토큰 / 채팅 ID | (없음) | 아래 "Telegram으로 받기" 참고 |
| Webhook 주소 | (없음) | Slack·Discord Incoming Webhook. 아래 참고 |
| 답변 요약 포함 | 꺼짐 | 외부로 나가는 알림에 Claude 답변 첫 줄을 함께 보내요. 데스크톱 알림에는 항상 포함됩니다 |

토큰·주소 같은 민감한 값은 `/config` 화면과 `/alarm` 상태에 절대 원문으로 보이지 않고 `●●●`로만 표시됩니다.

### ntfy로 휴대폰 받기

1. 휴대폰에 [ntfy 앱](https://ntfy.sh/)을 설치하세요 (iOS/Android 무료).
2. 앱에서 아무 주제(topic) 이름이나 하나 구독하세요. **주제는 그 이름을 아는 사람이면 누구나 구독할 수 있는 공개 값**이니, 추측하기 어려운 긴 이름을 쓰세요 (예: `jsg-done-alarm-7x9k2`).
3. `/plugin configure done-alarm@k-mods`에서 "ntfy 주제"에 같은 이름을 넣으세요.
4. `/alarm test`로 휴대폰에 알림이 오는지 확인하세요.

### Telegram으로 받기

1. Telegram에서 [@BotFather](https://t.me/BotFather)와 대화를 시작해 `/newbot`으로 봇을 만들고 토큰을 받으세요.
2. 만든 봇과 먼저 대화를 한 번 시작하세요(아무 메시지나 보내면 됩니다).
3. 내 채팅 ID를 알아내려면 [@userinfobot](https://t.me/userinfobot) 같은 봇에게 말을 걸거나, `https://api.telegram.org/bot<토큰>/getUpdates`를 열어 `chat.id` 값을 확인하세요.
4. `/plugin configure done-alarm@k-mods`에서 봇 토큰과 채팅 ID를 넣으세요.

### Slack / Discord webhook

- **Slack**: 워크스페이스 설정에서 Incoming Webhook 앱을 추가하고 채널을 고르면 `https://hooks.slack.com/services/...` 형태의 주소를 받습니다.
- **Discord**: 채널 설정 → 연동 → 웹후크에서 새 웹후크를 만들면 `https://discord.com/api/webhooks/...` 주소를 받습니다.
- 둘 중 어떤 주소인지는 자동으로 구분해서, Slack은 `{text}`로, Discord는 `{content}`로 보냅니다.

## 어떻게 동작하나요

Claude Code의 이벤트 두 가지를 지켜봐요.

- **턴이 끝날 때**(`turn.complete`): 메인 대화에서, 중단되지 않고, 설정한 시간 이상 걸렸을 때만 "작업 끝" 알림을 보냅니다. 서브에이전트(하위 작업자)의 턴은 세지 않아요.
- **Claude가 확인을 기다릴 때**: 두 가지 신호를 함께 봅니다.
  - 설정 파일 기반 훅인 `Notification`의 거울상인 `classic.Notification`. Claude가 권한을 묻거나 한참 가만히 있을 때 Claude Code 자체가 보내는 신호예요.
  - `AskUserQuestion` 도구 호출(`tool.call`). Claude가 선택지를 묻는 질문을 띄우려 할 때예요. 이 mod는 지켜보기만 하고 질문을 막지 않아요.
  - 같은 60초 안에 두 신호가 겹치면 한 번만 알립니다.

알림을 보내는 동안 세션이 멈추지 않도록, 알림 전송은 기다리지 않고 바로 흘려보냅니다(실패해도 세션에는 영향이 없어요).

## 권한 (이 mod가 내 컴퓨터에서 하는 일)

- **실행하는 프로그램**: macOS에서 `osascript`(데스크톱 알림), Linux에서 `notify-send`, 처음 한 번 `uname`(OS 확인). 셸을 거치지 않고 프로그램만 직접 실행해요.
- **음성**: Claude Code의 `$.audio.speak`로 시스템 음성 합성기를 씁니다(macOS는 `say`와 같은 것).
- **네트워크**: 사용자가 직접 설정한 채널에만 나갑니다. ntfy 서버, `api.telegram.org`, 그리고 설정한 Webhook 주소. 설정하지 않은 채널은 아무 데도 연결하지 않아요. 그 외의 텔레메트리·분석 전송은 없습니다.

## 한계

- "확인이 필요해요" 알림의 사유 문구는 Claude Code가 주는 원문(`classic.Notification`의 메시지, 또는 질문 내용)을 그대로 씁니다. 영어로 올 수도 있어요.
- ntfy·Telegram·Webhook은 네트워크가 실제로 닿아야 보내집니다. 회사 방화벽 등으로 막혀 있으면 실패로 보고돼요(`/alarm test`, `/alarm` 상태에서 확인 가능).
- 세션을 여러 개 동시에 열어 두면 세션마다 따로 알립니다 (세션 사이에 공유되는 상태가 없어요).
- `/alarm off`는 "이번 세션"에만 적용돼요. 다음 세션을 새로 시작하면 다시 켜진 상태로 돌아갑니다.

## 출처·라이선스

이 저장소를 위해 새로 작성한 mod입니다 (다른 프로젝트를 고친 수정판이 아니에요). 저장소 전체의 라이선스(MIT)를 따릅니다.

테스트한 Claude Code 버전: 2.1.291
