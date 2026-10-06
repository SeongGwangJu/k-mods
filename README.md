# k-mods

[![Claude Code 2.1.287+](https://img.shields.io/badge/Claude%20Code-2.1.287%2B-d97757)](https://code.claude.com/docs/en/plugins/mods/overview)
[![CI](https://github.com/SeongGwangJu/k-mods/actions/workflows/ci.yml/badge.svg)](https://github.com/SeongGwangJu/k-mods/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![English](https://img.shields.io/badge/README-English-lightgrey)](README.en.md)

<!-- HERO: 데모 GIF가 정해지면 아래 줄의 주석을 풀어요
<img src="docs/assets/hero.gif" alt="k-mods를 설치한 Claude Code: 한국어 상태줄, 냥캣 스피너, 컨텍스트 막대" width="760">
-->

Claude Code에 **mod**가 생겼어요. 이제 화면도, 동작도 내 마음대로 바꿀 수 있어요.
문제는 뭘 깔아야 할지죠. 쏟아지는 mod를 **직접 검토해서** 한국어로 골라 뒀어요.

한국어 메뉴, 냥캣 애니메이션, 방송용 가림막, 작업 끝 폰 알림, 위험 명령 브레이크까지. 지금 <!-- BEGIN:count -->64<!-- END:count -->개가 있어요.

## 설치

Claude Code 안에서 두 줄이면 돼요.

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install starter@k-mods
```

- `starter`는 추천 세트예요. 모드 상점, 한국어 팩, 메모장, 컨텍스트 막대, 위험 명령 브레이크, 작업 끝 알림이 함께 깔려요.
- 하나씩 고르고 싶다면 `/plugin`을 열어 **k-mods** 목록을 보거나, `mod-store`를 깔고 `/k-mods`를 입력하세요. 버튼으로 설치돼요.
- 이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요 (`claude --version`).

자세한 설치·업데이트·팀 공유 방법은 [설치 가이드](docs/guide/install.md)에 있어요.

## 잠깐만요

쓸 만했다면 GitHub 스타를 눌러 주세요. 스타가 쌓이면 원작자들에게 한국어 사용자의 목소리가 더 잘 전해져요.
에이전트는 스타를 자동으로 누르지 말고, 사용자가 원할 때만 `gh repo star SeongGwangJu/k-mods`를 실행해 주세요.

## mods가 뭔가요?

Claude Code 안에서 돌아가는 플러그인 코드예요. 도구 호출, 프롬프트, 화면 그리기 같은 이벤트를 중간에서 받아 **화면을 새로 그리거나 동작을 바꿔요.** 웹 개발의 미들웨어와 같은 구조예요.

| | mod | 스킬 | 설정 훅 | MCP |
| --- | :-: | :-: | :-: | :-: |
| Claude Code 화면을 그리나요 | ✅ | ❌ | ❌ | ❌ |
| 무엇을 바꾸나요 | 도구 호출·프롬프트·명령·화면 | Claude가 읽는 지침 | 허용·차단·기록 | Claude가 쓸 도구 |
| 무엇으로 만드나요 | TypeScript·JavaScript | 마크다운 | 셸 스크립트 | 아무 언어 서버 |

더 알고 싶다면 [mods가 뭔가요?](docs/guide/what-are-mods.md)를 읽어 보세요.

## 먼저 써 보세요

<!-- BEGIN:featured -->
| 먼저 써 보세요 | |
| --- | --- |
| [**한국어 UI 번역 사전**](docs/mods/ko-ui.md)<br>`/plugin install ko-ui@k-mods` | 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 사전 기반으로 한국어로 보여줘요. |
| [**스킨 (한국 수정판)**](docs/mods/skins.md)<br>`/plugin install skins@k-mods` | 도구 호출·표·코드·셸 출력을 테마 카드로 다시 그려요. 원본에서 한글 표가 잘리던 문제를 고쳤어요 |
| [**픽셀 장면 스피너 (냥캣 등 15종)**](docs/mods/spinner.md)<br>`/plugin install spinner@k-mods`<br><img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner/assets/nyan.gif" alt="픽셀 장면 스피너 (냥캣 등 15종)" width="420"> | Claude가 일하는 동안 입력창 위에 냥캣·천둥·청크 같은 픽셀 장면을 띄우고, 턴마다 자라는 펫도 키워요 |
| [**작업 상태 한국어**](docs/mods/status-ko.md)<br>`/plugin install status-ko@k-mods` | 작업 중 줄을 '읽는 중 · page.tsx'처럼 지금 하는 일로, 끝난 줄을 모델·시간·도구·캐시 한 줄로 보여줘요 |
| [**모드 상점**](docs/mods/mod-store.md)<br>`/plugin install mod-store@k-mods` | /k-mods 한 번이면 카탈로그를 둘러보고 버튼으로 설치·제거해요 |
| [**스트리머 모드**](docs/mods/streamer-mode.md)<br>`/plugin install streamer-mode@k-mods` | 화면 공유·녹화할 때 토큰·이메일·전화번호·주민번호를 화면에서 가려요. Claude가 읽는 내용은 그대로예요 |
| [**한국어 팩**](docs/mods/korean-pack.md)<br>`/plugin install korean-pack@k-mods` | 메뉴·설정 번역(ko-ui)과 작업 상태 한국어(status-ko)를 한 번에 설치해 Claude Code 화면을 한국어로 바꿔요 |
<!-- END:featured -->

## mod 목록

<!-- BEGIN:catalog -->
### 🇰🇷 한국어화

메뉴·설정·안내 문구를 한국어로 바꿔요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**한국어 UI 번역 사전**](docs/mods/ko-ui.md) ⭐<br>`ko-ui` | 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 사전 기반으로 한국어로 보여줘요. | [moduvoice](https://github.com/moduvoice) | 👀📂 |

### 🎨 테마

대화·도구 줄·표·코드의 모양을 새로 그려요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**스킨 (한국 수정판)**](docs/mods/skins.md) ⭐<br>`skins` | 도구 호출·표·코드·셸 출력을 테마 카드로 다시 그려요. 원본에서 한글 표가 잘리던 문제를 고쳤어요 | 🔧 [hellosverre](https://github.com/hellosverre) 원작 · 한국 수정판 | 🛡️👀🔑 |
| [**GFM 렌더러**](docs/mods/gfm-render.md)<br>`gfm-render` | 트랜스크립트에서 GFM 경고문·체크리스트·취소선·Mermaid 다이어그램을 그려줘요. | [briangtn](https://github.com/briangtn) | ⚙️👀 |
| [**프리즈만티스**](docs/mods/prismantis.md)<br>`prismantis` | 표·코드·다이어그램·도구 줄을 15가지 테마로 색입혀 보여주고, 복사 버튼도 달아줘요. | [Nahum Litvin](https://github.com/NahumLitvin) | 👀🔑 |

### 🐾 애니메이션

기다리는 동안 캐릭터·장면·게임이 움직여요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**픽셀 장면 스피너 (냥캣 등 15종)**](docs/mods/spinner.md) ⭐<br>`spinner` | Claude가 일하는 동안 입력창 위에 냥캣·천둥·청크 같은 픽셀 장면을 띄우고, 턴마다 자라는 펫도 키워요 | [hoobnn](https://github.com/hoobnn) | ⚙️🛡️👀🔑📂 |
| [**CC 아케이드**](docs/mods/cc-arcade.md)<br>`cc-arcade` | 입력창 위에서 스네이크·테트리스·2048·지뢰찾기 등 9가지 미니게임을 즐기고, Claude가 일하는 동안 자라는 펫도 키울 수 있어요. | [Seza Akgün](https://github.com/sezaakgun) | 🛡️👀 |
| [**Clawd 스피너**](docs/mods/clawd-spinner.md)<br>`clawd-spinner` | 189가지 스피너 단어마다 Clawd가 요리하거나 춤추거나 서성거리는 등 다른 몸짓을 연기해요. | [Sai Rudra](https://github.com/saiharsha03) | 👀 |
| [**Clawd 이야기**](docs/mods/clawd-tales.md)<br>`clawd-tales` | 입력창 위에서 픽셀 Clawd가 Claude의 모든 도구 호출을 몸짓으로 연기하고, 서브에이전트마다 작은 동료도 등장해요. | [plaxagoras](https://github.com/plaxagoras) | 🛡️👀 |
| [**콤보 미터**](docs/mods/combo-meter.md)<br>`combo-meter` | 도구 호출이 성공하면 콤보가 이어지고 실패하면 끊기는 격투 게임 스타일 콤보 미터예요. D부터 SSS까지 랭크가 올라가요. | [Sarthak Bhatore](https://github.com/sarthak2511) | 🛡️👀🔊 |
| [**디프 인베이더**](docs/mods/diff-invaders.md)<br>`diff-invaders` | Claude가 방금 쓴 diff 줄이 그대로 외계인 편대가 되는 스페이스 인베이더예요. 토큰 소모 없이 입력창 위에서 플레이해요 | [claude-code-templates](https://www.aitmpl.com) | 🛡️👀 |
| [**릴스**](docs/mods/reels.md)<br>`reels` | Claude가 작업하는 동안 YouTube Shorts를 터미널 패널에 재생하고, Claude가 끝나면 자동으로 멈춰요. /reels를 쳐야만 켜져요. | [Hamza Zafar](https://github.com/hamzafer) | 🌐⚙️👀🔑📂 |
| [**툴 디펜스**](docs/mods/tool-defense.md)<br>`tool-defense` | Claude의 실제 도구 호출(Bash·Edit·웹·Agent)이 그대로 적 유닛이 되는 타워 디펜스예요. 토큰 소모 없이 입력창 위에서 플레이해요 | [claude-code-templates](https://www.aitmpl.com) | 🛡️👀 |

### 📊 상태줄

컨텍스트·사용량·작업 상태를 늘 보이게 해요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**작업 상태 한국어**](docs/mods/status-ko.md) ⭐<br>`status-ko` | 작업 중 줄을 '읽는 중 · page.tsx'처럼 지금 하는 일로, 끝난 줄을 모델·시간·도구·캐시 한 줄로 보여줘요 | 🇰🇷 k-mods | 🛡️👀 |
| [**컨텍스트 막대**](docs/mods/ctx-strip.md)<br>`ctx-strip` | 컨텍스트가 무엇으로 차 있는지(대화·도구·스킬…) 입력창 위 막대로 보여주고, 서브에이전트가 돌면 한 줄로 알려줘요 | 🇰🇷 k-mods | ⚙️✏️🛡️👀🔑 |
| [**에이전트 레이더**](docs/mods/agent-radar.md)<br>`agent-radar` | 실행 중인 서브에이전트마다 입력창 위에 경과 시간·도구 호출 수·현재 작업을 한 줄로 보여주고, /radar로 전체 목록과 대화 내용을 확인해요. | [Hamza Zafar](https://github.com/hamzafer) | 🛡️👀 |
| [**브라우저 레인**](docs/mods/browser-lanes.md)<br>`browser-lanes` | 이 세션이 Playwright 브라우저를 갖고 있는지, 누가 쓰고 있는지 입력창 위에 보여주고, 서브에이전트끼리는 순서를 기다리게 해요. | [Hamza Zafar](https://github.com/hamzafer) | ⚙️🛡️👀 |
| [**캐시 패널**](docs/mods/cache-panel.md)<br>`cache-panel` | 프롬프트 캐시가 식기 50분 전에 알려주고, 계속 데우기·한 번 핑·압축 중 하나를 비용 추정과 함께 고를 수 있어요. | [Dustin Yuchen Teng](https://github.com/danyuchn) | ⚙️🤖🔑 |
| [**컨텍스트 바 (hamzafer)**](docs/mods/context-bar.md)<br>`context-bar` | 컨텍스트 창을 /context와 같은 색으로 구간별 막대 그래프로 보여주고, 토큰 수·압축 시점·범례까지 입력창 위에 표시해요. | [Hamza Zafar](https://github.com/hamzafer) | 👀 |
| [**플라이트덱 대시보드**](docs/mods/flightdeck.md)<br>`flightdeck` | 메인 모델 상태·비용·컨텍스트, 온콜 아키텍트 상담, 권한 검사, 서브에이전트 카드를 실시간 세션 이벤트로 한 화면에 보여줘요 | [Stephen Casella](https://github.com/scasella) | 🛡️👀 |
| [**claude-hud 상태 대시보드**](docs/mods/hud.md)<br>`hud` | 모델·프로젝트·Git·컨텍스트·사용량·도구·할 일을 HUD 한 줄로 보여주고, 예산·이력·작업 요약·상세 패널·테마까지 지원해요. | [hoobnn](https://github.com/hoobnn) | ⚙️✏️🤖🛡️👀🔑📂🔊 |
| [**사용량 진행률 막대**](docs/mods/mod-usage.md)<br>`mod-usage` | 컨텍스트·5시간·7일 사용량을 입력창 위 그라데이션 막대 3개로 보여줘요. Desktop/VS Code 전용, 12개 언어를 지원하지만 한국어는 아직 없어요. | [Jack Chiang](https://github.com/jack21) | ⚙️🔑 |
| [**PR 펄스**](docs/mods/pr-pulse.md)<br>`pr-pulse` | GitHub PR의 머지 준비 상태·CI 체크·리뷰 코멘트·리뷰 대기열을 입력창 위 띠와 패널로 실시간으로 보여줘요 | [Gerric Chaplin](https://github.com/gerricchaplin) | ⚙️💬 |
| [**프롬프트 캐시 미터**](docs/mods/prompt-cache-control.md)<br>`prompt-cache-control` | 요청마다 캐시가 얼마나 읽히고 새로 쓰였는지 입력창 위에 보여주고, 만료 임박이면 알려주며 /compact·/clear 시점을 제안해요 | [claude-code-templates](https://www.aitmpl.com) | 🔑📂 |
| [**턴 영수증**](docs/mods/receipt.md)<br>`receipt` | 매 턴이 끝나면 바뀐 파일·실행한 명령·읽은 횟수를 입력창 위에 한 줄 영수증으로 보여주고, 제자리걸음을 하면 알려줘요. | [hoobnn](https://github.com/hoobnn) | 🛡️👀🔑 |
| [**리뷰 워치**](docs/mods/review-watch.md)<br>`review-watch` | 실행 중인 codex review나 '리뷰' 서브에이전트마다 모델·대상·경과 시간을 한 줄로 보여주고, 끝나면 발견 개수를 토스트로 알려줘요. | [Hamza Zafar](https://github.com/hamzafer) | ⚙️🛡️👀🔑 |
| [**상태 카드**](docs/mods/statuspane.md)<br>`statuspane` | 모델, 이펙트, 컨텍스트, 5시간·주간 한도, 비용, 브랜치를 프롬프트 위 카드 하나로 보여줘요. | [Anji Xu](https://github.com/xuanji86) | ⚙️🛡️👀🔑📂 |
| [**택시 미터기**](docs/mods/taxi-meter.md)<br>`taxi-meter` | 입력창 위 택시 미터기 패널로 세션 요금과 5시간·주간 한도를 보여줘요. /meter·/receipt로 자세히 볼 수 있어요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) | 👀🔊 |
| [**할 일 진행 상태줄**](docs/mods/todo-bar.md)<br>`todo-bar` | Claude가 만든 할 일 목록의 진행 상황을 입력창 위에 막대와 경과 시간으로 보여줘요. | [hoobnn](https://github.com/hoobnn) | 🛡️👀🔑 |
| [**토큰 날씨**](docs/mods/token-weather.md)<br>`token-weather` | 컨텍스트 창이 얼마나 찼는지 날씨 아이콘과 최근 턴 막대그래프로 입력창 위에 보여줘요. | [Claude Code DevRel](https://github.com/anthropics) | 👀 |
| [**테일스케일 노드 상태줄**](docs/mods/ts-band.md)<br>`ts-band` | 입력창 위에 Tailscale 노드들의 연결 상태를 보여주고, 노드가 끊기거나 다시 연결되면 토스트로 알려줘요. | [hoobnn](https://github.com/hoobnn) | ⚙️🛡️👀🔑 |
| [**사용량 밴드 (5시간·주간)**](docs/mods/usage-band-pawandeep.md)<br>`usage-band-pawandeep` | 입력창 위에 5시간·주간 사용량 퍼센트와 초기화 카운트다운을 항상 보여주고, 새 채팅·GitHub 푸시 버튼도 함께 제공해요. | Pawandeep | ⚙️💬 |

### 🧰 도구

패널·명령으로 직접 쓰는 기능이에요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**모드 상점**](docs/mods/mod-store.md) ⭐<br>`mod-store` | /k-mods 한 번이면 카탈로그를 둘러보고 버튼으로 설치·제거해요 | 🇰🇷 k-mods | ⚙️🔑 |
| [**메모장**](docs/mods/memo-pad.md)<br>`memo-pad` | Claude가 일하는 동안 다음에 시킬 일을 적어 두고, 버튼 한 번으로 입력창에 넣어요 | 🇰🇷 k-mods | 💬 |
| [**에이전트 플로우**](docs/mods/agent-flow.md)<br>`agent-flow` | 메인 루프와 서브에이전트들을 나무 구조로 보여주고, 각 에이전트에 오간 컨텍스트 양과 답변을 클릭해서 볼 수 있어요 | [claude-code-templates](https://www.aitmpl.com) | 🛡️👀 |
| [**퀵 메뉴**](docs/mods/agent-quick-menu.md)<br>`agent-quick-menu` | 설치된 플러그인들의 명령과 설정을 한 패널에 모아서 찾고 바로 실행하게 해줘요. | [dasganni](https://github.com/dasganni) | 🔑📂 |
| [**이미지 미리보기**](docs/mods/image-view.md)<br>`image-view` | 붙여넣은 이미지를 입력창 위에 썸네일로 보여줘요. [Image #1] 같은 표시 대신이에요. | [gggodlin](https://github.com/GGGODLIN) | ⚙️👀🔑📂 |
| [**나우 플레잉**](docs/mods/now-playing.md)<br>`now-playing` | macOS에서 Spotify로 재생 중인 곡과 가사를 입력창 위에 보여주고, 버튼이나 /music으로 재생·일시정지·이전·다음을 조작해요. | [Hamza Zafar](https://github.com/hamzafer) | 🌐⚙️ |
| [**붙여넣기 미리보기**](docs/mods/paste-view.md)<br>`paste-view` | 붙여넣은 이미지와 긴 텍스트를 입력창 위에서 바로 미리 보여줘요. | [Clément Décou](https://github.com/Amorfx) | ⚙️🔑📂 |
| [**픽셀 뮤직 플레이어**](docs/mods/pixel-player.md)<br>`pixel-player` | mpv로 재생목록을 재생하면서 픽셀 아트 캐릭터가 음악에 맞춰 반응하는 패널을 보여줘요. | [chrisluo5311](https://github.com/chrisluo5311) | ⚙️✏️🔑📂 |
| [**프롬프트 레일**](docs/mods/prompt-rail.md)<br>`prompt-rail` | 세션에서 보낸 프롬프트들을 레일 하나로 모아 보여주고, 마우스를 올리면 읽고 클릭하면 그 지점으로 이동해요. | [oikon48](https://github.com/oikon48) | ⚙️👀📂 |
| [**Replay 극장**](docs/mods/replay-theater.md)<br>`replay-theater` | 이번 턴에서 Claude가 고친 파일들을 한 스텝씩 diff로 넘겨보며 다시 볼 수 있어요. | [Claude Code DevRel](https://github.com/anthropics) | 🛡️👀📂 |
| [**세션 랩드**](docs/mods/session-wrapped.md)<br>`session-wrapped` | `/wrapped`로 이번 세션의 도구 호출·테스트·비용 통계를 애니메이션으로 보여주고, 공유용 PNG 카드를 데스크톱에 저장해요. | [OneWave AI](https://www.onewave-ai.com) | ⚙️🛡️👀🔑 |
| [**택시 블랙박스**](docs/mods/taxi-blackbox.md)<br>`taxi-blackbox` | 도구 호출을 블랙박스처럼 녹화해서, 오류나 거부 직전 상황을 /blackbox에서 돌려볼 수 있어요. 토큰·비밀번호는 가려서 기록해요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) | 🛡️👀 |
| [**택시 내비게이션**](docs/mods/taxi-navi.md)<br>`taxi-navi` | 할 일 목록을 내비게이션처럼 보여줘요. 진행 경로와 다음 안내가 표시되고, 계획이 바뀌면 경로를 다시 찾아줘요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) | 🛡️🔑🔊 |

### ⚡ 자동화

알아서 알리고, 넘기고, 채워 줘요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**작업 끝 알림**](docs/mods/done-alarm.md)<br>`done-alarm` | 오래 걸린 작업이 끝나거나 확인이 필요하면 맥 알림·한국어 음성·폰 푸시(ntfy·텔레그램·슬랙)로 알려줘요 | 🇰🇷 k-mods | 🌐⚙️🛡️👀🔊 |
| [**컴팩트 타이밍 어드바이저**](docs/mods/agent-compact-advisor.md)<br>`agent-compact-advisor` | 지금이 /compact 하기 좋은 때인지 0~100점으로 상태줄에 보여주고, 압축할 때마다 목표·결정·남은 일을 지키는 보존 템플릿을 자동으로 넣어줘요. | [apolenkov](https://github.com/apolenkov) | 🌐⚙️🛡️👀 |
| [**오토 핸드오프**](docs/mods/auto-handoff.md)<br>`auto-handoff` | 컨텍스트가 꽉 차기 전에 Haiku가 요약한 브리핑과 함께 새 대화로 넘겨주고, 필요하면 브리핑 페이지를 따로 열어볼 수 있어요. | [Alex Hillman](https://github.com/alexknowshtml) | ⚙️✏️🤖🛡️💬👀🔑📂 |
| [**컨텍스트 핸드오프**](docs/mods/ctx-handoff.md)<br>`ctx-handoff` | 컨텍스트가 한계에 가까워지면 핸드오프를 만들어 새 대화로 넘겨주고, 자리를 비운 사이엔 프롬프트 캐시를 데워둬요. | [cablate](https://github.com/cablate) | ✏️🤖💬👀🔑📂 |
| [**스킬 자동 추천**](docs/mods/jev-skill-suggestion.md)<br>`jev-skill-suggestion` | 프롬프트마다 맞는 스킬 하나를 판단해 자동으로 불러오고 목록은 컨텍스트에서 빼요. API 키가 있으면 TypeSafe Jev로, 없으면 Claude 분류기로 판단해요 | [claude-code-templates](https://www.aitmpl.com) | 🌐🤖👀🔑📂 |
| [**다음 할 일 제안**](docs/mods/next-steps.md)<br>`next-steps` | 턴이 끝날 때마다 다음에 보낼 법한 프롬프트 2~3개를 입력창 위에 제안하고, 숫자 키 하나로 바로 초안에 채워 넣어요. | [Hamza Zafar](https://github.com/hamzafer) | 🤖👀 |
| [**스위치보드**](docs/mods/switchboard.md)<br>`switchboard` | 서브에이전트가 시작되기 전에 Haiku/Sonnet/Opus 중 가장 싼 모델을 골라주고, /route로 각 선택과 예상 비용을 보여줘요. API 키 없이도 규칙만으로 동작해요. | [Hamza Zafar](https://github.com/hamzafer) | 🌐👀🔑 |
| [**현재 상황 요약**](docs/mods/where-am-i.md)<br>`where-am-i` | 목표·지금 하는 일·내게 기다리는 것·다음 할 일을 입력창 위에 한눈에 보여주고, /where로 더 긴 요약도 볼 수 있어요. | [Hamza Zafar](https://github.com/hamzafer) | 🤖🛡️👀 |

### 🛡️ 지킴이

위험한 명령과 민감한 정보를 지켜요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**스트리머 모드**](docs/mods/streamer-mode.md) ⭐<br>`streamer-mode` | 화면 공유·녹화할 때 토큰·이메일·전화번호·주민번호를 화면에서 가려요. Claude가 읽는 내용은 그대로예요 | 🇰🇷 k-mods | 👀 |
| [**위험 명령 브레이크**](docs/mods/blast-radius-ko.md)<br>`blast-radius-ko` | rm -rf·force push·DB 초기화처럼 되돌릴 수 없는 명령을 실행 전에 멈추고, 무엇이 바뀌는지 보여준 뒤 물어봐요 | 🔧 [Anthropic](https://github.com/anthropics) 원작 · 한국 수정판 | ⚙️🛡️ |
| [**시크릿 리댁터**](docs/mods/secret-redactor.md)<br>`secret-redactor` | 도구 결과에 섞인 API 키·토큰·JWT·개인키·DB 접속 문자열을 모델이 읽기 전에 지우고, 지워진 자리표시를 다시 명령에 쓰면 막아요 | [claude-code-templates](https://www.aitmpl.com) | 🛡️ |
| [**시크릿 볼트**](docs/mods/secret-vault.md)<br>`secret-vault` | 사용자가 붙여넣거나 도구가 읽어온 API 키·이메일·IP 주소를 모델에게 보내기 전 자리표시로 가리고, 도구 실행 직전엔 원래 값으로 되돌려줘요. | [Ray Amjad](https://github.com/ray-amjad) | 🛡️👀 |
| [**택시 과속카메라**](docs/mods/taxi-speedcam.md)<br>`taxi-speedcam` | force push·rm -rf·DB 삭제·변경 폐기·운영 배포처럼 위험한 Bash 명령 앞에서 찰칵 찍고 물어봐요. 실행할지 세울지는 사용자가 정해요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) | 🛡️🔊 |

### 🔗 연동

GitHub·Linear 같은 외부 서비스와 이어요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**GitHub PR 트래커**](docs/mods/cc-pr-tracker.md)<br>`cc-pr-tracker` | 머지 상태·리뷰·필수 체크를 입력창 위에서 실시간으로 지켜보고, 바뀌면 토스트·소리로 알려줘요. | [Seza Akgün](https://github.com/sezaakgun) | ⚙️🛡️👀🔑📂 |
| [**GitHub 이슈 패널**](docs/mods/github-issues.md)<br>`github-issues` | 저장소의 GitHub 이슈를 카드로 보여주고 버튼 한 번으로 Claude에게 작업을 맡길 수 있어요. | [Marco Carnevali](https://github.com/MarcoCarnevali) | ⚙️💬👀 |
| [**글랜스**](docs/mods/glance.md)<br>`glance` | 다음 회의·리뷰 요청된 PR·진행 중인 Linear 이슈·최근 Slack DM을 입력창 위 한 줄로 보여주고, /glance로 전체 목록을 확인해요. | [Hamza Zafar](https://github.com/hamzafer) | 🌐⚙️ |
| [**Linear 보드 패널**](docs/mods/linear-board.md)<br>`linear-board` | Linear 프로젝트·마일스톤·이슈를 패널로 보여주고, 계획·실행·제품 버튼으로 바로 프롬프트를 채워 넣어요. | [linear-mod contributors](https://github.com/SaharCarmel/linear-mod) | 🌐⚙️💬👀🔑 |
| [**Linear 티켓 패널**](docs/mods/linear-tickets.md)<br>`linear-tickets` | 내게 배정된 Linear 티켓을 패널로 보여주고, 클릭하면 바로 작업을 시작할 수 있어요. | [rjohnt](https://github.com/rjohnt) | 🌐⚙️💬 |
| [**터미널 브라우저**](docs/mods/terminal-browser.md)<br>`terminal-browser` | 클로드 코드 화면 안에 실제 브라우저를 띄워 웹사이트를 미리 보고, 에이전트가 직접 열고 닫게 해줘요. 브라우저 엔진은 별도 설치하는 terminal-browser 앱이 맡아요. | [zenbu-labs](https://github.com/zenbu-labs) | 🌐⚙️🛡️💬📂 |
| [**Vercel 배포 현황**](docs/mods/vercel-deploy-status.md)<br>`vercel-deploy-status` | 연결된 Vercel 프로젝트의 배포 대기열을 프롬프트 위 밴드에 큐잉·빌드·완료 단계별로 보여줘요. | [Ray Amjad](https://github.com/ray-amjad) | ⚙️🛡️📂 |

### 📦 묶음

여러 mod를 한 번에 설치해요

| mod | 무엇을 해 주나요 | 출처 | 권한 |
| --- | --- | --- | :-: |
| [**한국어 팩**](docs/mods/korean-pack.md) ⭐<br>`korean-pack` | 메뉴·설정 번역(ko-ui)과 작업 상태 한국어(status-ko)를 한 번에 설치해 Claude Code 화면을 한국어로 바꿔요 | 📦 묶음 | 🛡️👀📂 |
| [**추천 세트**](docs/mods/starter.md)<br>`starter` | 처음이라면 이것부터: 모드 상점, 한국어 팩, 메모장, 컨텍스트 막대, 위험 명령 브레이크, 작업 끝 알림 | 📦 묶음 | 🌐⚙️✏️🛡️💬👀🔑📂🔊 |
| [**택시팩**](docs/mods/taxi-pack.md)<br>`taxi-pack` | Claude Code를 택시로: 미터기(요금·한도), 내비(할 일 경로), 과속카메라(위험 명령 확인), 블랙박스(도구 호출 녹화)를 한 번에 설치해요 | 📦 묶음 | 🛡️👀🔑🔊 |

권한 표시: 🌐 네트워크 · ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🤖 모델 호출 · 🛡️ 도구 호출 제어 · 💬 프롬프트 입력 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 · 📨 세션 메시지 · 🔊 소리 · 🎨 화면만

읽는 법: 화면을 그리는 mod는 대부분 👀(대화 읽기)가 붙어요. 👀가 있어도 🌐(네트워크)·⚙️(프로그램 실행)·💬(프롬프트 입력)이 없으면 대화를 기기 밖으로 내보낼 방법이 없어요. 자세한 기준은 [안전 가이드](docs/guide/safety.md)에 있어요.
<!-- END:catalog -->

이름을 누르면 설치 방법, 추천 설정, 그 mod가 내 컴퓨터에서 하는 일, 검토 기록이 나와요.

## 왜 k-mods인가요?

1. **검토한 버전만 설치돼요.** 원본 저장소의 커밋을 고정해 두기 때문에, 원본이 바뀌어도 검토한 그 코드만 받아요. 업데이트는 다시 검토한 뒤에 올려요.
2. **이 mod가 내 컴퓨터에서 하는 일을 먼저 보여줘요.** mod는 샌드박스 없이 내 권한으로 돌아요. 그래서 네트워크, 프로그램 실행, 파일 쓰기, 모델 호출 같은 권한을 정적 분석으로 찾아 라벨로 붙여요.
3. **한국 환경에서 확인했어요.** 한글 표가 잘리는 문제처럼 한국어에서만 드러나는 버그는 고친 수정판을 함께 둬요. 무엇을 고쳤는지는 각 수정판의 `CHANGES-KO.md`에 적어 둬요.
4. **한국어로 설명해요.** `/plugin` 목록에도 한국어 이름과 설명이 떠요.
5. **원작자를 존중해요.** 외부 mod는 코드를 복사하지 않고 원본 저장소에서 바로 설치돼요. 라이선스가 없는 mod는 허락을 받기 전엔 올리지 않고, 원작자가 원하면 바로 내려요.

## 안전하게 쓰기

mod는 내 파일을 읽고 쓰고, 프로그램을 실행하고, 네트워크를 쓸 수 있어요. k-mods가 검토하지만, 설치 전에 mod 페이지의 **"이 mod가 내 컴퓨터에서 하는 일"** 을 한 번 읽어 주세요.
직접 확인하고 싶다면 `claude plugin validate <폴더>`가 그 mod가 받는 이벤트와 부르는 API를 보여줘요. 검토 기준과 라벨 뜻은 [안전 가이드](docs/guide/safety.md)에 있어요.

## 나만의 mod 만들기

Claude Code에게 "입력창 위에 현재 git 브랜치를 보여주는 mod 만들어 줘"라고 말하면 바로 만들어 줘요. 직접 코드를 쓰는 법, 테스트, 배포까지 [나만의 mod 만들기](docs/guide/make-your-own.md)에 정리했어요. API를 한국어로 훑어보려면 [치트시트](docs/guide/cheatsheet.md)를 보세요.

## 기여하기

- **좋은 mod를 알고 있다면**: [mod 추천하기](https://github.com/SeongGwangJu/k-mods/issues/new?template=suggest-mod.yml) 이슈를 남겨 주세요. 코드를 몰라도 돼요.
- **직접 등록하고 싶다면**: `registry/<이름>.json` 파일 하나를 추가하는 PR을 보내 주세요. 자동 검사가 설치·정적 분석·라이선스를 확인해요.
- **내 mod를 내리고 싶다면**: [이슈](https://github.com/SeongGwangJu/k-mods/issues/new?template=takedown.yml)를 남겨 주시면 바로 내려요.

자세한 절차는 [기여 가이드](CONTRIBUTING.md)에 있어요.

## 문서

| 문서 | 내용 |
| --- | --- |
| [mods가 뭔가요?](docs/guide/what-are-mods.md) | 동작 원리, 스킬·훅·MCP와의 차이, 켜고 끄는 법 |
| [설치 가이드](docs/guide/install.md) | 설치·업데이트·제거, 팀원과 함께 쓰기, 문제 해결 |
| [안전 가이드](docs/guide/safety.md) | mod가 할 수 있는 일, k-mods 검토 기준, 권한 라벨 |
| [나만의 mod 만들기](docs/guide/make-your-own.md) | Claude에게 시키기, 직접 쓰기, 테스트, k-mods에 올리기 |
| [치트시트](docs/guide/cheatsheet.md) | 이벤트·API·렌더 사이트 한국어 요약 |
| [기여 가이드](CONTRIBUTING.md) | 추천·등록·검토 절차, mod 작성 규칙 |

## 감사

- mods를 만든 Anthropic, 그리고 [token-weather·blast-radius 같은 예제](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods)
- 이 카탈로그에 실린 모든 mod의 원작자. 각 mod 페이지에 출처와 커밋을 적어 뒀어요.
- 한국어 스킬 모음 [k-skill](https://github.com/NomaDamas/k-skill)에서 많이 배웠어요.

## 라이선스

이 저장소의 카탈로그, 스크립트, 문서, k-mods 오리지널 mod는 [MIT](LICENSE)예요.
다른 프로젝트를 고친 수정판은 원본 라이선스를 따라요 ([NOTICE](NOTICE.md)). 외부 mod는 각 원본 저장소의 라이선스를 따라요.

제3자 상표와 서비스 이름은 호환 대상을 설명하려고만 써요. Anthropic이나 각 서비스의 공식 제품이 아니에요.

## 컨트리뷰터

[![k-mods 컨트리뷰터](https://contrib.rocks/image?repo=SeongGwangJu/k-mods)](https://github.com/SeongGwangJu/k-mods/graphs/contributors)
