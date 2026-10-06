# Skins

Claude Code 화면을 테마로 꾸며줘요. 도구 줄에 레일을 긋고, 표에 테두리를 두르고, 스피너와 턴 종료 줄에 스킨마다 다른 단어와 색을 입혀요.

(스크린샷 대신: 설치 뒤 `/skin gallery`를 열면 지금 스킨이 그리는 요소를 전부 한 번에 볼 수 있어요)

## 설치

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install skins@k-mods
```

## 쓰는 법

- `/skin`. 스킨 설정 패널을 열어요. 목록에서 고르거나 색을 직접 칠할 수 있어요.
- `/skin <이름>`. 바로 그 스킨으로 바꿔요 (`nord`, `dracula`, `gruvbox`, `catppuccin`, `tokyo-night`, `noir`, `mono`).
- `/skin off` 또는 `/skin default`. Claude Code 기본 화면으로 돌아가요.
- `/skin list`. 쓸 수 있는 스킨과 현재 켜진 옵션을 보여줘요.
- `/skin rail|tables|shimmer|band|clip on|off`. 부분 기능만 켜고 꺼요 (아래 설정 참고).
- `/skin gallery`. 지금 스킨이 그리는 요소를 전부 번호 붙여 보여줘요.
- `/skin icons unicode|ascii`. 글꼴에 유니코드 기호가 없으면 `ascii`로 바꿔요.
- Claude에게 "분위기에 맞는 스킨 만들어줘" 같은 말로 직접 스킨을 설계하게 할 수도 있어요 (내장 스킬 사용).

## 설정 (`/config` 또는 `/plugin configure skins@k-mods`)

| 설정 | 기본값 | 설명 |
|---|---|---|
| `status_lines` | `auto` | 스피너(작업 중 줄)와 턴 종료 줄을 누가 그릴지. `auto`는 k-mods의 `status-ko`가 켜져 있으면 그쪽에 맡기고, 아니면 이 mod가 그려요. `skins`는 항상 이 mod가, `engine`은 항상 Claude Code 기본(또는 다른 mod)이 그리게 해요. |

`/skin` 명령으로 바꾸는 나머지 설정(스킨 선택, 레일, 표, 반짝임, 상단 띠, 출력 자르기)은 세션 안에
저장되는 값이라 `/config`가 아니라 `/skin` 또는 설정 패널에서 바꿔요.

## 어떻게 동작하나요

Claude Code가 화면 각 부분(도구 줄, 표, 스피너, 턴 종료 줄, 내 메시지 등)을 그릴 때마다 이
mod에 먼저 물어봐요. 이 mod는 고른 스킨의 색과 단어로 그 부분을 대신 그려서 돌려주고, 끄면
원래 Claude Code가 그리던 그대로 돌아가요. 네트워크도, 모델 호출도 쓰지 않고, 화면만 바꿔요.

## 권한 (이 mod가 내 컴퓨터에서 하는 일)

- 화면에 그릴 내용만 만들어요. 파일을 읽거나 쓰지 않고, 외부로 아무것도 보내지 않아요.
- 고른 스킨과 설정은 이 플러그인의 저장 공간(`$.store`)에만 남아요.

## 한계

- 좁은 터미널(약 60칸 이하)에서는 표·카드가 더 심하게 줄어들어요. 그래도 한 줄이 넘치진 않아요.
- `/skin gallery`는 아직 새 터미널 셸 출력 카드를 미리 보여주지 않아요(기존 갤러리 구성을 그대로
  뒀어요). 실제 Bash 명령을 실행하면 바로 보여요.
- `status_lines`는 `$.settings.read()`로 매 세션 시작 때 한 번만 `status-ko` 설치 여부를
  확인해요. 세션 도중에 `status-ko`를 새로 설치·활성화하면 다음 세션부터 반영돼요.

## 출처·라이선스

[hellosverre/claude-skins](https://github.com/hellosverre/claude-skins) (MIT, 커밋
`2ee5b6a3e7e765a2aa107631a9d07105753e8bd5`)의 k-mods 수정판입니다. 원작자 hellosverre에게
감사드립니다. 무엇을 고쳤는지는 [CHANGES-KO.md](./CHANGES-KO.md)에 전부 적어 뒀어요. 원본
라이선스 전문은 [LICENSE](./LICENSE)에 그대로 있어요.

테스트한 Claude Code 버전: 2.1.291
