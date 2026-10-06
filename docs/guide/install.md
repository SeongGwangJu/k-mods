# 설치 가이드

k-mods는 일반 Claude Code 플러그인 마켓플레이스예요. 그래서 설치·업데이트·제거가 전부 Claude Code의 `/plugin` 명령과 `claude plugin` 셸 명령으로 돼요. 이 글은 버전 확인부터 마켓플레이스 추가, 설치 범위(scope), 팀원과 함께 쓰는 법, 문제 해결까지 순서대로 정리해요.

## 목차

- [버전 확인](#버전-확인)
- [마켓플레이스 추가](#마켓플레이스-추가)
- [설치하기](#설치하기)
- [설치 범위(scope)](#설치-범위scope)
- [끄기·삭제하기](#끄기삭제하기)
- [세션에 바로 반영하기](#세션에-바로-반영하기)
- [설치된 mod 확인하기](#설치된-mod-확인하기)
- [설정값 넣기 (userConfig)](#설정값-넣기-userconfig)
- [최신 버전 유지하기](#최신-버전-유지하기)
- [팀원과 함께 쓰기](#팀원과-함께-쓰기)
- [문제 해결 체크리스트](#문제-해결-체크리스트)

## 버전 확인

mod가 로드되려면 최소 버전이 필요해요.

- **터미널**: Claude Code 2.1.287 이상. 셸에서 `claude --version`으로 확인해요.
- **데스크톱 앱**: 2.1.286 이상. Code 탭에서 `/status`를 입력하면 **Claude Code** 줄에 버전이 나와요.

버전이 낮으면 Claude Code나 데스크톱 앱을 업데이트한 뒤 다시 시도하세요.

공식 문서: [Turn mods on or off](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)

## 마켓플레이스 추가

k-mods를 설치하려면 먼저 마켓플레이스를 한 번 등록해야 해요. 세션 안에서 해도 되고, 셸에서 해도 돼요.

**세션 안에서**

```
/plugin marketplace add SeongGwangJu/k-mods
```

**셸에서** (세션을 열지 않고, 스크립트 등에서)

```bash
claude plugin marketplace add SeongGwangJu/k-mods
```

성공하면 `Successfully added marketplace: k-mods`가 떠요. 마켓플레이스 이름은 저장소 이름이 아니라 `marketplace.json`의 `name` 필드에서 오는데, k-mods는 둘이 같아요. 이후로는 `<mod 이름>@k-mods` 형태로 설치해요.

공식 문서: [Add a marketplace](https://code.claude.com/docs/en/plugins/install#add-a-marketplace)

## 설치하기

**세션 안에서**

```
/plugin install starter@k-mods
```

세션에서 `/plugin install`은 바로 설치하지 않고, 먼저 `/plugin` 패널에서 그 mod의 상세 정보(설명, 추가되는 명령·훅, 권한)를 보여줘요. 거기서 설치 범위를 고르면 그때 설치돼요.

**셸에서** (바로 설치)

```bash
claude plugin install starter@k-mods
```

k-mods가 미리 묶어 둔 세트도 있어요.

- `starter@k-mods`: 추천 세트. 모드 상점, 한국어 팩, 메모장, 컨텍스트 막대, 위험 명령 브레이크, 작업 끝 알림이 한 번에 깔려요.
- `korean-pack@k-mods`: 한국어 팩만 (메뉴·설정 번역 + 작업 상태 한국어).

하나씩 골라 설치하고 싶으면 `mod-store@k-mods`를 설치한 뒤 세션에서 `/k-mods`를 입력하세요. 카탈로그가 패널로 열리고, 버튼으로 설치·삭제할 수 있어요.

공식 문서: [Install a plugin](https://code.claude.com/docs/en/plugins/install#install-a-plugin)

## 설치 범위(scope)

설치할 때 세 범위 중 하나를 골라요. 범위는 "누가 이 mod를 받는지"와 "어느 설정 파일에 기록되는지"를 정해요.

| 범위 | 누가 받나요 | 기록되는 파일 |
| --- | --- | --- |
| user (사용자) | 이 컴퓨터의 모든 프로젝트에서 나만 | `~/.claude/settings.json` |
| project (프로젝트) | 이 저장소에서 작업하는 모두 | `.claude/settings.json` (커밋하는 파일) |
| local (로컬) | 이 저장소에서 나만 | `.claude/settings.local.json` (보통 커밋 안 함) |

셸에서는 `--scope user|project|local`로 고르고, 생략하면 `user`예요.

```bash
claude plugin install blast-radius-ko@k-mods --scope project
```

같은 mod가 여러 범위에 동시에 설정되면 **local > project > user** 순으로 우선해요. 예를 들어 프로젝트가 켜 둔 mod를 나만 끄고 싶으면 local 범위에서 끄면 돼요.

공식 문서: [Choose an install scope](https://code.claude.com/docs/en/plugins/install#choose-an-install-scope)

## 끄기·삭제하기

**세션 안에서**: `/plugin` → **Installed** 탭에서 항목을 고르면 **Disable plugin**, **Uninstall** 같은 메뉴가 나와요. `/plugin enable <mod>@k-mods`, `/plugin disable <mod>@k-mods`, `/plugin uninstall <mod>@k-mods`로 바로 열 수도 있어요.

**셸에서**

```bash
claude plugin disable blast-radius-ko@k-mods
claude plugin enable blast-radius-ko@k-mods
claude plugin uninstall blast-radius-ko@k-mods --scope project
```

`enable`·`disable`은 `--scope`를 생략하면 그 mod가 이미 설정된 범위를 자동으로 찾아요. `uninstall`은 생략하면 `user` 범위를 지워요.

프로젝트가 켜 둔 mod를 **Uninstall**하면 "나만 끌지, 전체에서 뺄지" 물어봐요. 나만 끄려면 `.claude/settings.local.json`에 `false`를 적는 쪽(디폴트 키 **y**)을, 전체에서 빼려면 공유 파일 자체를 바꾸는 쪽(**u**)을 고르면 돼요.

공식 문서: [Manage installed plugins](https://code.claude.com/docs/en/plugins/install#manage-installed-plugins)

## 세션에 바로 반영하기

셸에서 설치·업데이트·삭제했거나 `/plugin` 패널 밖에서 설정 파일을 바꿨다면, 열려 있는 세션에는 자동으로 반영되지 않아요. 세션 안에서 이렇게 입력하세요.

```
/reload-plugins
```

`/plugin` 패널을 닫을 때 바뀐 게 있으면 Claude Code가 알아서 `/reload-plugins`를 실행해 줘요. 단, 이번 리로드가 프롬프트 캐시를 깨뜨릴 수 있으면(MCP 서버가 추가·제거되는 경우 등) 바로 적용하지 않고 경고만 해요. 그럴 땐 `/reload-plugins --force`로 강제 적용할 수 있는데, 다음 요청 하나는 캐시 없이 처리돼서 비용이 더 들어요.

공식 문서: [/reload-plugins](https://code.claude.com/docs/en/plugins/cli-reference#reload-plugins)

## 설치된 mod 확인하기

세션 안에서 `/plugin`을 입력하면 탭 아래 흐린 글씨로 `N mods active · 이름1, 이름2`처럼 떠요. 이 줄에는 **내장 mod는 포함되지 않아요.** 설치했는데 이 줄에 이름이 안 보이면 로드에 실패한 거예요.

셸에서는 더 자세히 볼 수 있어요.

```bash
claude plugin list
claude plugin details mod-store
```

`plugin list`는 버전·범위·상태를 보여주고, `plugin details`는 그 mod가 추가하는 명령·훅·에이전트 목록과 컨텍스트 비용을 보여줘요.

공식 문서: [See which mods a session loaded](https://code.claude.com/docs/en/plugins/mods/overview#see-which-mods-a-session-loaded)

## 설정값 넣기 (userConfig)

일부 mod는 설치할 때 추가 값을 물어봐요 (API 주소, 토큰 등). 이 값들은 플러그인의 `userConfig`로 선언돼 있어요.

- **설치·활성화 시점**: 값이 비어 있으면 설정 대화상자가 자동으로 떠요.
- **나중에 다시 열기**: 세션에서 `/plugin configure <mod>@k-mods`를 입력해요.
- **한눈에 보기**: Claude Code 2.1.269 이상이면 `/config` 패널에 활성화된 mod마다 설정 행이 떠요. 단, 민감한 값(`sensitive`)이나 여러 개를 고르는 값(`multiple`)은 `/config`에 안 보여요.
- **셸에서 값 넣기**: 설치할 때 `--config key=value`를 붙이거나, 설치 후 아래처럼 JSON을 표준입력으로 흘려 넣어요.

```bash
echo '{"api_url": "https://example.com"}' | claude plugin configure my-mod@k-mods --values-stdin
```

민감한 값은 `settings.json`이 아니라 운영체제의 안전한 저장소(macOS 키체인 등)에 저장돼요.

공식 문서: [User configuration](https://code.claude.com/docs/en/plugins/manifest-reference#user-configuration)

## 최신 버전 유지하기

마켓플레이스마다 자동 업데이트 기본값이 달라요.

- **기본으로 켜짐**: Anthropic 공식 마켓플레이스 대부분
- **기본으로 꺼짐**: k-mods를 포함한 그 외 모든 마켓플레이스

k-mods는 자동 업데이트가 기본으로 꺼져 있으니, 최신 리뷰·버그 수정을 받으려면 가끔 아래 중 하나를 해 주세요.

- **세션에서 자동 업데이트 켜기**: `/plugin` → **Marketplaces** 탭 → `k-mods` 선택 → **Enable auto-update**
- **마켓플레이스 카탈로그만 새로고침** (새 mod 추가 여부 확인, 이미 설치한 mod는 그대로)

  ```bash
  claude plugin marketplace update k-mods
  ```

- **설치한 mod까지 한 번에 업데이트**: 세션에서 `/plugin` → **Marketplaces** 탭 → `k-mods` 선택 → **Update marketplace**
- **mod 하나만 업데이트**

  ```bash
  claude plugin update starter@k-mods
  ```

공식 문서: [Keep plugins updated](https://code.claude.com/docs/en/plugins/install#keep-plugins-updated)

## 팀원과 함께 쓰기

저장소에 설정을 커밋해 두면, 그 저장소를 여는 모든 팀원에게 k-mods 마켓플레이스가 자동으로 등록되고 지정한 mod가 "켜짐" 상태로 시작돼요. `.claude/settings.json`에 이렇게 적어서 커밋하세요.

```json
{
  "extraKnownMarketplaces": {
    "k-mods": {
      "source": { "source": "github", "repo": "SeongGwangJu/k-mods" }
    }
  },
  "enabledPlugins": {
    "starter@k-mods": true
  }
}
```

셸에서 한 번만 실행하면 이 파일이 자동으로 만들어져요.

```bash
claude plugin marketplace add SeongGwangJu/k-mods --scope project
claude plugin install starter@k-mods --scope project
```

**주의할 점**: `enabledPlugins`에 적힌 mod는 "켜짐" 상태가 될 뿐, 팀원의 컴퓨터로 자동 다운로드되지는 않아요. 저장소를 새로 받은 각 팀원은 한 번씩 아래 명령을 실행해야 실제로 설치돼요 (워크스페이스를 신뢰(trust)한 뒤).

```bash
claude plugin install starter@k-mods --scope project
```

이 과정을 생략하면 Claude Code가 "`.claude/settings.json`이 플러그인을 켜 뒀지만 설치되어 있지 않다"고 알려줘요.

공식 문서: [Register the marketplace for everyone in a repository](https://code.claude.com/docs/en/plugins/host-marketplace#register-the-marketplace-for-everyone-in-a-repository), [extraKnownMarketplaces](https://code.claude.com/docs/en/settings-reference#extraknownmarketplaces), [enabledPlugins](https://code.claude.com/docs/en/settings-reference#enabledplugins)

## 문제 해결 체크리스트

mod가 설치는 됐는데 아무 일도 안 일어나면, 위에서 아래로 확인해 보세요.

1. **버전이 너무 낮음**: `claude --version` 또는 데스크톱 앱의 `/status` 확인. [버전 확인](#버전-확인) 참고.
2. **워크스페이스를 아직 신뢰(trust)하지 않음**: 이 디렉터리에서 인터랙티브 세션을 한 번 열고 신뢰 확인창을 수락해야 mod가 로드돼요.
3. **`--bare`나 `--safe-mode`로 시작함**: 이 두 플래그는 설치된 mod를 전부 꺼요. 플래그 없이 다시 시작해 보세요.
4. **`disableAllHooks`가 설정됨**: 내 설정 파일이나 조직의 managed settings에 이 값이 `true`면 설치한 mod가 전부 꺼져요.
5. **조직 정책으로 막혀 있음**: 관리자가 `allowManagedModsOnly`를 켰다면 조직이 배포한 mod만 로드돼요. 자세한 내용은 [안전 가이드](safety.md)에 있어요.
6. **`/plugin`의 "N mods active" 줄에 이름이 없음**: 설치는 됐지만 로드에 실패한 거예요. `claude plugin validate <경로>`로 먼저 확인하거나, 아래 디버그 로그를 보세요.
7. **디버그 로그 확인**: 셸에서 아래처럼 실행하면 왜 안 뜨는지 이유가 로그에 한 줄로 남아요.

   ```bash
   claude --debug-file ./mod-debug.log --plugin-dir ./문제의-mod
   tail -f ./mod-debug.log | grep 문제의-mod
   ```

공식 문서: [Find out why a mod does nothing](https://code.claude.com/docs/en/plugins/mods/troubleshoot#find-out-why-a-mod-does-nothing), [Check whether mods can load](https://code.claude.com/docs/en/plugins/mods/troubleshoot#check-whether-mods-can-load)

---

더 알아보기: [mods가 뭔가요?](what-are-mods.md) · [안전 가이드](safety.md) · [나만의 mod 만들기](make-your-own.md) · [치트시트](cheatsheet.md) · [기여 가이드](../../CONTRIBUTING.md) · [README](../../README.md)
