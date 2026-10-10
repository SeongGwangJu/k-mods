# spinner

> Claude가 일하는 동안 입력창 위에 냥캣·Clawd 같은 픽셀 장면을 표시하고 펫을 키워요. 한국어·간결한 기본값으로 고친 수정판이에요

<img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner/assets/nyan.gif" alt="spinner" width="640">

| | |
| --- | --- |
| 설치 이름 | `spinner` |
| 종류 | 한국 수정판 |
| 만든 사람 | [hoobnn](https://github.com/hoobnn) |
| 라이선스 | MIT |
| 원본 | [hoobnn/hoobnn-agent-mods/claude-code/spinner @ `8fb6f67`](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/spinner` |
| 준비물 | swiftc/Xcode Command Line Tools (오디오 테마 전용, macOS 14.2+ 및 '시스템 오디오 녹음' 권한 필요) |
| 권한 | ⚙️ 프로그램 실행 · 🛡️ 도구 호출 제어 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install spinner@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install spinner@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 원본과 다른 기본값: 한국어, 펫 줄 꺼짐, 하단 버튼 꺼짐, 스피너 줄 앞 마스코트 없음, random은 nyan·clawd·thunder·chomp 중 턴마다. 자세한 내용은 mod 설명서의 "원본과 다른 점"에 있어요.
- `theme`를 audio로 바꾸면 첫 실행 시 `swiftc`로 `audio-tap.swift`를 로컬 컴파일해 실행하고, macOS Core Audio로 시스템 출력 소리의 레벨만 읽어 보여줘요(macOS 14.2+, 터미널에 '시스템 오디오 녹음' 권한 허용 필요). 저장·전송은 하지 않지만 Xcode Command Line Tools가 필요해요.
- 터미널이 느리거나 저전력 환경이면 `reducedMotion`을 켜서 마스코트·밴드·펫을 정지 이미지로 바꿀 수 있어요.
- 같은 작성자(hoobnn)의 `hud` 모드를 함께 쓰면 펫을 hud 쪽에 표시하고 쓰다듬은 횟수를 공유해요. `hud`가 없어도 정상 동작해요(안전한 no-op).
- `language: ko`는 `/spinner` 응답과 레벨업·피날레 문구까지 전부 한국어로 번역되어 있어요(자리표시자 아님).

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `swiftc`
- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=spinner}`, `prompt.edit`, `prompt.submit`, `session.start`, `state.set{plugin=hud, key=petPats}`, `tool.call`, `tool.check`, `turn.complete`, `turn.start`, `ui.message`, `ui.render{component=AbovePrompt}`, `ui.render{component=SessionMode}`, `ui.render{component=Spinner}`
- 부르는 API: `$.clock.after`, `$.clock.now`, `$.command.register`, `$.config.set`, `$.env.get`, `$.fs.stat`, `$.process.run`, `$.process.spawn`, `$.settings.read`, `$.state.get`, `$.state.set`, `$.store.delete`, `$.store.get`, `$.store.set`, `$.ui.ask`, `$.ui.resolve`, `$.ui.toast`
- 읽는 환경 변수: `LANG`, `LC_ALL`, `LC_MESSAGES`

</details>

## 검토 기록

- 2026-10-07 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기, 테스트

<details><summary>검토 노트 8개 (코드를 읽으며 확인한 것)</summary>

- `scripts/cc.sh plugin validate --json`와 `--strict` 모두 success:true, errors/warnings 없음으로 통과(직접 실행 확인).
- `tool.call`·`tool.check`·`state.set{plugin=hud,key=petPats}`·`prompt.submit` 4개가 `.catch` 없는 gating hook으로 표시되지만, register.tsx 전체를 읽은 결과 네 훅 모두 `next(e)`의 결과를 그대로 반환할 뿐 승인·거부·응답 내용을 바꾸지 않는 순수 관찰용(펫 상태 표시, 쓰다듬기 집계)이다. 실제로 툴 실행을 막거나 사용자 입력을 바꾸는 코드는 없음.
- 다만 `.catch`가 없어 훅 내부 코드(모두 `$.state`/`$.store` 같은 신뢰된 엔진 API 호출)가 예외를 던지면 체인에 그대로 전파된다. 특히 `prompt.submit`은 `next(e)` 호출 전에 상태를 읽어 그 읽기가 실패하면 이론상 prompt 제출을 막을 수 있다(fail-closed 가능성, 코드상 발생 가능성은 낮음). 이 저장소의 `cc.sh`(v2.1.291)는 `--strict`를 '경고→오류 승격'으로만 정의하고 .catch 없는 gating hook은 note로만 남겨, 실제 `--strict` 실행도 success:true였다(직접 테스트로 확인).
- `audio` 테마는 최초 사용 시 `$.process.run(['swiftc','-O'...])`으로 `hooks/audio-tap.swift`를 로컬 컴파일해 `hooks/audio-tap` 바이너리를 만들고 `$.process.spawn`으로 자식 프로세스 실행한다. 이 바이너리는 macOS Core Audio Process Tap(`CATapDescription`, macOS 14.2+)으로 시스템 출력 오디오 전체를 탭하며(마이크 아님) 50ms마다 음량·대역 숫자만 stdout으로 내보내고 파일 저장·네트워크 전송은 코드상 전혀 없다. 첫 실행 시 '시스템 오디오 녹음' 권한 허용이 필요할 수 있다. `OPT_IN` 테마 목록에 포함돼 `random`으로는 절대 선택되지 않는다(이름으로 명시해야만 실행).
- `state.set{plugin=hud,key=petPats}` 훅은 같은 작성자(hoobnn)의 별도 플러그인 `hud`의 상태 변경을 가로채 spinner 자신의 펫에 XP를 더하는 의도된 동일 작성자 간 연동이다(types/index.d.ts 주석에 'Kept alike in spinner's and hud's contracts'로 명시). `hud` 미설치 시 해당 이벤트 자체가 발생하지 않아 훅이 호출되지 않는 안전한 no-op이고, spinner가 읽는 `hud.dock` 상태도 기본값 false로 안전 처리된다.
- hooks/ 전체에서 `$.http.fetch`를 포함해 http·fetch·axios·XMLHttpRequest·WebSocket 패턴을 grep으로 전수 조사했으나 전혀 없음. 네트워크 호출 코드 경로 없음.
- pet의 xp·love는 `$.store`(플러그인 전용 로컬 저장소)에만, 설정값은 `$.config.set`(`/config` 행)에만 기록된다. plugin 상태 범위를 벗어난 파일 쓰기는 audio 테마의 swiftc 컴파일 산출물(`hooks/audio-tap` 바이너리, 플러그인 자신의 폴더 내)이 유일하며 사용자 데이터가 아니다. `language: ko`는 i18n.ts에 상태·명령·피날레·펫 대사 전체가 번역된 완전 구현이며, LANG/LC_ALL/LC_MESSAGES 환경변수는 로캘 기반 언어 자동판별에만 쓰인다.
- 명령은 `/spinner` 하나만 등록되고 off/on/theme/stage/companion/pet/preview는 전부 그 인자로 처리된다(command.ts). 렌더링은 Unicode 반각블록 문자 기반 자체 드로잉으로 Raster/Image 컴포넌트나 이미지 로딩 코드가 없어 surfaces는 terminal만 해당하며, `$.ui.resolve(e)`가 'Client' 미지원 surface를 돌려주면 `next(e)`로 원래 UI를 그대로 통과시켜 데스크톱 등에서 안전하게 저하된다. assets/의 GIF·PNG는 런타임에 로드되지 않는 문서용 캡처로 보인다.

</details>

## 더 보기

- [mod 설명서](../../mods/spinner/README.md)
- [원본 저장소](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
