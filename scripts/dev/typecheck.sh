#!/bin/sh
# 이 기기의 Claude Code 버전으로 mods 타입 선언을 만들고 tsc로 검사한다 (로그인된 기기에서만).
#
#   scripts/dev/typecheck.sh mods/streamer-mode
#
# 타입 선언은 Claude Code가 --plugin-dir 로 mod를 불러올 때 써 준다. 모델 호출 없이 받으려고
# 명령 하나만 등록한 임시 mod를 claude -p 로 한 번 불러 .cache/types/<버전>/ 에 보관한다.
set -e
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
CC="$ROOT/scripts/cc.sh"
VERSION=$("$CC" --version | awk '{print $1}')
CACHE="$ROOT/.cache/types/$VERSION"

if [ ! -f "$CACHE/claude-code/index.d.ts" ]; then
  TMP=$(mktemp -d)
  mkdir -p "$TMP/probe/.claude-plugin" "$TMP/probe/hooks"
  echo '{ "name": "k-mods-type-probe", "version": "0.0.0" }' > "$TMP/probe/.claude-plugin/plugin.json"
  echo '{ "modules": ["./register.ts"] }' > "$TMP/probe/hooks/hooks.json"
  cat > "$TMP/probe/hooks/register.ts" <<'TS'
export function register(on) {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'k-mods-type-probe', description: 'probe' })
    return next(e)
  })
  on('command.run', { command: 'k-mods-type-probe' }, async () => ({ text: 'ok' }))
}
TS
  (cd "$TMP" && "$CC" -p "/k-mods-type-probe" --plugin-dir "$TMP/probe" < /dev/null > /dev/null 2>&1) || true
  if [ ! -f "$TMP/probe/.claude-plugin/types/claude-code/index.d.ts" ]; then
    echo "타입 선언을 만들지 못했습니다 (Claude Code 로그인이 필요합니다)" >&2
    exit 1
  fi
  mkdir -p "$CACHE"
  cp -R "$TMP/probe/.claude-plugin/types/." "$CACHE/"
  rm -rf "$TMP"
fi

for t in "$@"; do
  t=${t%/}
  mkdir -p "$t/.claude-plugin/types"
  cp -R "$CACHE/." "$t/.claude-plugin/types/"
  [ -f "$t/tsconfig.json" ] || echo '{ "extends": "./.claude-plugin/types/tsconfig.json" }' > "$t/tsconfig.json"
  echo "== tsc $t"
  npx -y -p typescript@5 tsc -p "$t"
done
