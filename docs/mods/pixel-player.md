# 픽셀 뮤직 플레이어

> mpv로 재생목록을 재생하면서 픽셀 아트 캐릭터가 음악에 맞춰 반응하는 패널을 보여줘요.

<img src="https://raw.githubusercontent.com/chrisluo5311/Pixel-Play/6ebf7296332bf19898f51bba8421a1e620588423/assets/demo/demo.gif" alt="픽셀 뮤직 플레이어" width="640">

| | |
| --- | --- |
| 설치 이름 | `pixel-player` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [chrisluo5311](https://github.com/chrisluo5311) |
| 라이선스 | MIT |
| 원본 | [chrisluo5311/Pixel-Play @ `6ebf729`](https://github.com/chrisluo5311/Pixel-Play/tree/6ebf7296332bf19898f51bba8421a1e620588423) |
| 유형 | 🧰 도구 |
| 보이는 곳 | 터미널 · 데스크톱 앱 |
| 명령어 | `/music` |
| 준비물 | mpv (필수. 없으면 설치 안내만 뜨고 재생되지 않아요), yt-dlp (유튜브 링크를 재생하려면 권장) |
| 권한 | ⚙️ 프로그램 실행 · ✏️ 파일 쓰기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install pixel-player@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install pixel-player@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 재생목록(`~/.claude/pixel-play/playlist.txt`)에 유튜브 링크·직접 오디오 URL·로컬 파일 경로를 한 줄씩 추가해요. mpv가 그 주소로 직접 접속해 재생할 뿐, 모드 자체가 다른 곳에 접속하지는 않아요.
- 재생목록 파일은 플러그인 폴더가 아니라 `~/.claude/` 아래 저장돼 업데이트해도 유지돼요.
- 재생 제어(일시정지·재개)는 로컬 유닉스 소켓(IPC)으로만 이뤄지고 네트워크를 쓰지 않아요.
- mpv 실행 인자 끝에 `--` 구분자가 없어서, 재생목록 줄이 `--`로 시작하면 mpv 옵션(예: `--script=`로 임의 Lua 스크립트 로드)으로 해석될 수 있어요. 재생목록은 본인이 직접 적는 로컬 파일이라 위험은 낮지만, 남이 준 재생목록 줄을 그대로 붙여넣지 않는 게 안전해요.
- Windows는 지원하지 않고 macOS에서만 테스트됐어요.

## 이 mod가 내 컴퓨터에서 하는 일

- ⚙️ **프로그램 실행**. 실행하는 프로그램: `/bin/rm`
- ✏️ **파일 쓰기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=music}`, `session.end`, `session.start`, `ui.render{component=Pane, requestId=pixel-player}`
- 부르는 API: `$.clock.after`, `$.clock.every`, `$.command.register`, `$.env.get`, `$.fs.exists`, `$.fs.read`, `$.fs.write`, `$.process.run`, `$.process.spawn`, `$.session.id`, `$.state.get`, `$.state.set`, `$.store.get`, `$.store.set`, `$.ui.open`, `$.ui.resolve`
- 읽는 환경 변수: `HOME`, `TMPDIR`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 5개 (코드를 읽으며 확인한 것)</summary>

- validate 통과, gatingHooks 없음(차단 가능한 훅 자체를 쓰지 않음). CLAUDE.md가 플러그인 루트에 있어 프로젝트 컨텍스트로 안 읽힌다는 validate 경고가 있으나(스킬로 옮기라는 안내) 동작에는 영향 없음.
- 네트워크 호출은 모드 코드 자체에는 없고, 사용자가 재생목록에 직접 추가한 URL을 mpv(+선택적으로 yt-dlp)가 재생할 때만 발생함. 음악 플레이어의 핵심 기능 그 자체임.
- mpv·yt-dlp는 /opt/homebrew/bin, /usr/local/bin, /usr/bin 세 경로에서만 찾아 PATH 주입 위험이 없고, 못 찾으면 설치 안내 문구만 보여줌.
- 일시정지·재개는 mpv의 로컬 유닉스 소켓에 `nc -U`로 JSON IPC 명령을 보내는 방식. 네트워크 아님.
- 세션 종료 시 재생 중이던 mpv 프로세스와 소켓 파일을 정리함.

</details>

## 더 보기

- [원본 저장소](https://github.com/chrisluo5311/Pixel-Play/tree/6ebf7296332bf19898f51bba8421a1e620588423)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
