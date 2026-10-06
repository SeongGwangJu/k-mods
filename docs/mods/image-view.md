# 이미지 미리보기

> 붙여넣은 이미지를 입력창 위에 썸네일로 보여줘요. [Image #1] 같은 표시 대신이에요.

| | |
| --- | --- |
| 설치 이름 | `image-view` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [gggodlin](https://github.com/GGGODLIN) |
| 라이선스 | MIT |
| 원본 | [GGGODLIN/cc-mod-image-view @ `1544b15`](https://github.com/GGGODLIN/cc-mod-image-view/tree/1544b15355515e240af30b3aa7cd8b3b0a899591) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | ⚙️ 프로그램 실행 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install image-view@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install image-view@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `id`, `mv`, `sh`
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `prompt.submit`, `session.start`, `ui.render{component=AbovePrompt}`, `ui.render{component=Pane, requestId=cc-image-view}`, `ui.render{component=UserMessage}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.env.get`, `$.fs.exists`, `$.fs.list`, `$.fs.read`, `$.fs.stat`, `$.process.run`, `$.prompt.read`, `$.session.cwd`, `$.session.id`, `$.session.root`, `$.state.get`, `$.state.set`, `$.ui.invalidate`, `$.ui.open`, `$.ui.resolve`
- 읽는 환경 변수: `CLAUDE_CODE_TMPDIR`, `CLAUDE_CONFIG_DIR`, `HOME`, `LANG`, `LC_ALL`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 6개 (코드를 읽으며 확인한 것)</summary>

- 출처 고지: NOTICE 파일에 따르면 jarrodwatts/claude-image-view(커밋 12795b62...)의 붙여넣기 썸네일 로직을 그대로 가져온 것으로, 원저작자 Jarrod Watts의 MIT 저작권 표시를 LICENSE·NOTICE에 그대로 유지하고 있음(플러그인 id만 cc-image-view로 바꿔 원본 image-view와 충돌 방지). MIT가 허용하는 적법한 재배포.
- 네트워크 호출 없음, 모델 호출 없음.
- 외부 프로그램 실행: $.process.run으로 (1) 'id -u', (2) 임시 폴더를 만들기 전 소유권·권한·심볼릭링크 여부를 셸 스크립트로 검증한 뒤 chmod 700(멀티유저 환경의 심링크·권한 공격 방지. 주석에 '컨버터는 신뢰 경계'라 명시), (3) sips/ffmpeg/magick/convert 중 설치된 것으로 jpg·gif·webp를 로컬에서 png로 변환, (4) mv -f로 원자적 파일 교체. 전부 로컬 파일 처리, 네트워크 없음.
- 파일 쓰기: 변환된 이미지를 /tmp/claude-<uid>/cc-image-view/<세션id>/ 아래에만 저장, 쓰기 전 권한 검증(umask 077, chmod 700).
- gating 훅: prompt.submit이 .catch 없이 등록되나, 드래프트에서 이미지 태그를 감지해 다음 그림을 준비하는 관찰용이며 차단 로직 없음.
- env 읽기: CLAUDE_CODE_TMPDIR, CLAUDE_CONFIG_DIR, HOME, LANG, LC_ALL(언어·경로 감지용). 기기 밖 데이터 전송 없음.

</details>

## 더 보기

- [원본 저장소](https://github.com/GGGODLIN/cc-mod-image-view/tree/1544b15355515e240af30b3aa7cd8b3b0a899591)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
