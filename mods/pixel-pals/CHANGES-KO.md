# 원본 대비 변경 내역

pixel-pals는 원본 두 개를 합친 k-mods 수정판이에요.

- 장면·펫: [hoobnn/hoobnn-agent-mods](https://github.com/hoobnn/hoobnn-agent-mods) 커밋 `8fb6f67cad9fd023cc7c06b7923518b4bbc45aea`, 경로 `claude-code/spinner` (MIT)
- `tales` 테마: [plaxagoras/clawd-tales](https://github.com/plaxagoras/clawd-tales) 커밋 `89c7f95b4d4faf480a6ee200e92c3e6df34d1432` (MIT, 그림 일부는 Claude Fables(MIT)에서 왔다고 원본 NOTICE에 적혀 있어요)

이전에 k-mods에 `spinner`(한국 수정판)로 올렸던 것을 이름을 바꿔 이었어요. 그때 바꾼 내용(아래 1~4)도 그대로 남아 있어요.

## spinner에서 바꾼 것

1. `.claude-plugin/plugin.json`: 이름 `pixel-pals`, 버전 `1.0.0`. 기본값 `language` `auto` → `ko`, `companion` `true` → `false`, `footerButton` `true` → `false`. 설정 이름·설명을 한국어로. `theme` 선택지를 아래 7종으로.
2. `hooks/register.tsx` `turn.start`: `random`이면 턴마다 테마를 새로 고른다(원본은 세션마다).
3. `hooks/register.tsx` Spinner 사이트: 스피너 줄 앞 마스코트를 그리지 않는다(`SPINNER_MASCOT = false`). 줄 앞에 들여쓰기가 생겨서, 장면은 입력창 위 띠에서만 보여준다.
4. `hooks/themes.ts`: 테마를 clawd·thunder·chomp·sparky·bluecat·nyan 6종만 남겼다(cat·bunny·sakura·mecha·neon·dino·ocean·matrix·audio 제거). `tales`를 더하고 `random`은 7종 전부에서 고른다.
5. audio 테마 제거: `hooks/audio.ts`, `hooks/audio-tap.swift`, 탭 실행(`$.process`)과 관련 상태(`tap`)를 뺐다. 그래서 프로그램 실행 권한이 없다.
6. hud 연동 제거: hud의 `dock` 상태를 읽지 않고 `hud.petPats` 훅을 뺐다. 이름이 바뀌어 hud가 이 mod의 펫을 찾을 수 없어서다. 펫은 늘 이 mod가 그린다.
7. 상태·설정 이름 `spinner.*` → `pixel-pals.*`, 명령 `/spinner` → `/pals`, 하단 버튼 이름 `Spinner` → `Pals`.
8. `hooks/i18n.ts`: 한국어 문구를 해요체로 다듬고 "세션마다 무작위"를 "턴마다 무작위"로 고쳤다(영어도). `cmd.talesPreview`를 더하고, 지금 언어를 읽는 `lang()`을 내보낸다.
9. `hooks/pets.ts`: audio 펫을 빼고 `tales`는 Clawd 펫을 쓴다.

## clawd-tales에서 바꾼 것

1. `hooks/register.tsx`, `hooks/art.ts`, `hooks/story.ts`를 `hooks/tales/`로 옮겼다. 상태 이름 `clawd-tales.*` → `pixel-pals.*`(키는 원본 그대로, 장면 쪽과 겹치지 않는다), 타입 경로를 맞췄다.
2. 입력창 위 띠(AbovePrompt): 장면 쪽 `register.tsx`의 `talesOnly()`가 감싸서, 테마가 `tales`이고 숨김·띠 끄기·미리 보기가 아닐 때만 그린다. 다른 이벤트는 그대로 받아 이야기(성장·날씨·동료)를 이어 간다.
3. 화면 문구(캡션·알림·`/tales` 응답)를 `tr(영어, 한국어)`로 감쌌다. 언어가 `ko`면 한국어, 아니면 원본 영어. 이야기 로직과 그림은 바꾸지 않았다.

## 테스트

- `tests/scenes.test.tsx`: 원본 spinner 테스트를 원본 기본값(`UPSTREAM`)으로 돌린다. audio 테스트를 빼고, 지운 테마를 쓰던 테스트는 남은 테마로 바꿨다. 6종 + tales와 random 범위 테스트를 더했다.
- `tests/tales.test.ts`: 원본 clawd-tales 테스트를 `theme: 'tales'`, `language: 'en'`으로 그대로 돌리고, 한국어 캡션 테스트를 더했다.
- 원본 그림 파일(assets)은 담지 않았다. 미리보기는 k-mods가 직접 찍은 `docs/assets/mods/pixel-pals.gif`.
