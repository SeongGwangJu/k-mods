#!/bin/sh
# 촬영용으로 격리해서 띄우는 Claude Code. shoot.sh가 vhs 안에서 부른다.
#
#   claude.sh <settings.json> [plugin-dir...]
#
# - env -i: 바깥 환경 변수(이미 실행 중인 Claude Code 세션·터미널 연동 값)를 물려받지 않는다.
#   물려받으면 바깥 세션의 제목 같은 정보가 촬영 화면에 섞인다.
# - --setting-sources project,local: 개인 설정(~/.claude/settings.json)과 사용자 플러그인을 불러오지 않는다.
# - --plugin-dir: mod를 설치하지 않고 이번 세션에만 불러온다.
#
# 환경 변수
#   K_MODEL     모델 (기본 sonnet)
#   K_ALLOW     확인 없이 허용할 도구 (예: "Bash(git log:*) WebFetch")
#   K_CONTINUE  1이면 이 폴더의 마지막 세션을 이어서 연다
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
SETTINGS="$1"; shift
for d in "$@"; do set -- "$@" --plugin-dir "$d"; shift; done
set -- --setting-sources project,local --settings "$SETTINGS" --model "${K_MODEL:-sonnet}" "$@"
[ -n "${K_ALLOW:-}" ] && set -- "$@" --allowedTools "$K_ALLOW"
[ "${K_CONTINUE:-}" = 1 ] && set -- "$@" --continue
exec env -i HOME="$HOME" USER="${USER:-$(id -un)}" LOGNAME="${LOGNAME:-$(id -un)}" PATH="$PATH" \
  SHELL="${SHELL:-/bin/sh}" TERM="${TERM:-xterm-256color}" COLORTERM="${COLORTERM:-truecolor}" \
  LANG="${LANG:-en_US.UTF-8}" TMPDIR="${TMPDIR:-/tmp}" \
  DISABLE_AUTOUPDATER=1 CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1 \
  "$ROOT/scripts/cc.sh" "$@"
