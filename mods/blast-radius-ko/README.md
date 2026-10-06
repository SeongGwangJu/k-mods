# Blast Radius (한글판)

위험한 명령(`rm -rf`, `git reset --hard`, 강제 푸시, DB를 지우는 명령 등)을 Claude가 실행하기
전에 멈추고, 무엇이 사라지는지 먼저 보여줘요. 실행 또는 취소를 누르기 전까지는 아무것도
바뀌지 않아요.

## 설치

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install blast-radius-ko@k-mods
```

## 쓰는 법

따로 켤 것이 없어요. 설치하면 바로 켜져서, Claude가 아래 같은 명령을 Bash로 실행하려 할 때마다
확인창을 띄워요.

- `실행` (단축키 `1`). 명령을 그대로 진행해요.
- `취소` (단축키 `2`, 기본 선택). 명령을 거절해요. Claude는 거절 사유를 읽고 다른 방법을
  먼저 물어봐요.
- 10분 안에 아무 응답이 없으면 자동으로 취소돼요.

## 설정 (`/config` 또는 `/plugin configure blast-radius-ko@k-mods`)

| 설정 | 기본값 | 설명 |
|---|---|---|
| `palette` | `dark` | 확인창 색. `dark`는 어두운 터미널용 파스텔, `theme`은 Claude Code 테마 키(밝은 터미널), `gray`는 회색 배경(`#bdbec6`) 터미널용 짙은 색이에요. |

## 어떻게 동작하나요

Claude가 Bash 도구를 부를 때마다 명령 한 줄을 먼저 읽고, 아래 목록과 비슷하면 실제로 실행되기
*전에* 멈춰요. 멈춘 동안 그 명령이 어디서, 무엇을 건드릴지(어떤 파일이 몇 개 지워지는지,
어떤 커밋이 사라지는지 등)를 알아낸 뒤 확인창에 보여줘요. 확인창(패널)을 띄울 자리가 없는
좁은 터미널에서는 같은 내용을 입력창 위 띠에 보여줘요.

### 멈추는 명령

| 명령 | 확인창이 보여주는 것 |
|---|---|
| `rm -r`, `rm -f`, `rm -rf` | 지워질 파일 수와 용량 |
| `git reset --hard` | 커밋 안 된 변경 파일 목록 |
| `git checkout -- .`, `git restore .` | 되돌아갈(사라질) 변경 파일 목록 |
| `git clean` | 지워질 추적 안 되는 파일 목록 |
| `git push --force`(`-f`, `--force-with-lease`, `+ref` 포함) | 강제 푸시로 사라지는 커밋 목록 |
| `prisma db push`, `prisma migrate reset` | 무엇을 하는 명령인지와 왜 위험한지 |
| `psql`/`mysql` 안의 `DROP TABLE/DATABASE/SCHEMA/INDEX/VIEW`, `TRUNCATE` | 실행될 SQL |
| `docker volume rm`/`prune`, `docker system prune`, `compose down -v` | 무엇이 지워지는지 |

`git add`, `git push`(강제 아님), `prisma migrate deploy` 같은 일상적인 명령은 멈추지
않아요. 하나의 명령줄 안에서 `cd dir &&`, `pushd`/`popd`, `git -C dir`로 폴더를 옮기면
그 폴더 기준으로 측정해요.

## 권한 (이 mod가 내 컴퓨터에서 하는 일)

- 측정을 위해 `bash`, `git`, `find`, `du` 같은 이미 컴퓨터에 있는 프로그램을 실행해요
  (명령을 실행하는 것이 아니라 "실행하면 무엇이 바뀌는지"만 미리 알아봐요. 예: `git status`,
  `find`, `git log`). 네트워크 호출이나 외부 전송은 없어요.
- `실행`을 누르면 그제서야 원래 명령이 그대로 실행돼요.

## 한계

- 셸을 완전히 파싱하지 않아요. `$(...)`, `eval`, `bash -c "..."`, `xargs rm`,
  `find -delete`처럼 명령을 감싸거나 대신 실행하는 경우는 못 잡아요.
- 한 번에 하나만 잡아요. 서브에이전트 등에서 두 번째 위험한 호출이 오면 첫 번째가 끝날 때까지
  대기열에서 기다려요.
- Bash 도구만 지켜봐요. 파일 편집 등 다른 도구는 대상이 아니에요.
- 이것은 안전망이지 권한 시스템이 아니에요. 반드시 막아야 한다면
  [권한 규칙](https://code.claude.com/docs/en/settings)을 쓰세요.
- 더 자세한 한계(강제 푸시 목록은 마지막 `git fetch` 기준, `rm` 개수는 근사치 등)는 원본
  (아래 출처)의 설명과 같습니다. 이 수정판은 분류 목록과 문구·색만 바꿨습니다.

## 출처·라이선스

[anthropics/claude-code-playground](https://github.com/anthropics/claude-code-playground)의
`claude-code/mods/blast-radius` 샘플(Apache-2.0, Anthropic PBC)을 바탕으로 한 k-mods
수정판입니다. Anthropic의 저작권 표기와 라이선스는 [LICENSE](./LICENSE)와
`hooks/register.mjs` 상단에 그대로 남겨 뒀습니다. 무엇을 고쳤는지는
[CHANGES-KO.md](./CHANGES-KO.md)에 전부 적어 뒀어요.

테스트한 Claude Code 버전: 2.1.291
