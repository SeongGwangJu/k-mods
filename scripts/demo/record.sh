#!/bin/sh
# 데모 GIF 녹화: scripts/demo/record.sh <tape 이름>
# vhs(https://github.com/charmbracelet/vhs)와 D2Coding 글꼴이 필요하다.
# 개인 설정이 섞이지 않게 --setting-sources project,local 로 띄우고, 녹화할 mod만 --plugin-dir 로 불러온다.
set -e
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
NAME="${1:-hero}"
"$ROOT/scripts/demo/make-workspace.sh" >/dev/null
EXT="${K_EXT_DIR:-/tmp/k-demo/ext}"
mkdir -p "$EXT"
# 외부 mod는 카탈로그에 고정된 커밋으로 받아 온다
fetch() { # <dir> <url> <sha>
  if [ ! -d "$EXT/$1/.git" ]; then git clone -q "$2" "$EXT/$1"; fi
  git -C "$EXT/$1" fetch -q origin "$3" 2>/dev/null || true
  git -C "$EXT/$1" checkout -q "$3"
}
sha() { python3 -c "import json,sys; print(json.load(open('$ROOT/registry/$1.json'))['source']['sha'])"; }
fetch hoobnn https://github.com/hoobnn/hoobnn-agent-mods.git "$(sha spinner)"
fetch ko-ui https://github.com/moduvoice/claude-code-ko-ui.git "$(sha ko-ui)"

SETTINGS='{"tui":"fullscreen","pluginConfigs":{"spinner@inline":{"options":{"theme":"nyan","language":"ko","companion":false,"footerButton":false}}}}'
case "$NAME" in
  hero) DIRS="$ROOT/mods/status-ko $ROOT/mods/ctx-strip $EXT/hoobnn/claude-code/spinner $EXT/ko-ui" ;;
  *) DIRS="${K_PLUGIN_DIRS:?K_PLUGIN_DIRS 를 지정하세요}" ;;
esac
ARGS=""
for d in $DIRS; do ARGS="$ARGS --plugin-dir $d"; done
# vhs 안의 셸에서 쓸 실행 명령
export K_CLAUDE="env -u CLAUDECODE -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_ENTRYPOINT CC_PINNED=1 $ROOT/scripts/cc.sh --setting-sources project,local --settings $SETTINGS --model haiku$ARGS"
cd "$ROOT"
vhs "scripts/demo/$NAME.tape"
