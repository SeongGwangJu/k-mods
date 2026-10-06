#!/bin/sh
# Claude Code 2.1.287 이상(mods 지원)을 찾아 인자를 그대로 넘겨 실행한다.
#
#   scripts/cc.sh plugin validate --strict mods/status-ko
#
# 찾는 순서
#   1. CLAUDE_BIN 환경 변수
#   2. PATH의 claude (2.1.287 이상일 때, CC_PINNED=1 이면 건너뜀)
#   3. .cache/claude-code/<CC_VERSION>/ 에 npm으로 받아 둔 고정 버전 (처음 한 번만 설치)
set -e
MIN=2.1.287
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WANT="${CC_VERSION:-$(cat "$ROOT/scripts/claude-code-version" 2>/dev/null || echo latest)}"

version_ok() {
  [ "$(printf '%s\n%s\n' "$MIN" "$1" | sort -V | head -n 1)" = "$MIN" ]
}

if [ -n "$CLAUDE_BIN" ]; then
  exec "$CLAUDE_BIN" "$@"
fi

if [ -z "$CC_PINNED" ] && command -v claude >/dev/null 2>&1; then
  have=$(claude --version 2>/dev/null | awk '{print $1}')
  if [ -n "$have" ] && version_ok "$have"; then
    exec claude "$@"
  fi
fi

BIN="$ROOT/.cache/claude-code/$WANT/node_modules/.bin/claude"
if [ ! -x "$BIN" ]; then
  echo "k-mods: Claude Code $WANT 을(를) .cache/claude-code 에 받습니다 (한 번만)" >&2
  npm install --silent --no-fund --no-audit --prefix "$ROOT/.cache/claude-code/$WANT" "@anthropic-ai/claude-code@$WANT" >&2
fi
exec "$BIN" "$@"
