# clawd-spinner

> 189가지 스피너 단어마다 Clawd가 요리·춤·서성거리기 등 서로 다른 몸짓을 해요.

<img src="https://raw.githubusercontent.com/saiharsha03/clawd-spinner/83550929abac306fe71b12588a53e996321b6e76/icon.png" alt="clawd-spinner" width="640">

| | |
| --- | --- |
| 설치 이름 | `clawd-spinner` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [Sai Rudra](https://github.com/saiharsha03) |
| 라이선스 | MIT |
| 원본 | [saiharsha03/clawd-spinner @ `8355092`](https://github.com/saiharsha03/clawd-spinner/tree/83550929abac306fe71b12588a53e996321b6e76) |
| 유형 | 🐾 애니메이션 |
| 보이는 곳 | 터미널 |
| 명령어 | `/clawd-talk` |
| 권한 | 👀 대화 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install clawd-spinner@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install clawd-spinner@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- 좁은 터미널(50칸 미만)에서는 자동으로 숨고 기본 스피너만 보여요.
- `/clawd-talk`로 말풍선을 껐다 켤 수 있고, 설정은 세션 간 기억돼요.

## 이 mod가 내 컴퓨터에서 하는 일

- 👀 **대화 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `command.run{command=clawd-talk}`, `session.start`, `turn.complete`, `turn.start`, `ui.render{component=Spinner}`
- 부르는 API: `$.clock.every`, `$.clock.now`, `$.command.register`, `$.store.get`, `$.store.set`, `$.ui.blit`, `$.ui.invalidate`, `$.ui.resolve`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 3개 (코드를 읽으며 확인한 것)</summary>

- validate 통과, gatingHooks 없음(차단 가능한 훅 자체를 쓰지 않음).
- 네트워크·모델 호출·외부 프로세스·파일 쓰기 없음(validate calls: clock/command/store/ui.blit/ui.invalidate/ui.resolve 뿐).
- session.start에서 e.isInteractive가 false면(-p·SDK 실행) 애니메이션 타이머 자체를 시작하지 않음을 코드로 확인함.

</details>

## 더 보기

- [원본 저장소](https://github.com/saiharsha03/clawd-spinner/tree/83550929abac306fe71b12588a53e996321b6e76)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
