# k-mods

<p align="center"><b>한국어</b> · <a href="README.en.md">English</a></p>

[![Claude Code 2.1.287+](https://img.shields.io/badge/Claude%20Code-2.1.287%2B-d97757)](https://code.claude.com/docs/en/plugins/mods/overview)
[![clones](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FSeongGwangJu%2Ff134cc891cc7d55d21e092d5eabf9328%2Fraw%2FSeongGwangJu__k-mods-clones.json)](https://github.com/SeongGwangJu/k-mods)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Website](https://img.shields.io/badge/website-k--mods-49B3EF)](https://seonggwangju.github.io/k-mods/)

<!-- HERO: 데모 GIF가 정해지면 아래 줄의 주석을 풀어요
<img src="docs/assets/hero.gif" alt="k-mods를 설치한 Claude Code: 한국어 상태줄, 냥캣 스피너, 컨텍스트 막대" width="760">
-->

Claude Code에 **mods**가 생겼어요. 이제 화면과 동작을 원하는 대로 바꿀 수 있어요.
어떤 mod를 설치해야 할지가 문제죠. 공개된 mod 중 **직접 검토한 것만** 골라 한국어로 소개해요.

한국어 메뉴, 냥캣 애니메이션, 화면 공유 시 개인정보 가리기, 작업 완료 시 휴대전화 알림, 위험 명령 차단까지. 지금 <!-- BEGIN:count -->64<!-- END:count -->개가 있어요.
미리보기 화면과 함께 보려면 [웹사이트](https://seonggwangju.github.io/k-mods/)에서 둘러보세요.

## 설치

Claude Code 안에서 두 줄이면 돼요.

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install starter@k-mods
```

- `starter`는 추천 세트예요. 모드 상점, 한국어 팩, 냥캣이 나오는 픽셀 장면 스피너, 메모장, 컨텍스트 막대, 위험 명령 브레이크, 작업 끝 알림이 함께 설치돼요.
- 하나씩 고르고 싶다면 `/plugin`을 열어 **k-mods** 목록을 보거나 `mod-store`를 설치하고 `/k-mods`를 입력하세요. 버튼으로 설치할 수 있어요.
- 이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요 (`claude --version`).

자세한 설치·업데이트·팀 공유 방법은 [설치 가이드](docs/guide/install.md)에 있어요.

## 잠깐만요

쓸 만했다면 GitHub 스타를 눌러 주세요. 원작자도 한국어 사용자의 관심을 확인할 수 있어요.

## mods가 뭔가요?

Claude Code 안에서 실행되는 플러그인 코드예요. 도구 호출, 프롬프트 입력, 화면 표시 같은 이벤트가 발생하면 실행되어 **화면이나 동작을 바꿔요.**

| | mod | 스킬 | 설정 훅 | MCP |
| --- | :-: | :-: | :-: | :-: |
| Claude Code 화면을 바꾸나요 | ✅ | ❌ | ❌ | ❌ |
| 무엇을 바꾸나요 | 도구 호출·프롬프트·명령·화면 | Claude가 읽는 지침 | 허용·차단·기록 | Claude가 쓸 도구 |
| 무엇으로 만드나요 | TypeScript·JavaScript | 마크다운 | 셸 스크립트 | 아무 언어 서버 |

더 알고 싶다면 [mods가 뭔가요?](docs/guide/what-are-mods.md)를 읽어 보세요.

## 먼저 써 보세요

<!-- BEGIN:featured -->
| mod | 무엇을 해 주나요 |
| --- | --- |
| [**ko-ui**](docs/mods/ko-ui.md)<br>`/plugin install ko-ui@k-mods` | 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 번역 사전에 맞춰 한국어로 표시해요. |
| [**skins**](docs/mods/skins.md)<br>`/plugin install skins@k-mods` | 도구 호출·표·코드·셸 출력을 테마 카드 형식으로 표시해요. 원본에서 한글 표가 잘리던 문제를 고쳤어요 |
| [**spinner**](docs/mods/spinner.md)<br>`/plugin install spinner@k-mods`<br><img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner/assets/nyan.gif" alt="spinner" width="420"> | Claude가 일하는 동안 입력창 위에 냥캣·Clawd 같은 픽셀 장면을 표시하고 펫을 키워요. 한국어·간결한 기본값으로 고친 수정판이에요 |
| [**컨텍스트 막대**](docs/mods/ctx-strip.md)<br>`/plugin install ctx-strip@k-mods` | 컨텍스트 구성(대화·도구·스킬…)을 입력창 위 막대로 표시해요. 서브에이전트가 실행되면 한 줄로 알려줘요 |
| [**작업 상태 한국어**](docs/mods/status-ko.md)<br>`/plugin install status-ko@k-mods` | 작업 중에는 '읽는 중 · page.tsx'처럼 지금 하는 일을 보여줘요. 끝나면 모델·시간·도구·캐시를 한 줄로 정리해요 |
| [**모드 상점**](docs/mods/mod-store.md)<br>`/plugin install mod-store@k-mods` | `/k-mods`를 입력하면 카탈로그가 열려요. 버튼으로 mod를 설치하거나 제거할 수 있어요 |
<!-- END:featured -->

## mod 목록

<!-- BEGIN:catalog -->
### 🇰🇷 한국어화

메뉴·설정·안내 문구를 한국어로 바꿔요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**ko-ui**](docs/mods/ko-ui.md) ⭐ | 슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 번역 사전에 맞춰 한국어로 표시해요. | [moduvoice](https://github.com/moduvoice) |

### 🎨 테마

대화·도구 호출 결과·표·코드의 표시 방식을 바꿔요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**skins**](docs/mods/skins.md) ⭐ | 도구 호출·표·코드·셸 출력을 테마 카드 형식으로 표시해요. 원본에서 한글 표가 잘리던 문제를 고쳤어요 | 🔧 [hellosverre](https://github.com/hellosverre) 원작 · 한국 수정판 |
| [**gfm-render**](docs/mods/gfm-render.md) | 대화 기록에 있는 GFM 경고문·체크리스트·취소선·Mermaid 다이어그램을 화면에 표시해요. | [briangtn](https://github.com/briangtn) |
| [**prismantis**](docs/mods/prismantis.md) | 표·코드·다이어그램·도구 호출 결과를 15가지 테마로 표시하고 복사 버튼을 추가해요. | [Nahum Litvin](https://github.com/NahumLitvin) |

### 🐾 애니메이션

Claude가 일하는 동안 애니메이션이나 게임을 표시해요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**spinner**](docs/mods/spinner.md) ⭐ | Claude가 일하는 동안 입력창 위에 냥캣·Clawd 같은 픽셀 장면을 표시하고 펫을 키워요. 한국어·간결한 기본값으로 고친 수정판이에요 | 🔧 [hoobnn](https://github.com/hoobnn) 원작 · 한국 수정판 |
| [**cc-arcade**](docs/mods/cc-arcade.md) | 입력창 위에서 스네이크·테트리스·2048·지뢰찾기 등 9가지 미니게임을 즐길 수 있어요. Claude가 일하는 동안 자라는 펫도 키울 수 있어요. | [Seza Akgün](https://github.com/sezaakgun) |
| [**clawd-spinner**](docs/mods/clawd-spinner.md) | 189가지 스피너 단어마다 Clawd가 요리·춤·서성거리기 등 서로 다른 몸짓을 해요. | [Sai Rudra](https://github.com/saiharsha03) |
| [**clawd-tales**](docs/mods/clawd-tales.md) | 입력창 위에서 픽셀 Clawd가 Claude의 모든 도구 호출에 맞춰 몸짓을 해요. 서브에이전트마다 작은 동료도 등장해요. | [plaxagoras](https://github.com/plaxagoras) |
| [**combo-meter**](docs/mods/combo-meter.md) | 도구 호출이 성공하면 콤보 수치와 랭크가 올라가고 실패하면 콤보가 끊겨요. 랭크는 D부터 SSS까지예요. | [Sarthak Bhatore](https://github.com/sarthak2511) |
| [**diff-invaders**](docs/mods/diff-invaders.md) | Claude가 방금 쓴 diff 줄에 대응하는 외계인 편대를 표시하는 스페이스 인베이더예요. 토큰 소모 없이 입력창 위에서 플레이해요 | [claude-code-templates](https://www.aitmpl.com) |
| [**reels**](docs/mods/reels.md) | Claude가 작업하는 동안 YouTube Shorts를 터미널 패널에서 재생하고 작업이 끝나면 자동으로 멈춰요. `/reels`를 입력했을 때만 재생돼요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**tool-defense**](docs/mods/tool-defense.md) | Claude의 실제 도구 호출(Bash·Edit·웹·Agent)에 대응하는 적 유닛을 표시하는 타워 디펜스예요. 토큰 소모 없이 입력창 위에서 플레이해요 | [claude-code-templates](https://www.aitmpl.com) |

### 📊 상태줄

컨텍스트·사용량·작업 상태를 항상 표시해요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**컨텍스트 막대**](docs/mods/ctx-strip.md) ⭐<br>`ctx-strip` | 컨텍스트 구성(대화·도구·스킬…)을 입력창 위 막대로 표시해요. 서브에이전트가 실행되면 한 줄로 알려줘요 | 🇰🇷 k-mods |
| [**작업 상태 한국어**](docs/mods/status-ko.md) ⭐<br>`status-ko` | 작업 중에는 '읽는 중 · page.tsx'처럼 지금 하는 일을 보여줘요. 끝나면 모델·시간·도구·캐시를 한 줄로 정리해요 | 🇰🇷 k-mods |
| [**agent-radar**](docs/mods/agent-radar.md) | 실행 중인 서브에이전트마다 경과 시간·도구 호출 수·현재 작업을 입력창 위 한 줄로 표시해요. /radar로 전체 목록과 대화 내용을 확인할 수 있어요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**browser-lanes**](docs/mods/browser-lanes.md) | 이 세션에 Playwright 브라우저가 있는지, 현재 누가 쓰는지 입력창 위에 표시해요. 서브에이전트끼리는 차례대로 사용하게 해요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**cache-panel**](docs/mods/cache-panel.md) | 프롬프트 캐시가 만료되기 50분 전에 알려줘요. 주기적 갱신, 한 번 갱신, 대화 압축 중 하나를 예상 비용과 함께 선택할 수 있어요. | [Dustin Yuchen Teng](https://github.com/danyuchn) |
| [**context-bar**](docs/mods/context-bar.md) | 컨텍스트 창을 /context와 같은 색의 구간별 막대 그래프로 표시해요. 토큰 수·압축 시점·범례도 입력창 위에서 확인할 수 있어요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**flightdeck**](docs/mods/flightdeck.md) | 메인 모델의 상태·비용·컨텍스트, 온콜 아키텍트 상담, 권한 검사, 서브에이전트 카드를 한 화면에 표시해요. 세션 이벤트가 발생하면 실시간으로 갱신해요 | [Stephen Casella](https://github.com/scasella) |
| [**hud**](docs/mods/hud.md) | 모델·프로젝트·Git·컨텍스트·사용량·도구·할 일을 HUD 한 줄로 표시해요. 예산·이력·작업 요약·상세 패널·테마도 지원해요. | [hoobnn](https://github.com/hoobnn) |
| [**mod-usage**](docs/mods/mod-usage.md) | 컨텍스트·5시간·7일 사용량을 입력창 위 그라데이션 막대 3개로 표시해요. Desktop/VS Code 전용이며 12개 언어를 지원하지만 한국어는 아직 없어요. | [Jack Chiang](https://github.com/jack21) |
| [**pr-pulse**](docs/mods/pr-pulse.md) | GitHub PR의 머지 준비 상태·CI 체크·리뷰 코멘트·리뷰 대기열을 입력창 위 한 줄과 패널에 실시간으로 표시해요 | [Gerric Chaplin](https://github.com/gerricchaplin) |
| [**prompt-cache-control**](docs/mods/prompt-cache-control.md) | 요청마다 캐시를 읽고 새로 쓴 양을 입력창 위에 표시해요. 만료가 임박하면 알리고 /compact·/clear 시점을 제안해요 | [claude-code-templates](https://www.aitmpl.com) |
| [**receipt**](docs/mods/receipt.md) | 매 턴이 끝나면 바뀐 파일·실행한 명령·읽은 횟수를 입력창 위 한 줄 요약으로 표시해요. 같은 작업을 반복하면 알려줘요. | [hoobnn](https://github.com/hoobnn) |
| [**review-watch**](docs/mods/review-watch.md) | 실행 중인 codex review나 '리뷰' 서브에이전트마다 모델·대상·경과 시간을 한 줄로 표시해요. 끝나면 발견 항목 수를 화면 알림으로 알려줘요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**statuspane**](docs/mods/statuspane.md) | 모델, 이펙트, 컨텍스트, 5시간·주간 한도, 비용, 브랜치를 프롬프트 위 카드 하나에 표시해요. | [Anji Xu](https://github.com/xuanji86) |
| [**taxi-meter**](docs/mods/taxi-meter.md) | 입력창 위 택시 미터기 패널에 세션 요금과 5시간·주간 한도를 표시해요. /meter·/receipt로 자세히 볼 수 있어요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| [**todo-bar**](docs/mods/todo-bar.md) | Claude가 만든 할 일 목록의 진행 상황과 경과 시간을 입력창 위 막대로 표시해요. | [hoobnn](https://github.com/hoobnn) |
| [**token-weather**](docs/mods/token-weather.md) | 컨텍스트 사용량을 날씨 아이콘과 최근 턴 막대그래프로 입력창 위에 표시해요. | [Claude Code DevRel](https://github.com/anthropics) |
| [**ts-band**](docs/mods/ts-band.md) | 입력창 위에 Tailscale 노드들의 연결 상태를 표시해요. 노드가 끊기거나 다시 연결되면 화면 알림으로 알려줘요. | [hoobnn](https://github.com/hoobnn) |
| [**usage-band-pawandeep**](docs/mods/usage-band-pawandeep.md) | 입력창 위에 5시간·주간 사용량 퍼센트와 초기화 카운트다운을 항상 표시해요. 새 채팅·GitHub 푸시 버튼도 함께 제공해요. | Pawandeep |

### 🧰 도구

패널·명령으로 직접 쓰는 기능이에요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**모드 상점**](docs/mods/mod-store.md) ⭐<br>`mod-store` | `/k-mods`를 입력하면 카탈로그가 열려요. 버튼으로 mod를 설치하거나 제거할 수 있어요 | 🇰🇷 k-mods |
| [**메모장**](docs/mods/memo-pad.md)<br>`memo-pad` | Claude가 일하는 동안 다음에 시킬 일을 적어 두고 버튼 한 번으로 입력창에 추가해요 | 🇰🇷 k-mods |
| [**agent-flow**](docs/mods/agent-flow.md) | 메인 루프와 서브에이전트의 관계를 트리 구조로 표시해요. 각 에이전트에 오간 컨텍스트 양과 답변은 클릭해서 볼 수 있어요 | [claude-code-templates](https://www.aitmpl.com) |
| [**agent-quick-menu**](docs/mods/agent-quick-menu.md) | 설치된 플러그인의 명령과 설정을 한 패널에서 찾아 바로 실행할 수 있어요. | [dasganni](https://github.com/dasganni) |
| [**image-view**](docs/mods/image-view.md) | 붙여넣은 이미지를 `[Image #1]` 같은 글자 대신 입력창 위 썸네일로 보여줘요. | [gggodlin](https://github.com/GGGODLIN) |
| [**now-playing**](docs/mods/now-playing.md) | macOS에서 Spotify로 재생 중인 곡과 가사를 입력창 위에 표시해요. 버튼이나 /music으로 재생·일시정지·이전·다음을 조작할 수 있어요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**paste-view**](docs/mods/paste-view.md) | 붙여넣은 이미지와 긴 텍스트를 입력창 위에서 미리 확인할 수 있어요. | [Clément Décou](https://github.com/Amorfx) |
| [**pixel-player**](docs/mods/pixel-player.md) | mpv로 재생목록을 재생하면서 음악에 맞춰 반응하는 픽셀 아트 캐릭터를 패널에 표시해요. | [chrisluo5311](https://github.com/chrisluo5311) |
| [**prompt-rail**](docs/mods/prompt-rail.md) | 세션에서 보낸 프롬프트를 탐색 막대에 모아 표시해요. 마우스를 올리면 내용을 미리 보고 클릭하면 해당 지점으로 이동해요. | [oikon48](https://github.com/oikon48) |
| [**replay-theater**](docs/mods/replay-theater.md) | 이번 턴에서 Claude가 고친 파일을 한 단계씩 diff로 다시 확인할 수 있어요. | [Claude Code DevRel](https://github.com/anthropics) |
| [**session-wrapped**](docs/mods/session-wrapped.md) | `/wrapped`로 이번 세션의 도구 호출·테스트·비용 통계를 애니메이션으로 표시해요. 공유용 PNG 카드는 데스크톱에 저장해요. | [OneWave AI](https://www.onewave-ai.com) |
| [**taxi-blackbox**](docs/mods/taxi-blackbox.md) | 도구 호출을 기록하고 오류나 거부 직전의 기록을 /blackbox에서 다시 확인할 수 있어요. 토큰·비밀번호는 가려서 기록해요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) |
| [**taxi-navi**](docs/mods/taxi-navi.md) | 할 일 목록에서 현재 진행 상태와 다음 할 일을 표시해요. 계획이 바뀌면 새 순서에 맞춰 목록을 갱신해요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) |

### ⚡ 자동화

알림, 대화 전환, 프롬프트 입력을 자동으로 처리해요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**작업 끝 알림**](docs/mods/done-alarm.md)<br>`done-alarm` | 오래 걸린 작업이 끝나거나 확인이 필요하면 맥 알림·한국어 음성·폰 푸시(ntfy·텔레그램·슬랙)로 알려줘요 | 🇰🇷 k-mods |
| [**agent-compact-advisor**](docs/mods/agent-compact-advisor.md) | 지금이 /compact 하기 좋은 때인지 상태줄에 0~100점으로 표시해요. 압축할 때마다 목표·결정·남은 일을 포함한 보존 템플릿을 자동으로 추가해요. | [apolenkov](https://github.com/apolenkov) |
| [**auto-handoff**](docs/mods/auto-handoff.md) | 컨텍스트가 한도에 도달하기 전에 Haiku가 요약한 브리핑을 만들고 새 대화로 전환해요. 필요하면 브리핑 페이지를 따로 열어 확인할 수 있어요. | [Alex Hillman](https://github.com/alexknowshtml) |
| [**ctx-handoff**](docs/mods/ctx-handoff.md) | 컨텍스트가 한계에 가까워지면 새 대화용 핸드오프를 만들고 자동으로 전환해요. 사용자가 55분 동안 입력하지 않으면 프롬프트 캐시를 최대 3번 갱신해요. | [cablate](https://github.com/cablate) |
| [**jev-skill-suggestion**](docs/mods/jev-skill-suggestion.md) | 프롬프트마다 맞는 스킬 하나를 판단해 자동으로 불러오고, 스킬 목록은 컨텍스트에 넣지 않아요. API 키가 있으면 TypeSafe Jev로, 없으면 Claude 분류기로 판단해요 | [claude-code-templates](https://www.aitmpl.com) |
| [**next-steps**](docs/mods/next-steps.md) | 턴이 끝날 때마다 다음에 보낼 법한 프롬프트 2~3개를 입력창 위에 제안해요. 숫자 키를 누르면 선택한 문구가 입력창에 입력돼요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**switchboard**](docs/mods/switchboard.md) | 서브에이전트가 시작되기 전에 Haiku/Sonnet/Opus 중 비용이 가장 낮은 모델을 골라요. `/route`에서 선택 결과와 예상 비용을 확인할 수 있어요. API 키 없이도 규칙만으로 동작해요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**where-am-i**](docs/mods/where-am-i.md) | 목표·지금 하는 일·사용자의 답변이 필요한 항목·다음 할 일을 입력창 위에 한눈에 보여줘요. `/where`에서 더 긴 요약도 볼 수 있어요. | [Hamza Zafar](https://github.com/hamzafer) |

### 🛡️ 지킴이

위험한 명령을 차단하고 민감한 정보를 가려요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**스트리머 모드**](docs/mods/streamer-mode.md)<br>`streamer-mode` | 화면을 공유·녹화할 때 토큰·이메일·전화번호·주민번호를 화면에서 가려요. Claude가 읽는 내용은 그대로예요 | 🇰🇷 k-mods |
| [**blast-radius-ko**](docs/mods/blast-radius-ko.md) | rm -rf·force push·DB 초기화처럼 되돌릴 수 없는 명령은 실행 전에 멈춰요. 변경 범위를 보여준 뒤 실행할지 물어봐요 | 🔧 [Anthropic](https://github.com/anthropics) 원작 · 한국 수정판 |
| [**secret-redactor**](docs/mods/secret-redactor.md) | 도구 결과에 섞인 API 키·토큰·JWT·개인키·DB 접속 문자열을 모델이 읽기 전에 지워요. 지워진 자리표시를 다시 명령에 쓰려 하면 차단해요 | [claude-code-templates](https://www.aitmpl.com) |
| [**secret-vault**](docs/mods/secret-vault.md) | 사용자가 붙여넣거나 도구가 읽어온 API 키·이메일·IP 주소를 모델에게 보내기 전 자리표시로 바꿔요. 도구 실행 직전에는 원래 값으로 되돌려줘요. | [Ray Amjad](https://github.com/ray-amjad) |
| [**taxi-speedcam**](docs/mods/taxi-speedcam.md) | force push·rm -rf·DB 삭제·변경 폐기·운영 배포처럼 위험한 Bash 명령을 실행하기 전에 확인을 요청해요. 실행하거나 차단할지는 사용자가 정해요. | [개발동생 (devbrothers)](https://github.com/devbrother2024) |

### 🔗 연동

GitHub·Linear 같은 외부 서비스의 상태와 작업을 Claude Code에 표시해요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**cc-pr-tracker**](docs/mods/cc-pr-tracker.md) | 머지 상태·리뷰·필수 체크를 입력창 위에 실시간으로 표시해요. 바뀌면 화면 알림과 소리로 알려줘요. | [Seza Akgün](https://github.com/sezaakgun) |
| [**github-issues**](docs/mods/github-issues.md) | 저장소의 GitHub 이슈를 카드로 표시해요. 버튼 한 번으로 Claude에게 해당 이슈 작업을 요청할 수 있어요. | [Marco Carnevali](https://github.com/MarcoCarnevali) |
| [**glance**](docs/mods/glance.md) | 다음 회의·리뷰 요청된 PR·진행 중인 Linear 이슈·최근 Slack DM을 입력창 위 한 줄에 표시해요. /glance로 전체 목록을 확인할 수 있어요. | [Hamza Zafar](https://github.com/hamzafer) |
| [**linear-board**](docs/mods/linear-board.md) | Linear 프로젝트·마일스톤·이슈를 패널에 표시해요. 계획·실행·제품 버튼으로 프롬프트를 바로 입력할 수 있어요. | [linear-mod contributors](https://github.com/SaharCarmel/linear-mod) |
| [**linear-tickets**](docs/mods/linear-tickets.md) | 내게 배정된 Linear 티켓을 패널에 표시해요. 클릭하면 바로 작업을 시작할 수 있어요. | [rjohnt](https://github.com/rjohnt) |
| [**terminal-browser**](docs/mods/terminal-browser.md) | Claude Code 화면에서 브라우저를 열어 웹사이트를 미리 볼 수 있어요. 에이전트가 직접 열고 닫으며, 별도로 설치한 terminal-browser 앱이 브라우저 엔진을 실행해요. | [zenbu-labs](https://github.com/zenbu-labs) |
| [**vercel-deploy-status**](docs/mods/vercel-deploy-status.md) | 연결된 Vercel 프로젝트의 배포 상태를 프롬프트 위 상태줄에 대기·빌드·완료 단계별로 표시해요. | [Ray Amjad](https://github.com/ray-amjad) |

### 📦 묶음

여러 mod를 한 번에 설치해요

| mod | 무엇을 해 주나요 | 출처 |
| --- | --- | --- |
| [**한국어 팩**](docs/mods/korean-pack.md)<br>`korean-pack` | 메뉴·설정 번역(ko-ui)과 작업 상태 한국어(status-ko)를 한 번에 설치해 Claude Code 화면을 한국어로 바꿔요 | 📦 묶음 |
| [**추천 세트**](docs/mods/starter.md)<br>`starter` | 처음 설치하기 좋은 추천 세트예요. ko-ui, status-ko, skins, spinner, ctx-strip, mod-store를 한 번에 설치해요 | 📦 묶음 |
| [**택시팩**](docs/mods/taxi-pack.md)<br>`taxi-pack` | 미터기(요금·한도), 내비(할 일 진행 상황), 과속카메라(위험 명령 확인), 블랙박스(도구 호출 기록)를 한 번에 설치해요 | 📦 묶음 |
<!-- END:catalog -->

이름을 누르면 설치 방법, 추천 설정, 그 mod가 내 컴퓨터에서 하는 일(권한), 검토 기록을 확인할 수 있어요.

## 왜 k-mods인가요?

1. **검토한 버전만 설치돼요.** 원본 저장소의 커밋을 고정해 두기 때문에 원본이 바뀌어도 검토한 코드만 설치돼요. 업데이트도 다시 검토한 뒤 등록해요.
2. **이 mod가 내 컴퓨터에서 하는 일을 먼저 보여줘요.** mod는 샌드박스 없이 내 권한으로 실행돼요. 네트워크 사용, 프로그램 실행, 파일 쓰기, 모델 호출에 필요한 권한을 정적 분석하고 라벨로 표시해요.
3. **한국 환경에서 확인했어요.** 한글 표가 잘리는 문제처럼 한국어에서만 드러나는 버그를 고친 수정판도 제공해요. 수정 내용은 각 수정판의 `CHANGES-KO.md`에 기록해요.
4. **한국어로 설명해요.** `/plugin` 목록에도 한국어 이름과 설명이 나와요.
5. **원작자를 존중해요.** 외부 mod의 코드를 이 저장소에 복사하지 않아요. 설치할 때 원본 저장소에서 받아요. 라이선스가 없는 mod는 허락을 받기 전에는 등록하지 않으며 원작자가 원하면 목록에서 바로 삭제해요.

## 안전하게 쓰기

mod는 내 파일을 읽고 쓰며 프로그램을 실행하고 네트워크를 사용할 수 있어요. k-mods가 코드를 검토하지만, 설치 전에 mod 페이지의 **"이 mod가 내 컴퓨터에서 하는 일"** 을 한 번 읽어 주세요.
직접 확인하려면 `claude plugin validate <폴더>`를 실행하세요. 해당 mod가 받는 이벤트와 호출하는 API를 보여줘요. 검토 기준과 라벨 뜻은 [안전 가이드](docs/guide/safety.md)에 있어요.

## 나만의 mod 만들기

Claude Code에게 "입력창 위에 현재 git 브랜치를 보여주는 mod 만들어 줘"라고 말하면 바로 만들어 줘요. 직접 코드를 쓰는 법부터 테스트와 배포까지 [나만의 mod 만들기](docs/guide/make-your-own.md)에 정리했어요. API를 한국어로 빠르게 확인하려면 [치트시트](docs/guide/cheatsheet.md)를 보세요.

## 기여하기

- **좋은 mod를 알고 있다면**: [mod 추천하기](https://github.com/SeongGwangJu/k-mods/issues/new?template=suggest-mod.yml) 이슈를 남겨 주세요. 코드를 몰라도 돼요.
- **직접 등록하고 싶다면**: `registry/<이름>.json` 파일 하나를 추가하는 PR을 보내 주세요. 자동 검사가 설치, 정적 분석, 라이선스를 확인해요.
- **내 mod 등록을 취소하고 싶다면**: [이슈](https://github.com/SeongGwangJu/k-mods/issues/new?template=takedown.yml)를 남겨 주시면 목록에서 바로 삭제해요.

자세한 절차는 [기여 가이드](CONTRIBUTING.md)에 있어요.

## 문서

| 문서 | 내용 |
| --- | --- |
| [mods가 뭔가요?](docs/guide/what-are-mods.md) | 동작 원리, 스킬·훅·MCP와의 차이, 켜고 끄는 법 |
| [설치 가이드](docs/guide/install.md) | 설치·업데이트·제거, 팀원과 함께 쓰기, 문제 해결 |
| [안전 가이드](docs/guide/safety.md) | mod가 할 수 있는 일, k-mods 검토 기준, 권한 라벨 |
| [나만의 mod 만들기](docs/guide/make-your-own.md) | Claude에게 시키기, 직접 쓰기, 테스트, k-mods에 등록하기 |
| [치트시트](docs/guide/cheatsheet.md) | 이벤트·API·렌더 사이트(화면 표시 위치) 한국어 요약 |
| [기여 가이드](CONTRIBUTING.md) | 추천·등록·검토 절차, mod 작성 규칙 |

## 감사

- mods를 만든 Anthropic, 그리고 [token-weather·blast-radius 같은 예제](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods)
- 이 카탈로그에 등록된 모든 mod의 원작자. 각 mod 페이지에 출처와 커밋을 기록했어요.
- 한국어 스킬 모음 [k-skill](https://github.com/NomaDamas/k-skill)에서 많이 배웠어요.

## 라이선스

이 저장소의 카탈로그, 스크립트, 문서, k-mods 오리지널 mod는 [MIT](LICENSE)예요.
다른 프로젝트의 코드를 수정한 수정판은 원본 라이선스를 따라요 ([NOTICE](NOTICE.md)). 외부 mod는 각 원본 저장소의 라이선스를 따라요.

제3자 상표와 서비스 이름은 호환 대상을 설명할 때만 써요. Anthropic이나 각 서비스의 공식 제품이 아니에요.

## 컨트리뷰터

[![k-mods 컨트리뷰터](https://contrib.rocks/image?repo=SeongGwangJu/k-mods)](https://github.com/SeongGwangJu/k-mods/graphs/contributors)
