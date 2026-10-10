# spinner (한국 수정판)

Claude가 일하는 동안 입력창 위에 냥캣·Clawd 같은 픽셀 장면을 띄우고, 턴마다 자라는 펫을 키워요.
[hoobnn/hoobnn-agent-mods](https://github.com/hoobnn/hoobnn-agent-mods/tree/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner)의 spinner를 한국 사용자에게 맞게 고친 k-mods 수정판이에요.

<img src="https://raw.githubusercontent.com/hoobnn/hoobnn-agent-mods/8fb6f67cad9fd023cc7c06b7923518b4bbc45aea/claude-code/spinner/assets/nyan.gif" alt="냥캣 장면" width="640">

## 설치

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install spinner@k-mods
```

## 쓰는 법

설치하면 바로 동작해요. Claude가 일하는 동안 입력창 위 띠에 장면이 흘러가고, 턴이 끝나면 짧은 피날레가 나와요.

- `/spinner`: 지금 테마와 펫 상태, 사용법
- `/spinner <테마>`: 테마 고르기 (`nyan`, `clawd`, `thunder`, `chomp`, `dino`, `ocean` 등 15종, `random`)
- `/spinner off` / `on`: 애니메이션 끄기·켜기
- `/spinner companion on`: 입력창 위 펫 줄 켜기

## 원본과 다른 점

| | 원본 | 한국 수정판 |
| --- | --- | --- |
| 언어 | 자동 | 한국어 |
| 펫 줄(companion) | 켜짐 | 꺼짐 (장면 띠만) |
| 하단 Spinner 버튼 | 켜짐 | 꺼짐 (`/spinner off`로 충분) |
| 스피너 줄 앞 마스코트 | 그림 | 안 그림 (줄 앞 들여쓰기가 생겨서) |
| `random` 테마 | 14종 중 세션마다 | nyan·clawd·thunder·chomp 중 턴마다 |

모두 `/plugin configure spinner@k-mods` 또는 `/config`에서 원본처럼 되돌릴 수 있어요(마스코트와 random 범위는 코드 수정이라 제외). 자세한 내역은 [CHANGES-KO.md](CHANGES-KO.md)에 있어요.

## 권한 (이 mod가 내 컴퓨터에서 하는 일)

화면을 그리고 로컬 저장소(`$.store`)에 펫 상태를 저장해요. `audio` 테마를 고를 때만 macOS에서 `swiftc`로 작은 오디오 탭을 컴파일해 시스템 출력 소리의 크기만 읽어요. 네트워크는 쓰지 않아요.

## 출처·라이선스

원작: [hoobnn](https://github.com/hoobnn), [hoobnn/hoobnn-agent-mods](https://github.com/hoobnn/hoobnn-agent-mods) 커밋 `8fb6f67`의 `claude-code/spinner`. MIT 라이선스이며 원본 저작권 표기를 [LICENSE](LICENSE)에 그대로 뒀어요. 원본의 그림 파일(assets)은 담지 않고 원본 저장소 주소로 보여줘요.

테스트한 Claude Code 버전: 2.1.291
