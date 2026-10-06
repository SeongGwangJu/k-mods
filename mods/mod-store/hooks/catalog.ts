// 생성 파일: node scripts/build.mjs 가 registry/*.json 으로 만든다. 직접 고치지 말 것.

export type CategoryId = 'korean' | 'look' | 'fun' | 'meter' | 'safety' | 'workflow' | 'integration' | 'bundle'
export type Kind = 'upstream' | 'patched' | 'original' | 'bundle'
export type CatalogEntry = {
  name: string
  displayName: string
  summary: string
  category: CategoryId
  kind: Kind
  author: string
  license: string
  homepage?: string
  commands: string[]
  requires: string[]
  notes: string[]
  permissions: string[]
  featured?: boolean
  dependencies?: string[]
}

export const MARKETPLACE = 'k-mods'
export const CATALOG_VERSION = '0.1.0'

// 상점 자신은 목록에서 숨긴다
export const SELF_NAME = 'mod-store'

// 권한 라벨, 민감한 것부터
export const PERMISSION_ORDER: readonly string[] = ["네트워크","프로그램 실행","파일 쓰기","모델 호출","도구 호출 제어","프롬프트 입력","대화 읽기","환경·설정 읽기","파일 읽기","세션 메시지","소리","화면만"]

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  {
    "id": "localize",
    "label": "한국어화"
  },
  {
    "id": "theme",
    "label": "테마"
  },
  {
    "id": "animation",
    "label": "애니메이션"
  },
  {
    "id": "statusline",
    "label": "상태줄"
  },
  {
    "id": "tool",
    "label": "도구"
  },
  {
    "id": "automation",
    "label": "자동화"
  },
  {
    "id": "guard",
    "label": "지킴이"
  },
  {
    "id": "integration",
    "label": "연동"
  },
  {
    "id": "bundle",
    "label": "묶음"
  }
]

export const CATALOG: CatalogEntry[] = [
  {
    "name": "ko-ui",
    "displayName": "한국어 UI 번역 사전",
    "summary": "슬래시 커맨드 설명, `/config` 항목, 작업 표시줄 같은 화면 문구를 사전 기반으로 한국어로 보여줘요.",
    "category": "localize",
    "kind": "upstream",
    "author": "moduvoice",
    "license": "MIT",
    "homepage": "https://github.com/moduvoice/claude-code-ko-ui",
    "commands": [
      "/ko-dump"
    ],
    "requires": [],
    "notes": [
      "Claude Code 2.1.287 이상이 필요해요. 2.1.285에서는 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` 환경 변수를 켜야 로드돼요.",
      "모델 호출·네트워크 요청이 전혀 없는 고정 사전(dict.json) 치환 방식이라 토큰을 쓰지 않아요.",
      "Spinner 단어 번역은 terminal 화면에서만 적용돼요(desktop은 원문 유지, 나머지 번역은 desktop에서도 적용돼요).",
      "번역 안 된 새 문구는 `/ko-dump`로 확인해 `dict.json`에 직접 추가할 수 있어요(최대 200개까지 기록).",
      "권한 확인 창, 환영 화면, 선택지 값, 에러 메시지, 프롬프트 아래 알약 문구는 훅이 없거나 번역하면 다른 정보가 사라져서 원문 그대로예요."
    ],
    "permissions": [
      "대화 읽기",
      "파일 읽기"
    ],
    "featured": true
  },
  {
    "name": "skins",
    "displayName": "스킨 (한국 수정판)",
    "summary": "도구 호출·표·코드·셸 출력을 테마 카드로 다시 그려요. 원본에서 한글 표가 잘리던 문제를 고쳤어요",
    "category": "theme",
    "kind": "patched",
    "author": "hellosverre",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/skins",
    "commands": [
      "/skin"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ],
    "featured": true
  },
  {
    "name": "gfm-render",
    "displayName": "GFM 렌더러",
    "summary": "트랜스크립트에서 GFM 경고문·체크리스트·취소선·Mermaid 다이어그램을 그려줘요.",
    "category": "theme",
    "kind": "upstream",
    "author": "briangtn",
    "license": "MIT",
    "homepage": "https://github.com/briangtn/claude-gfm-render",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "대화 읽기"
    ]
  },
  {
    "name": "prismantis",
    "displayName": "프리즈만티스",
    "summary": "표·코드·다이어그램·도구 줄을 15가지 테마로 색입혀 보여주고, 복사 버튼도 달아줘요.",
    "category": "theme",
    "kind": "upstream",
    "author": "Nahum Litvin",
    "license": "MIT",
    "homepage": "https://github.com/NahumLitvin/prismantis",
    "commands": [
      "/prismantis"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "spinner",
    "displayName": "픽셀 장면 스피너 (냥캣 등 15종)",
    "summary": "Claude가 일하는 동안 입력창 위에 냥캣·천둥·청크 같은 픽셀 장면을 띄우고, 턴마다 자라는 펫도 키워요",
    "category": "animation",
    "kind": "upstream",
    "author": "hoobnn",
    "license": "MIT",
    "homepage": "https://github.com/hoobnn/hoobnn-agent-mods",
    "commands": [
      "/spinner"
    ],
    "requires": [
      "swiftc/Xcode Command Line Tools (오디오 테마 전용, macOS 14.2+ 및 '시스템 오디오 녹음' 권한 필요)"
    ],
    "notes": [
      "k-mods 권장 설정은 `theme`를 `random` 대신 nyan · clawd · thunder · chomp 중에서 고르길 권해요. 좁은 터미널과 한국어 환경에서 알아보기 쉬운 테마들을 k-mods가 추린 목록이며, 업스트림 작성자의 권장 사항은 아니에요.",
      "`theme`를 audio로 바꾸면 첫 실행 시 `swiftc`로 `audio-tap.swift`를 로컬 컴파일해 실행하고, macOS Core Audio로 시스템 출력 소리의 레벨만 읽어 보여줘요(macOS 14.2+, 터미널에 '시스템 오디오 녹음' 권한 허용 필요). 저장·전송은 하지 않지만 Xcode Command Line Tools가 필요해요.",
      "터미널이 느리거나 저전력 환경이면 `reducedMotion`을 켜서 마스코트·밴드·펫을 정지 이미지로 바꿀 수 있어요.",
      "같은 작성자(hoobnn)의 `hud` 모드를 함께 쓰면 펫을 hud 쪽에 표시하고 쓰다듬은 횟수를 공유해요. `hud`가 없어도 정상 동작해요(안전한 no-op).",
      "`language: ko`는 `/spinner` 응답과 레벨업·피날레 문구까지 전부 한국어로 번역되어 있어요(자리표시자 아님)."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ],
    "featured": true
  },
  {
    "name": "cc-arcade",
    "displayName": "CC 아케이드",
    "summary": "입력창 위에서 스네이크·테트리스·2048·지뢰찾기 등 9가지 미니게임을 즐기고, Claude가 일하는 동안 자라는 펫도 키울 수 있어요.",
    "category": "animation",
    "kind": "upstream",
    "author": "Seza Akgün",
    "license": "MIT",
    "homepage": "https://github.com/sezaakgun/cc-arcade",
    "commands": [
      "/arcade"
    ],
    "requires": [
      "대화형 터미널(비대화형 `-p` 모드에서는 동작하지 않아요)",
      "Claude Code 2.1.287 미만이면 CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 환경 변수 필요"
    ],
    "notes": [
      "장르를 본뜬 클론이며 Tetris Holding·Taito·Atari·id Software와 무관해요(업스트림 설명 그대로).",
      "최고 점수와 펫 상태는 로컬 $.store에만 저장돼요.",
      "`/arcade colorblind`로 Doom을 빨강·초록 구분 없는 팔레트로 바꿀 수 있어요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "clawd-spinner",
    "displayName": "Clawd 스피너",
    "summary": "189가지 스피너 단어마다 Clawd가 요리하거나 춤추거나 서성거리는 등 다른 몸짓을 연기해요.",
    "category": "animation",
    "kind": "upstream",
    "author": "Sai Rudra",
    "license": "MIT",
    "homepage": "https://github.com/saiharsha03/clawd-spinner",
    "commands": [
      "/clawd-talk"
    ],
    "requires": [],
    "notes": [
      "좁은 터미널(50칸 미만)에서는 자동으로 숨고 기본 스피너만 보여요.",
      "`/clawd-talk`로 말풍선을 껐다 켤 수 있고, 설정은 세션 간 기억돼요."
    ],
    "permissions": [
      "대화 읽기"
    ]
  },
  {
    "name": "clawd-tales",
    "displayName": "Clawd 이야기",
    "summary": "입력창 위에서 픽셀 Clawd가 Claude의 모든 도구 호출을 몸짓으로 연기하고, 서브에이전트마다 작은 동료도 등장해요.",
    "category": "animation",
    "kind": "upstream",
    "author": "plaxagoras",
    "license": "MIT",
    "homepage": "https://github.com/plaxagoras/clawd-tales",
    "commands": [
      "/tales"
    ],
    "requires": [],
    "notes": [
      "히어로의 걷기·환호 스프라이트 원형과 기본 팔레트는 Claude Fables(henrik-thevibe, MIT)에서 가져왔다고 NOTICE 파일에 명시돼 있어요.",
      "서브에이전트가 뜨면 작은 동료가 따로 등장하고, 모델 색깔에 따라 외형이 달라져요.",
      "mobile 화면에서는 그려지지 않도록 코드로 명시돼 있어요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "combo-meter",
    "displayName": "콤보 미터",
    "summary": "도구 호출이 성공하면 콤보가 이어지고 실패하면 끊기는 격투 게임 스타일 콤보 미터예요. D부터 SSS까지 랭크가 올라가요.",
    "category": "animation",
    "kind": "upstream",
    "author": "Sarthak Bhatore",
    "license": "MIT",
    "homepage": "https://github.com/sarthak2511/claude-combo",
    "commands": [
      "/combo"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "소리"
    ]
  },
  {
    "name": "diff-invaders",
    "displayName": "디프 인베이더",
    "summary": "Claude가 방금 쓴 diff 줄이 그대로 외계인 편대가 되는 스페이스 인베이더예요. 토큰 소모 없이 입력창 위에서 플레이해요",
    "category": "animation",
    "kind": "upstream",
    "author": "claude-code-templates",
    "license": "MIT",
    "homepage": "https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/games/diff-invaders",
    "commands": [
      "/diff-invaders"
    ],
    "requires": [],
    "notes": [
      "마우스 없이 방향키(←→/ad)와 스페이스만으로 플레이 가능해요(클릭도 지원)",
      "최고 점수만 $.store(plugin 전용 저장소)에 남기고, 그 외 기기 밖 전송은 없어요",
      "README에 'claude -p, 데스크톱 앱, 모바일에서는 아무것도 그려지지 않는다'고 명시되어 있어요(terminal 전용)"
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "reels",
    "displayName": "릴스",
    "summary": "Claude가 작업하는 동안 YouTube Shorts를 터미널 패널에 재생하고, Claude가 끝나면 자동으로 멈춰요. /reels를 쳐야만 켜져요.",
    "category": "animation",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/reels",
    "commands": [
      "/reels"
    ],
    "requires": [
      "Playwright (최초 /reels 실행 시 설치 안내가 떠요: npm install --prefix <plugin> playwright)"
    ],
    "notes": [
      "코드(helper/reels.cjs)까지 직접 읽어 확인했어요. Playwright로 헤드리스 Chrome을 띄워 https://www.youtube.com/shorts 를 열고, 화면을 CDP 스크린캐스트로 캡처해 PNG로 저장한 뒤 패널에 보여줘요. 제어는 로컬 유닉스 소켓(파일 경로를 쓰는 IPC)으로만 하고, 바깥에 열린 네트워크 포트는 아니에요.",
      "프로필(쿠키 등)은 ~/.claude-mods/reels/profile에 로컬로만 저장돼요."
    ],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "tool-defense",
    "displayName": "툴 디펜스",
    "summary": "Claude의 실제 도구 호출(Bash·Edit·웹·Agent)이 그대로 적 유닛이 되는 타워 디펜스예요. 토큰 소모 없이 입력창 위에서 플레이해요",
    "category": "animation",
    "kind": "upstream",
    "author": "claude-code-templates",
    "license": "MIT",
    "homepage": "https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/games/tool-defense",
    "commands": [
      "/defense"
    ],
    "requires": [],
    "notes": [
      "클릭(마우스)으로 타워를 짓고 업그레이드해요. 일시정지·재시작은 키보드(스페이스/p/r)로도 가능해요",
      "최고 점수만 $.store(plugin 전용 저장소)에 남기고, 그 외 기기 밖 전송은 없어요",
      "README에 'claude -p, 데스크톱 앱, 모바일에서는 아무것도 그려지지 않는다'고 명시되어 있어요(마우스 가능한 terminal 전용)"
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "status-ko",
    "displayName": "작업 상태 한국어",
    "summary": "작업 중 줄을 '읽는 중 · page.tsx'처럼 지금 하는 일로, 끝난 줄을 모델·시간·도구·캐시 한 줄로 보여줘요",
    "category": "statusline",
    "kind": "original",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/status-ko",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ],
    "featured": true
  },
  {
    "name": "ctx-strip",
    "displayName": "컨텍스트 막대",
    "summary": "컨텍스트가 무엇으로 차 있는지(대화·도구·스킬…) 입력창 위 막대로 보여주고, 서브에이전트가 돌면 한 줄로 알려줘요",
    "category": "statusline",
    "kind": "original",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/ctx-strip",
    "commands": [
      "/ctx"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "파일 쓰기",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "agent-radar",
    "displayName": "에이전트 레이더",
    "summary": "실행 중인 서브에이전트마다 입력창 위에 경과 시간·도구 호출 수·현재 작업을 한 줄로 보여주고, /radar로 전체 목록과 대화 내용을 확인해요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/agent-radar",
    "commands": [
      "/radar"
    ],
    "requires": [],
    "notes": [
      "같은 저장소의 mission-control도 서브에이전트를 추적하지만 코드맵까지 포함한 더 무거운 패널이에요. agent-radar는 가볍고 단일 목적(에이전트 상태)이라 함께 설치해도 역할이 겹치지 않는다고 판단했어요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "browser-lanes",
    "displayName": "브라우저 레인",
    "summary": "이 세션이 Playwright 브라우저를 갖고 있는지, 누가 쓰고 있는지 입력창 위에 보여주고, 서브에이전트끼리는 순서를 기다리게 해요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/browser-lanes",
    "commands": [
      "/browser"
    ],
    "requires": [
      "Playwright MCP 서버 (claude mcp add playwright --scope user -- npx @playwright/mcp@latest --isolated 권장)"
    ],
    "notes": [
      "--isolated 없이 Playwright MCP를 쓰면 세션마다 Chrome 프로필을 공유해 두 번째 세션이 'Browser is already in use' 오류를 겪는데, 이 mod는 그 상황을 알려주고 /browser clean으로 정리해 주는 역할이에요. 근본 해결은 --isolated 설정이라고 README에도 명시돼 있어요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "cache-panel",
    "displayName": "캐시 패널",
    "summary": "프롬프트 캐시가 식기 50분 전에 알려주고, 계속 데우기·한 번 핑·압축 중 하나를 비용 추정과 함께 고를 수 있어요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Dustin Yuchen Teng",
    "license": "MIT",
    "homepage": "https://github.com/danyuchn/claude-mods",
    "commands": [
      "/warm"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "모델 호출",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "context-bar",
    "displayName": "컨텍스트 바 (hamzafer)",
    "summary": "컨텍스트 창을 /context와 같은 색으로 구간별 막대 그래프로 보여주고, 토큰 수·압축 시점·범례까지 입력창 위에 표시해요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/context-bar",
    "commands": [
      "/context-bar"
    ],
    "requires": [],
    "notes": [
      "k-mods 자체 mod인 ctx-strip과 개념이 겹쳐요(둘 다 컨텍스트 창을 막대로 보여줌). 이름은 다르므로(string 충돌 아님) 등록은 했지만, 기계적으로는 ctx-strip이 '막대 + 서브에이전트 한 줄'을 한 번에 보여주는 반면 context-bar는 /context와 동일한 카테고리별 색상·범례·압축 임계값 표시에 집중한 순수 컨텍스트 전용 버전이라는 차이가 있어요. 최종적으로 사용자에게 둘 다 보여줄지, 하나만 추천할지는 교차 조율이 필요해 보여요."
    ],
    "permissions": [
      "대화 읽기"
    ]
  },
  {
    "name": "flightdeck",
    "displayName": "플라이트덱 대시보드",
    "summary": "메인 모델 상태·비용·컨텍스트, 온콜 아키텍트 상담, 권한 검사, 서브에이전트 카드를 실시간 세션 이벤트로 한 화면에 보여줘요",
    "category": "statusline",
    "kind": "upstream",
    "author": "Stephen Casella",
    "license": "MIT",
    "homepage": "https://github.com/scasella/claude-flightdeck",
    "commands": [
      "/flightdeck"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "hud",
    "displayName": "claude-hud 상태 대시보드",
    "summary": "모델·프로젝트·Git·컨텍스트·사용량·도구·할 일을 HUD 한 줄로 보여주고, 예산·이력·작업 요약·상세 패널·테마까지 지원해요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "hoobnn",
    "license": "MIT",
    "homepage": "https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/hud",
    "commands": [
      "/hud"
    ],
    "requires": [
      "Nerd Font (nerd·powerline 테마에서만 필요)"
    ],
    "notes": [
      "[jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) 0.10.0을 mod로 옮긴 것으로, 별도 LICENSE.claude-hud(MIT, Jarrod Watts)로 원저작권을 유지해요. 화면 언어는 k-mods의 `/config`가 아니라 claude-hud 자신의 설정 파일(`~/.claude/plugins/claude-hud/config.json` 또는 `~/.claude/claude-hud.json`)의 `language` 필드를 따라요(기본값 en). plugin.json userConfig에 language 옵션 자체가 없어 여기서는 language 설정을 권장하지 않았어요.",
      "`summaryEveryTurns`(기본 5턴, 0으로 끌 수 있음)마다 세션 작업을 한 줄로 요약하는 모델 호출이 있어요. 대화를 포크해 프롬프트 캐시를 재사용하는 호출이라 비용은 적지만 사용자 사용량을 소모해요.",
      "`extraCmd`(claude-hud의 --extra-cmd, 임의 쉘 명령 실행)는 기본 빈 값이고, 쓰려면 옵션 설정과 `CLAUDE_HUD_ALLOW_EXTRA_CMD=1` 환경 변수를 모두 켜야 해요.",
      "계정 인증 방식·이메일 일부를 보여주는 기능(claude-hud의 showAuth/showAuthUser)과 다른 로컬 도구로 사용량을 공유하는 파일(externalUsagePath/externalUsageWritePath)은 claude-hud 자체 설정 파일에서만 켤 수 있고 둘 다 기본값이 꺼짐이에요.",
      "같은 작성자(hoobnn)의 `spinner` mod를 함께 설치하면 pet이 HUD 옆(below 위치일 때)에 표시돼요. spinner가 없어도 정상 동작해요."
    ],
    "permissions": [
      "프로그램 실행",
      "파일 쓰기",
      "모델 호출",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기",
      "소리"
    ]
  },
  {
    "name": "mod-usage",
    "displayName": "사용량 진행률 막대",
    "summary": "컨텍스트·5시간·7일 사용량을 입력창 위 그라데이션 막대 3개로 보여줘요. Desktop/VS Code 전용, 12개 언어를 지원하지만 한국어는 아직 없어요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Jack Chiang",
    "license": "MIT",
    "homepage": "https://github.com/jack21/claude-mod-usage",
    "commands": [],
    "requires": [],
    "notes": [
      "한국어는 아직 공식 지원 언어가 아니에요. k-mods가 번역 패치를 준비해 메인테이너에게 제안할 예정이에요.",
      "한국어 로캘(`ko_KR` 등)이어도 지원 목록 12개 언어에 `ko`가 없어서 자동으로 영어로 표시돼요. 번역 패치가 반영되기 전까지는 `/plugin configure`의 언어 선택지에도 한국어가 없어요.",
      "터미널에서는 그려지지 않아요. Claude Code Desktop/VS Code/모바일 전용이고, CLI는 자체 상태 표시줄을 그대로 써요.",
      "5시간·7일 막대는 Claude 구독 사용자에게만 보여요. API 키로 쓰면 컨텍스트 막대만 보여요 (원본 README 기준, k-mods가 직접 확인한 건 아니에요).",
      "macOS에서 `LANG`류 환경변수가 하나도 없을 때만 내부적으로 `/usr/bin/defaults read -g AppleLanguages`를 1회 실행해 시스템 언어를 읽어요. 인자가 고정돼 있고 사용자 입력은 들어가지 않아요."
    ],
    "permissions": [
      "프로그램 실행",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "pr-pulse",
    "displayName": "PR 펄스",
    "summary": "GitHub PR의 머지 준비 상태·CI 체크·리뷰 코멘트·리뷰 대기열을 입력창 위 띠와 패널로 실시간으로 보여줘요",
    "category": "statusline",
    "kind": "upstream",
    "author": "Gerric Chaplin",
    "license": "MIT",
    "homepage": "https://github.com/gerricchaplin/pr-pulse",
    "commands": [
      "/pulse"
    ],
    "requires": [
      "gh CLI 로그인 (gh auth status)"
    ],
    "notes": [
      "GitHub API 호출이 전부 로컬 gh 인증을 그대로 써요. 다른 작업과 시간당 한도를 같이 써요 (15초/60초 주기로 자동 새로고침)."
    ],
    "permissions": [
      "프로그램 실행",
      "프롬프트 입력"
    ]
  },
  {
    "name": "prompt-cache-control",
    "displayName": "프롬프트 캐시 미터",
    "summary": "요청마다 캐시가 얼마나 읽히고 새로 쓰였는지 입력창 위에 보여주고, 만료 임박이면 알려주며 /compact·/clear 시점을 제안해요",
    "category": "statusline",
    "kind": "upstream",
    "author": "claude-code-templates",
    "license": "MIT",
    "homepage": "https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/observability/prompt-cache-control",
    "commands": [
      "/cache"
    ],
    "requires": [],
    "notes": [
      "TTL(캐시 유지 시간)은 환경변수·설정·계정 종류(구독/API 키)로 자동 추정되고, 요청 간격을 관찰해 스스로 보정해요",
      "1초 간격 타이머가 돌지만 표시 내용이 바뀔 때만 다시 그려서 유휴 세션엔 비용이 없어요"
    ],
    "permissions": [
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "receipt",
    "displayName": "턴 영수증",
    "summary": "매 턴이 끝나면 바뀐 파일·실행한 명령·읽은 횟수를 입력창 위에 한 줄 영수증으로 보여주고, 제자리걸음을 하면 알려줘요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "hoobnn",
    "license": "MIT",
    "homepage": "https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/receipt",
    "commands": [
      "/receipt"
    ],
    "requires": [],
    "notes": [
      "같은 작성자의 `hud`·`ts-band`·`todo-bar`·`hitokoto`와 같은 Box/Text 기반 렌더링을 쓰지만, 이 mod의 테스트 스위트만 유일하게 terminal 서피스만 돌려 확인해 surfaces를 terminal로만 표기했어요(desktop이 안 되는 것을 확인한 건 아니고, 작성자가 desktop으로 검증한 기록이 없다는 뜻이에요).",
      "채팅만 하고 도구를 쓰지 않은 턴은 영수증을 남기지 않고, 다음 턴이 시작되면 자동으로 접혀요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "review-watch",
    "displayName": "리뷰 워치",
    "summary": "실행 중인 codex review나 '리뷰' 서브에이전트마다 모델·대상·경과 시간을 한 줄로 보여주고, 끝나면 발견 개수를 토스트로 알려줘요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/review-watch",
    "commands": [],
    "requires": [
      "ps, tail (macOS/Linux 기본 제공)",
      "Codex CLI (선택. codex review 추적 시에만 의미 있음)"
    ],
    "notes": [
      "저장소 설명에 'codex review 감시' 기능이 있다고 해서 codex 바이너리를 직접 실행하는지 코드로 확인했어요. 직접 실행하지 않아요. Claude가 이미 Bash로 실행한 `codex review` 명령을 ps/tail로 관찰만 하고, 실행 여부 결정이나 차단은 merge-gate(같은 저장소)의 역할이에요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "statuspane",
    "displayName": "상태 카드",
    "summary": "모델, 이펙트, 컨텍스트, 5시간·주간 한도, 비용, 브랜치를 프롬프트 위 카드 하나로 보여줘요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Anji Xu",
    "license": "MIT",
    "homepage": "https://github.com/xuanji86/claude-statuspane",
    "commands": [
      "/statuspane"
    ],
    "requires": [
      "gh CLI (ciBranch 또는 ciPush 설정을 켰을 때만 필요해요, 기본은 둘 다 꺼져 있어요)"
    ],
    "notes": [
      "데스크톱 앱에서는 모델·이펙트·컨텍스트를 자체적으로 보여주기 때문에 이 카드는 터미널에서만 그려져요.",
      "Claude Code 2.1.287 이상 필요, 2.1.288에서 테스트됐다고 README에 적혀 있어요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "taxi-meter",
    "displayName": "택시 미터기",
    "summary": "입력창 위 택시 미터기 패널로 세션 요금과 5시간·주간 한도를 보여줘요. /meter·/receipt로 자세히 볼 수 있어요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "개발동생 (devbrothers)",
    "license": "MIT",
    "homepage": "https://github.com/devbrother2024/devbrothers-mods",
    "commands": [
      "/meter",
      "/receipt"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "대화 읽기",
      "소리"
    ]
  },
  {
    "name": "todo-bar",
    "displayName": "할 일 진행 상태줄",
    "summary": "Claude가 만든 할 일 목록의 진행 상황을 입력창 위에 막대와 경과 시간으로 보여줘요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "hoobnn",
    "license": "MIT",
    "homepage": "https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/todo-bar",
    "commands": [
      "/todos"
    ],
    "requires": [],
    "notes": [
      "TodoWrite·TaskCreate·TaskUpdate 결과만 사후에 읽어서 그리고, 별도 도구를 등록하거나 프롬프트에 끼어들지 않아 토큰을 쓰지 않아요.",
      "거부되거나 실패한 호출, 서브에이전트 자신의 할 일 목록은 집계하지 않아요.",
      "세션별 진행 상황은 최근 20개 세션까지 로컬에 보관되어 세션을 재개해도 이어서 보여요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "token-weather",
    "displayName": "토큰 날씨",
    "summary": "컨텍스트 창이 얼마나 찼는지 날씨 아이콘과 최근 턴 막대그래프로 입력창 위에 보여줘요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Claude Code DevRel",
    "license": "Apache-2.0",
    "homepage": "https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/token-weather",
    "commands": [],
    "requires": [],
    "notes": [
      "턴이 끝날 때마다 `$.session.usage()`로 컨텍스트 사용률만 다시 읽어요. 추가 네트워크·모델 호출 없어요.",
      "최근 12번 턴의 토큰 수를 막대그래프로 보여줘요."
    ],
    "permissions": [
      "대화 읽기"
    ]
  },
  {
    "name": "ts-band",
    "displayName": "테일스케일 노드 상태줄",
    "summary": "입력창 위에 Tailscale 노드들의 연결 상태를 보여주고, 노드가 끊기거나 다시 연결되면 토스트로 알려줘요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "hoobnn",
    "license": "MIT",
    "homepage": "https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/ts-band",
    "commands": [
      "/ts"
    ],
    "requires": [
      "tailscale CLI"
    ],
    "notes": [
      "Tailscale이 설치되어 있어야 동작해요(없으면 '찾을 수 없음' 오류만 조용히 표시).",
      "기본 새로고침 주기는 60초(최소 10초)이고, 조회 실패가 이어지면 최대 10분까지 점점 느리게 재시도해요.",
      "`tailscalePath`를 비워두면 PATH, Homebrew 설치 경로, macOS 앱 내장 CLI 순서로 자동으로 찾아요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "usage-band-pawandeep",
    "displayName": "사용량 밴드 (5시간·주간)",
    "summary": "입력창 위에 5시간·주간 사용량 퍼센트와 초기화 카운트다운을 항상 보여주고, 새 채팅·GitHub 푸시 버튼도 함께 제공해요.",
    "category": "statusline",
    "kind": "upstream",
    "author": "Pawandeep",
    "license": "MIT",
    "homepage": "https://github.com/pawandeepdhall/claude-mods#usage-band",
    "commands": [],
    "requires": [],
    "notes": [
      "↑ 푸시 버튼은 git 명령을 직접 실행하지 않아요. 커밋 후 푸시해 달라는 요청을 사용자가 직접 입력한 것처럼 Claude에게 제출할 뿐이라, 실제 git 실행은 평소 권한 설정(permission)을 그대로 따라요.",
      "＋ 새 채팅 버튼은 Windows에서는 번들된 VBScript(wscript.exe)로, macOS에서는 osascript로 Ctrl+N/Cmd+N 키 입력을 흉내 내요.",
      "같은 저장소의 `next-steps` 플러그인은 이번 심사 대상이 아니에요(모델 호출 `$.model.complete`을 써서 별도 검토가 필요해요).",
      "비슷한 성격의 사용량 표시 mod로 `mod-usage`(Desktop/VS Code 전용, 다국어)와 `taxi-meter`(택시 미터기 테마, 원화 환산)도 등록돼 있어요. 이 mod는 터미널·데스크톱 모두 되고 새 채팅·GitHub 푸시 버튼이 있다는 점이 달라요."
    ],
    "permissions": [
      "프로그램 실행",
      "프롬프트 입력"
    ]
  },
  {
    "name": "mod-store",
    "displayName": "모드 상점",
    "summary": "/k-mods 한 번이면 카탈로그를 둘러보고 버튼으로 설치·제거해요",
    "category": "tool",
    "kind": "original",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/mod-store",
    "commands": [
      "/k-mods"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "환경·설정 읽기"
    ],
    "featured": true
  },
  {
    "name": "memo-pad",
    "displayName": "메모장",
    "summary": "Claude가 일하는 동안 다음에 시킬 일을 적어 두고, 버튼 한 번으로 입력창에 넣어요",
    "category": "tool",
    "kind": "original",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/memo-pad",
    "commands": [
      "/m"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "프롬프트 입력"
    ]
  },
  {
    "name": "agent-flow",
    "displayName": "에이전트 플로우",
    "summary": "메인 루프와 서브에이전트들을 나무 구조로 보여주고, 각 에이전트에 오간 컨텍스트 양과 답변을 클릭해서 볼 수 있어요",
    "category": "tool",
    "kind": "upstream",
    "author": "claude-code-templates",
    "license": "MIT",
    "homepage": "https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/ui/agent-flow",
    "commands": [
      "/agent-flow"
    ],
    "requires": [],
    "notes": [
      "데스크톱 앱에서의 동작은 README·코드에 명시적 확인이 없어 이번 리뷰에서는 terminal만 표시했어요(테스트도 terminal surface 기준)",
      "순수 관찰용 mod예요. 모든 훅이 next(e) 결과를 그대로 통과시키고 $.agent.list·$.session.usage만 추가로 읽어요"
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "agent-quick-menu",
    "displayName": "퀵 메뉴",
    "summary": "설치된 플러그인들의 명령과 설정을 한 패널에 모아서 찾고 바로 실행하게 해줘요.",
    "category": "tool",
    "kind": "upstream",
    "author": "dasganni",
    "license": "MIT",
    "homepage": "https://github.com/agentic-workbench/agent-quick-menu",
    "commands": [
      "/menu"
    ],
    "requires": [],
    "notes": [
      "다른 플러그인의 명령을 대신 실행해 주는 구조라, 자기 플러그인이 아닌 명령은 두 번 눌러야(5초 내 재확인) 실행돼요.",
      "Claude Code 2.1.287 이상, macOS/Linux 터미널이나 데스크톱 Code 탭 기준이에요. VS Code 채팅 패널은 지원 안 하고 Windows는 저자가 테스트하지 않았다고 README에 적혀 있어요."
    ],
    "permissions": [
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "image-view",
    "displayName": "이미지 미리보기",
    "summary": "붙여넣은 이미지를 입력창 위에 썸네일로 보여줘요. [Image #1] 같은 표시 대신이에요.",
    "category": "tool",
    "kind": "upstream",
    "author": "gggodlin",
    "license": "MIT",
    "homepage": "https://github.com/GGGODLIN/cc-mod-image-view",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "now-playing",
    "displayName": "나우 플레잉",
    "summary": "macOS에서 Spotify로 재생 중인 곡과 가사를 입력창 위에 보여주고, 버튼이나 /music으로 재생·일시정지·이전·다음을 조작해요.",
    "category": "tool",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/now-playing",
    "commands": [
      "/music"
    ],
    "requires": [
      "macOS",
      "Spotify 데스크톱 앱"
    ],
    "notes": [
      "macOS가 아니면 session.start에서 uname -s로 확인해 명령 등록·폴링을 전혀 하지 않고 조용히 꺼져 있어요(Linux/Windows에서 아무 영향 없음)."
    ],
    "permissions": [
      "네트워크",
      "프로그램 실행"
    ]
  },
  {
    "name": "paste-view",
    "displayName": "붙여넣기 미리보기",
    "summary": "붙여넣은 이미지와 긴 텍스트를 입력창 위에서 바로 미리 보여줘요.",
    "category": "tool",
    "kind": "upstream",
    "author": "Clément Décou",
    "license": "MIT",
    "homepage": "https://github.com/Amorfx/claude-paste-view",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "pixel-player",
    "displayName": "픽셀 뮤직 플레이어",
    "summary": "mpv로 재생목록을 재생하면서 픽셀 아트 캐릭터가 음악에 맞춰 반응하는 패널을 보여줘요.",
    "category": "tool",
    "kind": "upstream",
    "author": "chrisluo5311",
    "license": "MIT",
    "homepage": "https://github.com/chrisluo5311/Pixel-Play",
    "commands": [
      "/music"
    ],
    "requires": [
      "mpv (필수. 없으면 설치 안내만 뜨고 재생되지 않아요)",
      "yt-dlp (유튜브 링크를 재생하려면 권장)"
    ],
    "notes": [
      "재생목록(`~/.claude/pixel-play/playlist.txt`)에 유튜브 링크·직접 오디오 URL·로컬 파일 경로를 한 줄씩 추가해요. mpv가 그 주소로 직접 접속해 재생할 뿐, 모드 자체가 다른 곳에 접속하지는 않아요.",
      "재생목록 파일은 플러그인 폴더가 아니라 `~/.claude/` 아래 저장돼 업데이트해도 유지돼요.",
      "재생 제어(일시정지·재개)는 로컬 유닉스 소켓(IPC)으로만 이뤄지고 네트워크를 쓰지 않아요.",
      "mpv 실행 인자 끝에 `--` 구분자가 없어서, 재생목록 줄이 `--`로 시작하면 mpv 옵션(예: `--script=`로 임의 Lua 스크립트 로드)으로 해석될 수 있어요. 재생목록은 본인이 직접 적는 로컬 파일이라 위험은 낮지만, 남이 준 재생목록 줄을 그대로 붙여넣지 않는 게 안전해요.",
      "Windows는 지원하지 않고 macOS에서만 테스트됐어요."
    ],
    "permissions": [
      "프로그램 실행",
      "파일 쓰기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "prompt-rail",
    "displayName": "프롬프트 레일",
    "summary": "세션에서 보낸 프롬프트들을 레일 하나로 모아 보여주고, 마우스를 올리면 읽고 클릭하면 그 지점으로 이동해요.",
    "category": "tool",
    "kind": "upstream",
    "author": "oikon48",
    "license": "MIT",
    "homepage": "https://github.com/oikon48/prompt-rail",
    "commands": [
      "/prompt-rail"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "대화 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "replay-theater",
    "displayName": "Replay 극장",
    "summary": "이번 턴에서 Claude가 고친 파일들을 한 스텝씩 diff로 넘겨보며 다시 볼 수 있어요.",
    "category": "tool",
    "kind": "upstream",
    "author": "Claude Code DevRel",
    "license": "Apache-2.0",
    "homepage": "https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/replay-theater",
    "commands": [
      "/replay"
    ],
    "requires": [],
    "notes": [
      "Write로 기존 파일을 덮어쓸 때는 그 파일의 원래 내용을 읽어와 diff를 만들어요(그 외 다른 파일은 읽지 않아요).",
      "리플레이 기록은 메모리에만 있어서 세션을 새로고침하면 사라져요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "session-wrapped",
    "displayName": "세션 랩드",
    "summary": "`/wrapped`로 이번 세션의 도구 호출·테스트·비용 통계를 애니메이션으로 보여주고, 공유용 PNG 카드를 데스크톱에 저장해요.",
    "category": "tool",
    "kind": "upstream",
    "author": "OneWave AI",
    "license": "MIT",
    "homepage": "https://github.com/OneWave-AI/claude-code-mods/tree/main/session-wrapped",
    "commands": [
      "/wrapped"
    ],
    "requires": [
      "python3"
    ],
    "notes": [
      "PNG 카드는 `~/Desktop`에 저장돼요.",
      "세션 종료 시 토스트 알림만 자동으로 뜨고, 실제 리캡 화면은 `/wrapped`를 직접 실행해야 열려요.",
      "통계는 전부 도구 호출 횟수·테스트 결과·토큰 사용량을 코드로 집계한 값이고, 요약 문구 생성에 모델을 쓰지 않아요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "taxi-blackbox",
    "displayName": "택시 블랙박스",
    "summary": "도구 호출을 블랙박스처럼 녹화해서, 오류나 거부 직전 상황을 /blackbox에서 돌려볼 수 있어요. 토큰·비밀번호는 가려서 기록해요.",
    "category": "tool",
    "kind": "upstream",
    "author": "개발동생 (devbrothers)",
    "license": "MIT",
    "homepage": "https://github.com/devbrother2024/devbrothers-mods",
    "commands": [
      "/blackbox"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "taxi-navi",
    "displayName": "택시 내비게이션",
    "summary": "할 일 목록을 내비게이션처럼 보여줘요. 진행 경로와 다음 안내가 표시되고, 계획이 바뀌면 경로를 다시 찾아줘요.",
    "category": "tool",
    "kind": "upstream",
    "author": "개발동생 (devbrothers)",
    "license": "MIT",
    "homepage": "https://github.com/devbrother2024/devbrothers-mods",
    "commands": [
      "/navi"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "환경·설정 읽기",
      "소리"
    ]
  },
  {
    "name": "done-alarm",
    "displayName": "작업 끝 알림",
    "summary": "오래 걸린 작업이 끝나거나 확인이 필요하면 맥 알림·한국어 음성·폰 푸시(ntfy·텔레그램·슬랙)로 알려줘요",
    "category": "automation",
    "kind": "original",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/done-alarm",
    "commands": [
      "/alarm"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "소리"
    ]
  },
  {
    "name": "agent-compact-advisor",
    "displayName": "컴팩트 타이밍 어드바이저",
    "summary": "지금이 /compact 하기 좋은 때인지 0~100점으로 상태줄에 보여주고, 압축할 때마다 목표·결정·남은 일을 지키는 보존 템플릿을 자동으로 넣어줘요.",
    "category": "automation",
    "kind": "upstream",
    "author": "apolenkov",
    "license": "MIT",
    "homepage": "https://github.com/apolenkov/agent-compact-advisor",
    "commands": [
      "/compact-advisor"
    ],
    "requires": [],
    "notes": [
      "P1(목표 달성 확률, 점수 비중 20)은 로컬 127.0.0.1:8010에 떠 있는 'Kev의 System One'이라는 별도 서비스가 있어야 값이 나와요. 없으면 조용히 빠지고 나머지 항목만으로 재계산돼요. 추가 설치 없이도 상태줄 점수·압축 보존 템플릿 같은 핵심 기능은 전부 동작해요.",
      "같은 저자의 다른 mod agent-shell-watch가 설치돼 있으면 백그라운드 작업(대기·실행 중)도 점수에 반영돼요. 없으면 그 부분이 '알 수 없음' 취급돼 점수가 60점에 캡돼요(정상 동작, 설치 필수 아님).",
      "리더오버 판정은 에이전트의 마지막 답변에서 정해진 접두어로 시작하는 줄만 봐요. 프롬프트에 '해야 할 일이 남아있다'는 식의 자연어 서술은 감지 못 해요(README에 명시된 한계)."
    ],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "auto-handoff",
    "displayName": "오토 핸드오프",
    "summary": "컨텍스트가 꽉 차기 전에 Haiku가 요약한 브리핑과 함께 새 대화로 넘겨주고, 필요하면 브리핑 페이지를 따로 열어볼 수 있어요.",
    "category": "automation",
    "kind": "upstream",
    "author": "Alex Hillman",
    "license": "MIT",
    "homepage": "https://github.com/alexknowshtml/claude-auto-handoff",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "파일 쓰기",
      "모델 호출",
      "도구 호출 제어",
      "프롬프트 입력",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "ctx-handoff",
    "displayName": "컨텍스트 핸드오프",
    "summary": "컨텍스트가 한계에 가까워지면 핸드오프를 만들어 새 대화로 넘겨주고, 자리를 비운 사이엔 프롬프트 캐시를 데워둬요.",
    "category": "automation",
    "kind": "upstream",
    "author": "cablate",
    "license": "MIT",
    "homepage": "https://github.com/cablate/ctx-handoff-mod",
    "commands": [
      "/handoff"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "파일 쓰기",
      "모델 호출",
      "프롬프트 입력",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "jev-skill-suggestion",
    "displayName": "스킬 자동 추천",
    "summary": "프롬프트마다 맞는 스킬 하나를 판단해 자동으로 불러오고 목록은 컨텍스트에서 빼요. API 키가 있으면 TypeSafe Jev로, 없으면 Claude 분류기로 판단해요",
    "category": "automation",
    "kind": "upstream",
    "author": "claude-code-templates",
    "license": "MIT",
    "homepage": "https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/productivity/jev-skill-suggestion",
    "commands": [
      "/jev-skill-suggestion:setup"
    ],
    "requires": [],
    "notes": [
      "API 키(typesafeApiKey 또는 gatewayApiKey)를 넣으면 프롬프트 전문과 후보 스킬 이름·설명, 선별된 스킬 SKILL.md 앞부분이 TypeSafe 서버로 전송돼요(저자가 코드 주석·README에 직접 명시한 사실)",
      "키가 없으면 Claude Code 자체 모델 분류기($.model.classify)를 프롬프트마다 호출해 사용자 Claude 사용량을 소모해요",
      "모든 실패 경로가 fail-open이에요. 요청 실패나 타임아웃(기본 800ms)이면 제안 없이 프롬프트를 그대로 통과시켜요",
      "/jev-skill-suggestion:setup은 mod가 직접 설정 파일을 쓰지 않고, Claude에게 변경 계획을 프롬프트로 건네 Claude의 Edit 도구로 사용자 확인을 거쳐 수정하게 해요"
    ],
    "permissions": [
      "네트워크",
      "모델 호출",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "next-steps",
    "displayName": "다음 할 일 제안",
    "summary": "턴이 끝날 때마다 다음에 보낼 법한 프롬프트 2~3개를 입력창 위에 제안하고, 숫자 키 하나로 바로 초안에 채워 넣어요.",
    "category": "automation",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/next-steps",
    "commands": [],
    "requires": [],
    "notes": [
      "같은 저장소의 where-am-i와 서로 인지하도록 짜여 있어요. next-steps 목록이 떠 있는 동안 where-am-i는 자기 '다음 할 일' 칸을 비워서 같은 내용이 중복 표시되지 않게 해요."
    ],
    "permissions": [
      "모델 호출",
      "대화 읽기"
    ]
  },
  {
    "name": "switchboard",
    "displayName": "스위치보드",
    "summary": "서브에이전트가 시작되기 전에 Haiku/Sonnet/Opus 중 가장 싼 모델을 골라주고, /route로 각 선택과 예상 비용을 보여줘요. API 키 없이도 규칙만으로 동작해요.",
    "category": "automation",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/switchboard",
    "commands": [
      "/route"
    ],
    "requires": [],
    "notes": [
      "이 저장소 22개 mod 중 대화 관련 데이터를 외부 제3자로 보낼 수 있는 유일한 mod예요. 반드시 사용자가 jevApiKey를 설정(/config)하거나 TYPESAFE_API_KEY/AI_GATEWAY_API_KEY 환경변수를 넣어야 작동하고, 기본값(키 없음)에서는 전송이 전혀 없이 로컬 규칙만 써요. jevApiKey는 plugin.json에 sensitive:true로 선언돼 있고, 설명 문구에도 '각 스폰마다 작업 설명과 처음 6,000자를 api.typesafe.ai로 보낸다'고 명시돼 있어요. k-mods의 '대화 내용을 기기 밖으로 보내는 기능은 기본값 꺼짐, 사용자가 켤 때만' 원칙을 만족해요.",
      "Jev 호출은 $.model.*이 아니라 $.http.fetch로 외부 유료 API를 직접 부르는 방식이라, 사용자의 Claude 사용량이 아니라 TypeSafe/Vercel AI Gateway 계정에 별도로 과금돼요(콜당 약 $0.00003, 2.5초 안에 답이 없으면 규칙으로 대체)."
    ],
    "permissions": [
      "네트워크",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "where-am-i",
    "displayName": "현재 상황 요약",
    "summary": "목표·지금 하는 일·내게 기다리는 것·다음 할 일을 입력창 위에 한눈에 보여주고, /where로 더 긴 요약도 볼 수 있어요.",
    "category": "automation",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/where-am-i",
    "commands": [
      "/where"
    ],
    "requires": [],
    "notes": [
      "같은 저장소의 next-steps와 서로 인지하도록 짜여 있어요. next-steps의 제안 목록이 떠 있는 동안에는 이 mod가 자기 '다음' 칸을 비워서 중복 표시를 피해요($.state로 next-steps.active를 읽음)."
    ],
    "permissions": [
      "모델 호출",
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "streamer-mode",
    "displayName": "스트리머 모드",
    "summary": "화면 공유·녹화할 때 토큰·이메일·전화번호·주민번호를 화면에서 가려요. Claude가 읽는 내용은 그대로예요",
    "category": "guard",
    "kind": "original",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/streamer-mode",
    "commands": [
      "/streamer"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "대화 읽기"
    ],
    "featured": true
  },
  {
    "name": "blast-radius-ko",
    "displayName": "위험 명령 브레이크",
    "summary": "rm -rf·force push·DB 초기화처럼 되돌릴 수 없는 명령을 실행 전에 멈추고, 무엇이 바뀌는지 보여준 뒤 물어봐요",
    "category": "guard",
    "kind": "patched",
    "author": "Anthropic",
    "license": "Apache-2.0",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/mods/blast-radius-ko",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어"
    ]
  },
  {
    "name": "secret-redactor",
    "displayName": "시크릿 리댁터",
    "summary": "도구 결과에 섞인 API 키·토큰·JWT·개인키·DB 접속 문자열을 모델이 읽기 전에 지우고, 지워진 자리표시를 다시 명령에 쓰면 막아요",
    "category": "guard",
    "kind": "upstream",
    "author": "claude-code-templates",
    "license": "MIT",
    "homepage": "https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/security/secret-redactor",
    "commands": [],
    "requires": [],
    "notes": [
      "화면만 가리는 k-mods streamer-mode와 달리 모델이 받기 전에 실제 값을 지워요. 단, 도구 결과만 대상이라 사용자가 직접 입력한 프롬프트 속 비밀값은 가리지 못해요",
      "tool.call 훅에 .catch가 없어요(validate 경고, gatingHooks hasCatch:false). 에러 시 fail-open인지 fail-closed인지는 엔진 내부 동작이라 코드만으로는 확정할 수 없어요",
      "조직 관리 설정(managed settings)에서 가장 먼저 실행되도록 앉혀야 다른 plugin이 원본 값을 보기 전에 가려져요(저자 권장)"
    ],
    "permissions": [
      "도구 호출 제어"
    ]
  },
  {
    "name": "secret-vault",
    "displayName": "시크릿 볼트",
    "summary": "사용자가 붙여넣거나 도구가 읽어온 API 키·이메일·IP 주소를 모델에게 보내기 전 자리표시로 가리고, 도구 실행 직전엔 원래 값으로 되돌려줘요.",
    "category": "guard",
    "kind": "upstream",
    "author": "Ray Amjad",
    "license": "MIT",
    "homepage": "https://github.com/ray-amjad/awesome-claude-code-function-hooks/tree/12b5fea27a4bd1b88cd9c9b6abc1efc0756c6625/plugins/secret-redactor",
    "commands": [],
    "requires": [],
    "notes": [
      "k-mods에는 이미 davila7/claude-code-templates 출처의 'secret-redactor'(도구 결과만 가리고 재사용을 막는 방식)가 등록돼 있어요. 이 mod(원래 이름도 secret-redactor라 이름이 겹쳐 secret-vault로 등록)는 그것과 달리 prompt.submit 훅으로 사용자가 직접 붙여넣은 값도 가리고, 가린 값을 도구 실행 직전에 원래대로 복원해 워크플로를 끊지 않는 점이 달라요. 두 mod가 겹치는 영역이 있으니 마케팅/운영 쪽에서 통합 여부를 검토해 보면 좋겠어요.",
      "README에는 'CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1이 필요하다'고 적혀 있지만(초기 early-access 시절 문구로 보여요), 2.1.291에서는 별도 설정 없이 validate가 바로 통과했어요."
    ],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기"
    ]
  },
  {
    "name": "taxi-speedcam",
    "displayName": "택시 과속카메라",
    "summary": "force push·rm -rf·DB 삭제·변경 폐기·운영 배포처럼 위험한 Bash 명령 앞에서 찰칵 찍고 물어봐요. 실행할지 세울지는 사용자가 정해요.",
    "category": "guard",
    "kind": "upstream",
    "author": "개발동생 (devbrothers)",
    "license": "MIT",
    "homepage": "https://github.com/devbrother2024/devbrothers-mods",
    "commands": [
      "/speedcam"
    ],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "소리"
    ]
  },
  {
    "name": "cc-pr-tracker",
    "displayName": "GitHub PR 트래커",
    "summary": "머지 상태·리뷰·필수 체크를 입력창 위에서 실시간으로 지켜보고, 바뀌면 토스트·소리로 알려줘요.",
    "category": "integration",
    "kind": "upstream",
    "author": "Seza Akgün",
    "license": "MIT",
    "homepage": "https://github.com/sezaakgun/cc-pr-tracker",
    "commands": [],
    "requires": [
      "gh CLI 설치 및 로그인"
    ],
    "notes": [
      "GitHub 접근은 전부 사용자의 `gh` CLI 인증을 그대로 써요. 별도 토큰을 저장하지 않아요.",
      "체크 이름·PR 제목처럼 GitHub에서 온 텍스트는 제어문자를 제거하고, Claude에게 보내는 알림 문구는 '자동 생성된 데이터'라고 명시해서 프롬프트 주입을 막아요.",
      "cmux라는 특정 환경(CMUX_BUNDLED_CLI_PATH 등)에서만 추가 알림을 보내고, 없으면 조용히 건너뛰어요.",
      "notifyClaude 설정이 켜져 있으면(기본값) PR 상태가 바뀔 때 Claude가 다음 턴에 읽는 안내 메시지를 대화에 추가해요. 끄려면 /config에서 notifyClaude를 꺼요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기"
    ]
  },
  {
    "name": "github-issues",
    "displayName": "GitHub 이슈 패널",
    "summary": "저장소의 GitHub 이슈를 카드로 보여주고 버튼 한 번으로 Claude에게 작업을 맡길 수 있어요.",
    "category": "integration",
    "kind": "upstream",
    "author": "Marco Carnevali",
    "license": "MIT",
    "homepage": "https://github.com/MarcoCarnevali/claude-code-mods/tree/4d6876e56e5225db26edf8eedcea467831592976/github-issues",
    "commands": [
      "/issues"
    ],
    "requires": [
      "GitHub CLI(gh), gh auth login으로 로그인 필요"
    ],
    "notes": [
      "gh가 없으면 설치·로그인 안내 메시지만 보여줘요.",
      "명시된 최소 Claude Code 버전은 README에 없었어요(일반적으로 2.1.287+ 전제인 mods 공통 틀을 따라요)."
    ],
    "permissions": [
      "프로그램 실행",
      "프롬프트 입력",
      "대화 읽기"
    ]
  },
  {
    "name": "glance",
    "displayName": "글랜스",
    "summary": "다음 회의·리뷰 요청된 PR·진행 중인 Linear 이슈·최근 Slack DM을 입력창 위 한 줄로 보여주고, /glance로 전체 목록을 확인해요.",
    "category": "integration",
    "kind": "upstream",
    "author": "Hamza Zafar",
    "license": "MIT",
    "homepage": "https://github.com/hamzafer/claude-code-mods/tree/main/mods/glance",
    "commands": [
      "/glance"
    ],
    "requires": [
      "gh CLI 로그인",
      "claude.ai Google Calendar 커넥터",
      "claude.ai Linear 커넥터",
      "claude.ai Slack 커넥터"
    ],
    "notes": [
      "원저장소 README가 이 mod를 '🔧 My setup (fork and adapt)' 섹션에 두고 '내 도구와 규칙을 중심으로 만들었으니 포크해서 자기 것으로 바꾸라'고 명시해요. gh + Google Calendar + Linear + Slack 네 가지를 모두 쓰는 팀에서만 전체 기능이 살아나고, 하나라도 없으면 그 칸만 조용히 빠져요. 범용성은 낮지만 해당 스택을 쓰는 한국 개발팀에는 실제로 유용하다고 판단해 등록해요.",
      "Slack에는 '나를 멘션' 전용 검색 필터가 없어서, 로그인한 사용자의 Slack id를 최초 1회 slack_read_user_profile로 조회해 메모리에만 보관하고 이후 검색 키워드로 재사용해요(디스크 저장·외부 전송 없음, README에도 명시된 동작)."
    ],
    "permissions": [
      "네트워크",
      "프로그램 실행"
    ]
  },
  {
    "name": "linear-board",
    "displayName": "Linear 보드 패널",
    "summary": "Linear 프로젝트·마일스톤·이슈를 패널로 보여주고, 계획·실행·제품 버튼으로 바로 프롬프트를 채워 넣어요.",
    "category": "integration",
    "kind": "upstream",
    "author": "linear-mod contributors",
    "license": "MIT",
    "homepage": "https://github.com/SaharCarmel/linear-mod",
    "commands": [
      "/linear"
    ],
    "requires": [
      "Linear API 키 (lin_api_...). /plugin configure 또는 LINEAR_API_KEY 환경 변수"
    ],
    "notes": [],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "프롬프트 입력",
      "대화 읽기",
      "환경·설정 읽기"
    ]
  },
  {
    "name": "linear-tickets",
    "displayName": "Linear 티켓 패널",
    "summary": "내게 배정된 Linear 티켓을 패널로 보여주고, 클릭하면 바로 작업을 시작할 수 있어요.",
    "category": "integration",
    "kind": "upstream",
    "author": "rjohnt",
    "license": "MIT",
    "homepage": "https://github.com/rjohnt/linear-claude-mod",
    "commands": [
      "/tickets"
    ],
    "requires": [
      "Linear MCP 서버 연결 (plugin.json 기본값 plugin:linear:linear)"
    ],
    "notes": [],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "프롬프트 입력"
    ]
  },
  {
    "name": "terminal-browser",
    "displayName": "터미널 브라우저",
    "summary": "클로드 코드 화면 안에 실제 브라우저를 띄워 웹사이트를 미리 보고, 에이전트가 직접 열고 닫게 해줘요. 브라우저 엔진은 별도 설치하는 terminal-browser 앱이 맡아요.",
    "category": "integration",
    "kind": "upstream",
    "author": "zenbu-labs",
    "license": "MIT",
    "homepage": "https://github.com/zenbu-labs/terminal-browser/tree/main/claude-code-plugin",
    "commands": [
      "/browser"
    ],
    "requires": [
      "terminal-browser CLI/앱 설치 (curl -fsSL https://terminal-browser.sh/install | bash 또는 brew install terminal-browser). Electron 기반 별도 프로그램, 이 플러그인 코드에는 포함되지 않음",
      "Kitty 그래픽 프로토콜을 지원하는 터미널(ghostty, kitty, 또는 libghostty 기반). 미지원 터미널·멀티플렉서(tmux 등)에서는 TUI가 깨질 수 있음"
    ],
    "notes": [
      "실제 브라우저 엔진(Electron+크로미움, 네이티브 입력 리스너)은 별도 설치되는 terminal-browser 앱에 있고, 이 mod는 그 앱을 띄워 로컬 HTTP로 통신하는 얇은 다리 역할만 해요. 그 앱은 `terminal-browser upgrade`로 독립적으로 업데이트되므로 여기 고정한 커밋과 무관하게 바뀔 수 있어요.",
      "terminal-browser 앱은 기본적으로 의사 익명 사용량·크래시 텔레메트리를 수집해요(`~/.local/state/terminal-browser-*/logs/telemetry.jsonl`에 평문 기록, `DO_NOT_TRACK=1` 등으로 끌 수 있음). 이 mod의 훅 코드 자체는 텔레메트리를 보내지 않아요.",
      "에이전트가 브라우저를 직접 열고 닫는 도구(`open`/`close`)는 `agentTool` 설정이 기본 꺼짐이라 기본값에서는 등록되지 않아요. 켜면 에이전트가 임의 URL을 열 수 있어요.",
      "명시된 최소 Claude Code 버전은 없어요. README는 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` 설정을 안내하는데, k-mods의 다른 리뷰(ko-ui)에서는 이 플래그가 2.1.285 이하에서만 필요하고 2.1.287부터 함수 훅이 기본 활성화라고 확인했어요. terminal-browser 쪽 안내가 구버전 기준일 가능성이 있고, 직접 실행 검증은 하지 않았어요."
    ],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "도구 호출 제어",
      "프롬프트 입력",
      "파일 읽기"
    ]
  },
  {
    "name": "vercel-deploy-status",
    "displayName": "Vercel 배포 현황",
    "summary": "연결된 Vercel 프로젝트의 배포 대기열을 프롬프트 위 밴드에 큐잉·빌드·완료 단계별로 보여줘요.",
    "category": "integration",
    "kind": "upstream",
    "author": "Ray Amjad",
    "license": "MIT",
    "homepage": "https://github.com/ray-amjad/awesome-claude-code-function-hooks/tree/12b5fea27a4bd1b88cd9c9b6abc1efc0756c6625/plugins/vercel-deploy-status",
    "commands": [],
    "requires": [
      "vercel CLI(PATH에 설치 및 로그인 필요, vercel whoami로 확인)",
      "저장소에 .vercel/project.json 연결 파일(vercel link로 생성)"
    ],
    "notes": [
      "CLI나 연결 파일이 없으면 디버그 로그에 한 줄만 남기고 조용히 아무 것도 그리지 않아요.",
      "README에는 'CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1이 필요하다'고 적혀 있지만(초기 early-access 시절 문구로 보여요), 2.1.291에서는 별도 설정 없이 validate가 바로 통과했어요."
    ],
    "permissions": [
      "프로그램 실행",
      "도구 호출 제어",
      "파일 읽기"
    ]
  },
  {
    "name": "korean-pack",
    "displayName": "한국어 팩",
    "summary": "메뉴·설정 번역(ko-ui)과 작업 상태 한국어(status-ko)를 한 번에 설치해 Claude Code 화면을 한국어로 바꿔요",
    "category": "bundle",
    "kind": "bundle",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/bundles/korean-pack",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "파일 읽기"
    ],
    "featured": true,
    "dependencies": [
      "ko-ui",
      "status-ko"
    ]
  },
  {
    "name": "starter",
    "displayName": "추천 세트",
    "summary": "처음이라면 이것부터: 모드 상점, 한국어 팩, 메모장, 컨텍스트 막대, 위험 명령 브레이크, 작업 끝 알림",
    "category": "bundle",
    "kind": "bundle",
    "author": "SeongGwangJu",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/bundles/starter",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "네트워크",
      "프로그램 실행",
      "파일 쓰기",
      "도구 호출 제어",
      "프롬프트 입력",
      "대화 읽기",
      "환경·설정 읽기",
      "파일 읽기",
      "소리"
    ],
    "dependencies": [
      "mod-store",
      "ko-ui",
      "status-ko",
      "memo-pad",
      "ctx-strip",
      "blast-radius-ko",
      "done-alarm"
    ]
  },
  {
    "name": "taxi-pack",
    "displayName": "택시팩",
    "summary": "Claude Code를 택시로: 미터기(요금·한도), 내비(할 일 경로), 과속카메라(위험 명령 확인), 블랙박스(도구 호출 녹화)를 한 번에 설치해요",
    "category": "bundle",
    "kind": "bundle",
    "author": "개발동생 (devbrothers)",
    "license": "MIT",
    "homepage": "https://github.com/SeongGwangJu/k-mods/tree/main/bundles/taxi-pack",
    "commands": [],
    "requires": [],
    "notes": [],
    "permissions": [
      "도구 호출 제어",
      "대화 읽기",
      "환경·설정 읽기",
      "소리"
    ],
    "dependencies": [
      "taxi-meter",
      "taxi-navi",
      "taxi-speedcam",
      "taxi-blackbox"
    ]
  }
]
