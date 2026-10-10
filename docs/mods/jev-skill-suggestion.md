# jev-skill-suggestion

> 프롬프트마다 맞는 스킬 하나를 판단해 자동으로 불러오고, 스킬 목록은 컨텍스트에 넣지 않아요. API 키가 있으면 TypeSafe Jev로, 없으면 Claude 분류기로 판단해요

| | |
| --- | --- |
| 설치 이름 | `jev-skill-suggestion` |
| 종류 | 원본 (검토한 커밋 고정) |
| 만든 사람 | [claude-code-templates](https://www.aitmpl.com) |
| 라이선스 | MIT |
| 원본 | [davila7/claude-code-templates/cli-tool/components/mods/productivity/jev-skill-suggestion @ `375af90`](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/productivity/jev-skill-suggestion) |
| 유형 | ⚡ 자동화 |
| 보이는 곳 | 터미널 |
| 명령어 | `/jev-skill-suggestion:setup` |
| 권한 | 🌐 네트워크 · 🤖 모델 호출 · 👀 대화 읽기 · 🔑 환경·설정 읽기 · 📂 파일 읽기 |

## 설치

Claude Code 안에서:

```
/plugin marketplace add SeongGwangJu/k-mods
/plugin install jev-skill-suggestion@k-mods
```

터미널에서:

```sh
claude plugin marketplace add SeongGwangJu/k-mods
claude plugin install jev-skill-suggestion@k-mods
```

이미 열려 있는 세션에는 `/reload-plugins`로 바로 적용돼요. Claude Code 2.1.287 이상이 필요해요.

## 알아 둘 점

- API 키(typesafeApiKey 또는 gatewayApiKey)를 넣으면 프롬프트 전문과 후보 스킬 이름·설명, 선별된 스킬 SKILL.md 앞부분이 TypeSafe 서버로 전송돼요(저자가 코드 주석·README에 직접 명시한 사실)
- 키가 없으면 Claude Code 자체 모델 분류기($.model.classify)를 프롬프트마다 호출해 사용자 Claude 사용량을 소모해요
- 모든 실패 경로가 fail-open이에요. 요청 실패나 타임아웃(기본 800ms)이면 제안 없이 프롬프트를 그대로 통과시켜요
- /jev-skill-suggestion:setup은 mod가 직접 설정 파일을 쓰지 않고, Claude에게 변경 계획을 프롬프트로 건네 Claude의 Edit 도구로 사용자 확인을 거쳐 수정하게 해요

## 이 mod가 내 컴퓨터에서 하는 일

- 🌐 **네트워크**. 코드에 있는 주소: `https://ai-gateway.vercel.sh/v4/ai`, `https://ai-gateway.vercel.sh/v4/ai/evaluation-model`, `https://api.typesafe.ai`, `https://api.typesafe.ai/v1/systemone`, `https://docs.typesafe.ai/cookbooks/skill_suggestion`
- 🤖 **모델 호출**.
- 👀 **대화 읽기**.
- 🔑 **환경·설정 읽기**.
- 📂 **파일 읽기**.

<details><summary>정적 분석 결과 (<code>claude plugin validate</code>)</summary>

- 검사한 Claude Code: 2.1.291
- 결과: 통과
- 다루는 이벤트: `prompt.attachment{type=skill_listing}`, `prompt.submit`, `session.compact`, `session.end`, `skill.prompt`, `skill.prompt{skill=jev-skill-suggestion:setup}`
- 부르는 API: `$.clock.now`, `$.clock.sleep`, `$.command.list`, `$.env.get`, `$.fs.exists`, `$.fs.list`, `$.fs.read`, `$.http.fetch`, `$.model.classify`, `$.session.cwd`, `$.ui.log`, `$.ui.status`
- 읽는 환경 변수: `HOME`

</details>

## 검토 기록

- 2026-10-06 · k-mods · Claude Code 2.1.291 · 정적 검사, 코드 읽기
- 이 항목은 위 커밋에 고정돼 있어요. 원본이 바뀌면 다시 검토한 뒤에 올려요.

<details><summary>검토 노트 9개 (코드를 읽으며 확인한 것)</summary>

- 네트워크 목적지: API 키 설정 시 https://api.typesafe.ai/v1/systemone (TypeSafe) 또는 https://ai-gateway.vercel.sh/v4/ai/evaluation-model (Vercel AI Gateway) 중 선택된 한쪽으로 $.http.fetch POST, 프롬프트당 최대 2회(랭킹+재검토)
- 전송 데이터: 사용자 프롬프트 원문, 후보 스킬 이름·설명 전체, 재검토 대상 스킬의 SKILL.md 앞부분(기본 700자). 저자가 README·코드 주석에 '프롬프트 텍스트가 전송된다'고 명시
- 외부 프로그램 실행 없음
- 파일 쓰기: mod 코드 자체는 $.fs.write를 호출하지 않음. /setup 명령은 ~/.claude/settings.json 수정을 지시하는 프롬프트 텍스트만 반환하고, 실제 수정은 Claude의 Edit 도구(사용자 승인 필요)가 수행
- 모델 호출: API 키 없을 때 $.model.classify를 prompt.submit마다(슬래시 명령·알림성 프롬프트 제외) 1회 호출. 사용자 Claude 사용량 소모
- prompt.submit, session.compact 훅이 validate에서 gatingHooks(hasCatch:false)로 표시됨. 코드상 deny 분기가 없고 전부 next(e) 경유라 문서화된 동작은 fail-open(저자가 주석에 명시)
- env 읽기: HOME. 파일 읽기: ~/.claude/settings.json(스킬 오버라이드 확인), 스킬 SKILL.md 파일들, ~/.claude/plugins/installed_plugins.json. 트랜스크립트 파일 자체를 읽지는 않고 이벤트로 받은 프롬프트 텍스트만 사용
- 무거운 타이머·폴링 없음, 요청당 800ms(기본값) 타임아웃만 존재
- 명시된 최소 Claude Code 버전: 2.1.278(prompt.attachment 이벤트 요구, mod 자체 주석·README 명시). 단 mod가 기본으로 켜지는 전체 버전 기준은 2.1.287부터이며, 그 이전(2.1.259~2.1.286)은 환경변수로 수동 활성화해야 함

</details>

## 더 보기

- [원본 저장소](https://github.com/davila7/claude-code-templates/tree/375af9018a40e330e81542f59054daaa088c21aa/cli-tool/components/mods/productivity/jev-skill-suggestion)
- [카탈로그로 돌아가기](../../README.md#mod-목록)
