# 시크릿 볼트

> 사용자가 붙여넣거나 도구가 읽어온 API 키·이메일·IP 주소를 모델에게 보내기 전 자리표시로 바꿔요. 도구 실행 직전에는 원래 값으로 되돌려줘요.

| | |
| --- | --- |
| 설치 이름 | `secret-vault` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Ray Amjad](https://github.com/ray-amjad) |
| 라이선스 | MIT |
| 원본 | [ray-amjad/awesome-claude-code-function-hooks/plugins/secret-redactor @ `12b5fea`](https://github.com/ray-amjad/awesome-claude-code-function-hooks/tree/12b5fea27a4bd1b88cd9c9b6abc1efc0756c6625/plugins/secret-redactor) |
| 유형 | 🛡️ 지킴이 |
| 보이는 곳 | 터미널 |
| 명령어 | 없음 (설치하면 알아서 동작해요) |
| 권한 | 🛡️ 도구 호출 제어 · 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install secret-vault@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install secret-vault@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- k-mods에는 이미 davila7/claude-code-templates 출처의 'secret-redactor'(도구 결과만 가리고 재사용을 막는 방식)가 등록돼 있어요. 이 mod(원래 이름도 secret-redactor라 이름이 겹쳐 secret-vault로 등록)는 그것과 달리 prompt.submit 훅으로 사용자가 직접 붙여넣은 값도 가리고, 가린 값을 도구 실행 직전에 원래대로 복원해 워크플로를 끊지 않는 점이 달라요. 두 mod가 겹치는 영역이 있으니 마케팅/운영 쪽에서 통합 여부를 검토해 보면 좋겠어요.
- README에는 'CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1이 필요하다'고 적혀 있지만(초기 early-access 시절 문구로 보여요), 2.1.291에서는 별도 설정 없이 validate가 바로 통과했어요.

## 이 mod가 내 컴퓨터에서 하는 일

- 🛡️ **도구 호출 제어**.
- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `prompt.context`, `prompt.submit`, `tool.call`
- 부르는 API: `$.ui.notice`, `$.ui.toast`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 호출 없음, 외부 프로그램 실행 없음
- 파일 쓰기 없음. 치환 값은 세션 메모리 안의 vault에만 보관하고 디스크에 쓰지 않으며 세션 종료 시 사라져요
- 모델 호출($.model.*) 없음. 비밀값 판별은 정규식(벤더별 키 패턴 19종) + 엔트로피 계산으로만 해요
- prompt.submit 훅: 사용자가 입력한 텍스트에서 비밀값·PII를 찾아 치환 후 next()로 통과(차단 아님, 변환만)
- tool.call 훅: 도구 입력에 들어있던 치환 자리표시를 원래 값으로 복원해 실제 명령은 정상 동작하게 하고, 도구 결과에 새로 나타난 비밀값은 다시 치환해서 반환. 역시 deny 없이 항상 통과
- prompt.context 훅: 첫 메시지에 붙는 CLAUDE.md 등 블록에서 비밀값만 가림(이메일은 그대로. 사용자 본인 주소라 모델이 알아야 하는 정보로 간주)
- 세 훅 모두 .catch 없음(validate: hasCatch false). 전부 순수 정규식 치환이라 예외 발생 가능성은 낮지만, 실패 시 fail-open/closed 여부는 엔진 쪽 동작이라 코드만으로 단정할 수 없어요
- env·설정파일·트랜스크립트 읽기 없음, 타이머·폴링 없음
- 명시된 최소 Claude Code 버전: 없음(README는 구버전 함수 훅 플래그를 언급하나 현재는 불필요)

</details>

## 더 보기

- [원본 저장소](https://github.com/ray-amjad/awesome-claude-code-function-hooks/tree/12b5fea27a4bd1b88cd9c9b6abc1efc0756c6625/plugins/secret-redactor)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
