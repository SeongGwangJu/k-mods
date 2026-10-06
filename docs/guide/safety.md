# mod를 안전하게 쓰는 법

mod는 샌드박스 없이 내 권한으로 Claude Code 안에서 돌아요. 그래서 설치하기 전에 뭘 할 수 있는지 알아 두는 게 중요해요. 이 글은 mod가 닿을 수 있는 범위, 설치 전 직접 확인하는 법, k-mods가 검토하는 기준과 권한 라벨, 조직 관리자가 쓸 수 있는 통제, 조심해야 할 신호를 정리해요.

## 목차

- [mod는 샌드박스가 없어요](#mod는-샌드박스가-없어요)
- [설치 전에 직접 확인하기](#설치-전에-직접-확인하기)
- [k-mods가 검토하는 방식](#k-mods가-검토하는-방식)
- [권한 라벨](#권한-라벨)
- [k-mods mod 페이지 읽는 법](#k-mods-mod-페이지-읽는-법)
- [회사·조직에서 쓸 때](#회사조직에서-쓸-때)
- [이런 mod는 조심하세요](#이런-mod는-조심하세요)

## mod는 샌드박스가 없어요

mod가 한 번 로드되면 이런 걸 할 수 있어요.

- **내 컴퓨터에서 나처럼 행동**: 내 계정이 닿는 어디든 파일을 읽고 쓰고, 프로그램을 실행하고, 네트워크 요청을 보내요.
- **내 비밀 정보 읽기**: 환경변수와 설정 파일을 읽어요. 거기 든 API 키도 포함돼요.
- **내 세션을 봄**: 내가 보내는 모든 프롬프트와 Claude가 호출하는 모든 도구를 봐요.
- **내 세션을 바꿈**: 프롬프트나 도구 호출을 고쳐 쓰거나, 내가 친 것처럼 프롬프트를 대신 보내거나, 내 다른 세션에 메시지를 보낼 수 있어요.
- **묻지 않고 행동**: 사용자에게 묻기도 전에 도구 호출을 승인할 수 있어요.
- **내 사용량을 씀**: 내 플랜이나 API 키로 모델을 호출해요.

[샌드박싱](https://code.claude.com/docs/en/sandboxing)을 켜 놨어도 mod는 영향받지 않아요. 샌드박스는 Claude가 실행하는 Bash 명령만 격리하고, mod가 직접 띄운 프로세스는 샌드박스 밖에서 돌아요.

도구 호출을 승인하는 mod는 `ask` 규칙이 물어볼 호출이나, 내 `PreToolUse` 훅이 막은 호출도 대신 승인할 수 있어요. 더 나아가 **managed settings가 없고 Team·Enterprise 플랜으로 로그인하지 않은 개인 사용자**라면, 내장 가드(`sec-default@builtin`)가 아예 로드되지 않기 때문에 `deny` 규칙으로 막아 둔 호출까지 mod가 뒤집어 승인할 수 있어요. 다만 mod는 Claude Code의 **권한 확인 대화상자 자체는 못 바꿔요.** 사용자에게 뭘 보여줄지는 조작할 수 없어요. (공식 문서: [Extend permissions with hooks](https://code.claude.com/docs/en/permissions#extend-permissions-with-hooks))

공식 문서: [Decide whether to trust a mod](https://code.claude.com/docs/en/plugins/mods/overview#decide-whether-to-trust-a-mod), [Know what happens by default](https://code.claude.com/docs/en/plugins/mods/admin#know-what-happens-by-default)

## 설치 전에 직접 확인하기

마켓플레이스에서 바로 설치하기 전에, 그 mod가 받는 이벤트와 부르는 API를 실행 없이 볼 수 있어요. 저장소를 복제한 뒤 셸에서 실행하세요.

```bash
claude plugin validate ./some-mod
```

```text
  ❯ ./register.js hooks: session.start, tool.call, ui.render{component=Pane}
  ❯ ./register.js calls: $.fs.read, $.http.fetch, $.store.set, $.ui.open
```

`calls:` 줄에서 특히 눈여겨볼 항목이에요.

| 호출 | 뜻 |
| --- | --- |
| `$.fs.read`, `$.fs.write` | 내 계정이 닿는 어디든 파일을 읽거나 써요 |
| `$.process.run`, `$.process.spawn` | 내 권한으로 프로그램을 실행해요 |
| `$.http.fetch` | 네트워크 요청을 보내요 |
| `$.env.get`, `$.settings.read` | 환경변수·설정을 읽어요. API 키가 들어 있을 수 있어요. 출력의 `env reads:` 줄에 어떤 변수인지 나와요. |
| `$.env.set` | 환경변수를 설정해요. 이후 Claude Code가 실행하는 모든 명령·MCP 서버에 영향을 줄 수 있어요. `env writes:` 줄에 어떤 변수인지 나와요. |
| `$.mcp.call` | 연결된 MCP 서버의 도구를 세션 권한 규칙 아래에서 불러요 |
| `$.model.complete` | 내 플랜이나 API 키로 모델을 호출해요 |
| `$.prompt.submit` | 프롬프트를 대신 보내요. 내가 친 것처럼 보낼 수도 있어요 |
| `$.session.send` | 다른 세션이나 서브에이전트의 Claude가 읽는 메시지를 보내요 |

`hooks:` 줄에서는 이런 게 중요해요. `tool.call`과 `prompt.submit`은 모든 도구 호출과 프롬프트를 보고 바꿀 수 있다는 뜻이고, `session.append`는 대화의 각 줄을 저장되기 전에 고쳐 쓸 수 있다는 뜻이에요. `ui.render{component=AskUserQuestion}`는 Claude가 사용자에게 묻는 대화상자를 다시 그릴 수 있다는 뜻이고, `tool.check`는 권한 확인창이 뜨기도 전에 도구 호출을 승인·거부할 수 있다는 뜻이에요.

공식 문서: [Review what a mod can do](https://code.claude.com/docs/en/plugins/mods/admin#review-what-a-mod-can-do)

## k-mods가 검토하는 방식

k-mods 카탈로그에 올라온 mod는 설치하기 전에 이런 과정을 거쳐요.

1. **라이선스 게이트**: 라이선스가 없는 저장소의 코드는 작성자 허락을 받기 전엔 올리지 않아요.
2. **커밋 고정(`sha`)**: 원본을 그대로 가져오는 mod는 검토한 시점의 정확한 커밋을 고정해 둬요. 원본 저장소가 나중에 바뀌어도, 내가 받는 건 검토한 그 코드 그대로예요. 업데이트는 다시 검토한 뒤에만 올려요.
3. **정적 분석 + 코드 읽기**: `claude plugin validate`를 통과하는지 확인하고, 사람이 코드 전체를 읽어요(`code-read`). mod에 테스트가 있으면 통과하는지도 보고(`unit-test`), 화면을 그리는 mod는 실제 세션에서 한 번 띄워 확인해요(`live-session`). 각 mod 페이지의 "검토 방법"에 어떤 과정을 거쳤는지 나와요.
4. **권한 라벨 표시**: 정적 분석으로 찾은 호출을 바탕으로 이 mod가 내 컴퓨터에서 하는 일을 라벨로 붙여요. 아래 [권한 라벨](#권한-라벨) 참고.
5. **업데이트 때 재검토**: 버전이 올라간 mod는 처음 올릴 때와 같은 과정을 다시 거쳐요.
6. **작성자 요청 시 삭제**: 원작자가 내려 달라고 하면 바로 카탈로그에서 빼요.

공식 문서: [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)

## 권한 라벨

각 mod 페이지에는 정적 분석으로 찾아낸 권한이 라벨로 붙어요. 위험한 것부터 나열했어요.

| 라벨 | 뜻 |
| --- | --- |
| 🌐 네트워크 | `$.http`나 `$.mcp`로 인터넷이나 외부 서버와 통신해요. 대화 내용이 나갈 수도 있으니 목적지를 확인하세요 |
| ⚙️ 프로그램 실행 | `$.process`로 내 컴퓨터에서 프로그램을 실행해요 |
| ✏️ 파일 쓰기 | `$.fs.write`로 파일을 써요 |
| 🤖 모델 호출 | `$.model`로 모델을 불러요. 내 사용량을 써요 |
| 🛡️ 도구 호출 제어 | `tool.call`이나 `tool.check` 훅으로 도구 호출을 막거나 대신 답할 수 있어요 |
| 💬 프롬프트 입력 | `$.prompt.submit`이나 `$.prompt.fill`로 프롬프트를 대신 넣거나 보내요 |
| 👀 대화 읽기 | `prompt.submit`·`turn.complete`·`session.append` 훅이나 대화를 그리는 화면, `$.session.messages`로 대화 내용에 닿아요 |
| 🔑 환경·설정 읽기 | `$.env`나 `$.settings`를 읽어요 |
| 📂 파일 읽기 | `$.fs.read` 계열로 파일을 읽어요 |
| 📨 세션 메시지 | `$.session.send`로 다른 세션에 메시지를 보내요 |
| 🔊 소리 | `$.audio`로 소리를 내요 |
| 🎨 화면만 | 위 어느 것도 안 하고 화면만 그려요 |

**라벨 읽는 법.** 화면을 그리는 mod는 거의 다 👀(대화 읽기)가 붙어요. 턴이 끝났다는 신호만 받아도 Claude의 마지막 답변이 함께 들어오기 때문이에요. 그래서 👀 하나만으로 걱정할 필요는 없어요. 정말 볼 것은 **조합**이에요. 👀가 있어도 🌐(네트워크)·⚙️(프로그램 실행)·💬(프롬프트 입력)이 없으면 그 mod는 대화를 기기 밖으로 내보낼 방법이 없어요. 💬는 Claude에게 대신 보내 달라고 시키는 우회로가 될 수 있어서 함께 봐요. 반대로 👀와 🌐가 함께 있으면 mod 페이지의 "코드에 있는 주소"와 검토 노트에서 어디로 무엇을 보내는지 꼭 확인하세요.

한 mod에 라벨이 여러 개 붙을 수 있어요. 라벨이 없다면 화면만 바꾸는 mod라는 뜻이에요.

## k-mods mod 페이지 읽는 법

각 mod 페이지(또는 `/plugin`에서 보는 상세 정보)에서 이런 걸 확인하세요.

- **종류(`kind`)**: `오리지널`(k-mods가 처음부터 만듦), `한국 수정판`(원본을 k-mods가 고침), `원본`(원본 그대로, 커밋만 고정), `묶음`(다른 mod 여러 개를 모은 설치 세트)
- **권한 라벨**: 위 표의 라벨들
- **검토 기록**: 검토 날짜, 검토에 쓴 Claude Code 버전, 검토 방법(`validate`/`code-read`/`unit-test`/`live-session`), 검토 중 발견한 점(네트워크 목적지, 외부 프로그램 실행 등)
- **출처**: 원본 mod라면 원작자 저장소와 고정된 커밋 링크. 수정판이면 원본과 무엇을 바꿨는지

의심스러운 점이 있으면 설치 전에 `claude plugin validate <복제한 폴더>`로 직접 한 번 더 확인해 보세요.

## 회사·조직에서 쓸 때

회사 Claude Code 환경이라면 관리자가 mod 정책을 따로 둘 수 있어요.

- **`allowManagedModsOnly`**: 켜져 있으면 사용자가 설치한 mod는 전혀 로드되지 않고, 조직이 배포한 mod와 Claude Code 내장 mod만 돌아요. k-mods mod도 이 정책 아래에서는 로드되지 않을 수 있어요.
- **`prependPlugins`/`appendPlugins`**: 조직의 정책 mod를 사용자 mod보다 먼저(또는 나중에) 실행하도록 순서를 정해요.
- **`sec-default@builtin`**: managed settings가 있거나 Team·Enterprise 플랜으로 로그인한 경우, 사용자가 설치한 모든 mod보다 먼저 로드되는 내장 가드예요. 조직이 관리하는 시스템 프롬프트, managed `CLAUDE.md`, managed MCP 서버의 도구·설명은 사용자 mod가 못 건드리게 지켜 줘요. 그 외에는 따로 막지 않아요.

회사 환경에서 특정 k-mods mod가 안 뜨면, 먼저 이 정책들 때문인지 확인해 보세요. 관리자 쪽 설정 방법은 공식 문서에 있어요.

공식 문서: [Manage mods for your organization](https://code.claude.com/docs/en/plugins/mods/admin)

## 이런 mod는 조심하세요

- `calls:` 줄에 `$.http.fetch`나 `$.process.run`이 있는데, 설명 어디에도 왜 필요한지 안 적혀 있어요.
- `hooks:` 줄에 `prompt.submit`이나 `session.append`가 있는데, 대화 내용을 기기 밖으로 보내지 않는다는 설명이 없어요.
- `tool.check`처럼 도구 호출을 승인·거부할 수 있는 mod인데, 소스가 비공개거나 어떤 커밋을 받는지 알 수 없어요.
- 라이선스가 아예 없는 저장소의 코드예요.
- 토큰이나 비밀번호를 받으면서 `userConfig`의 `sensitive` 표시 없이 평문으로 저장해요.
- "화면만 바꾼다"는 설명인데 🌐 네트워크나 ⚙️ 프로그램 실행 라벨이 붙어 있어요. 설명과 권한이 안 맞으면 코드를 더 읽어 보는 게 좋아요.

---

더 알아보기: [mods가 뭔가요?](what-are-mods.md) · [설치 가이드](install.md) · [나만의 mod 만들기](make-your-own.md) · [치트시트](cheatsheet.md) · [기여 가이드](../../CONTRIBUTING.md) · [README](../../README.md)
