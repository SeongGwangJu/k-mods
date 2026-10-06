#!/bin/sh
# mod 검증: claude plugin validate --strict + claude plugin test
#
#   scripts/check.sh                 mods/*, bundles/* 전부 + 마켓플레이스
#   scripts/check.sh mods/memo-pad   하나만
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CC="$ROOT/scripts/cc.sh"

if [ $# -gt 0 ]; then
  TARGETS="$*"
  CHECK_MARKETPLACE=0
else
  TARGETS=$(ls -d "$ROOT"/mods/*/ "$ROOT"/bundles/*/ 2>/dev/null || true)
  CHECK_MARKETPLACE=1
fi

failed=""
for t in $TARGETS; do
  t=${t%/}
  name=$(basename "$t")
  printf '\n== %s\n' "$name"
  if ! "$CC" plugin validate --strict "$t"; then
    failed="$failed $name(validate)"
    continue
  fi
  if find "$t" \( -name '*.test.ts' -o -name '*.test.tsx' \) -not -path '*/node_modules/*' | grep -q .; then
    if ! "$CC" plugin test "$t"; then
      failed="$failed $name(test)"
    fi
  elif [ -d "$t/hooks" ]; then
    echo "   (테스트 파일 없음)"
    failed="$failed $name(no-tests)"
  fi
done

if [ "$CHECK_MARKETPLACE" = 1 ] && [ -f "$ROOT/.claude-plugin/marketplace.json" ]; then
  printf '\n== marketplace\n'
  "$CC" plugin validate "$ROOT" || failed="$failed marketplace"
fi

if [ -n "$failed" ]; then
  printf '\n실패:%s\n' "$failed"
  exit 1
fi
printf '\n모두 통과\n'
