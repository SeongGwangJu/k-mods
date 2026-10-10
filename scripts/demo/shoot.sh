#!/bin/sh
# mod 미리보기 촬영: scripts/demo/shoot.sh <이름> [이름...]
#
# mod를 설치하지 않고(--plugin-dir) 데모 프로젝트(/tmp/k-demo/shop-api)에서 Claude Code를 띄워
# scripts/demo/shots/<이름>.tape 의 장면을 vhs로 찍고, mod가 바꾸는 부분만 잘라
# docs/assets/mods/<이름>.png|gif 로 저장한다. 끝나면 데모 세션의 기록을 지운다.
# 저장한 뒤 registry/<이름>.json 의 preview 를 그 경로로 두고 node scripts/build.mjs 를 돌린다.
#
# 필요: macOS, vhs·ffmpeg(brew install vhs ffmpeg), D2Coding ligature 글꼴, python3,
#       로그인된 Claude Code 2.1.287 이상
# 모델을 부르는 장면은 내 사용량을 쓴다: blast-radius-ko·status-ko·skins는 Sonnet 한 턴,
# ctx-strip은 Haiku 4.5로 큰 파일을 읽는 한 턴(약 3분)
#
# 장면 파일의 "# shoot:" 줄에 촬영 설정을 적는다.
#   size=1100x900     터미널 크기(px)
#   type=png|gif      png는 장면이 Screenshot "/tmp/k-demo/shots/<이름>.png" 로 남긴 한 장, gif는 녹화 전체
#   crop=x0,y0,x1,y1  남길 영역(px). 화면 배치가 바뀌면 원본을 scripts/demo/rows.py로 재서 고친다
#   pad=14            사방 여백(px)
#   start=5.0         (gif) 이 시점부터 반복 재생. 웹사이트 썸네일이 첫 프레임이라 핵심 장면으로 둔다
#   model=sonnet      모델
#   allow="..."       확인 없이 허용할 도구
#   plugins="a b"     같이 불러올 mod (기본은 <이름> 하나)
#   options='{"k":1}' 첫 mod의 설정값(이번 세션에만, 예: 테마 고정)
#
# 환경 변수: K_OUT(저장 폴더, 기본 docs/assets/mods), K_START(start 덮어쓰기), K_KEEP=1(정리 건너뛰기)
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
DEMO=/tmp/k-demo
SHOTS=$DEMO/shots
OUT="${K_OUT:-$ROOT/docs/assets/mods}"
BG=0x1c1c2c # vhs Catppuccin Mocha 배경색. 여백을 이 색으로 채운다

[ $# -gt 0 ] || { sed -n '2,7p' "$0"; exit 1; }
for tool in vhs ffmpeg python3; do
  command -v "$tool" >/dev/null 2>&1 || { echo "shoot: $tool 이(가) 필요해요" >&2; exit 1; }
done
mkdir -p "$SHOTS" "$OUT"

# registry의 source로 외부 mod를 고정 커밋 그대로 받아 와 플러그인 폴더 경로를 출력한다
plugin_dir() {
  if [ -d "$ROOT/mods/$1" ]; then echo "$ROOT/mods/$1"; return; fi
  python3 - "$ROOT/registry/$1.json" "$DEMO/ext/$1" <<'PY'
import json, os, subprocess, sys
src = json.load(open(sys.argv[1]))['source']
dest = sys.argv[2]
url = src.get('url') or f"https://github.com/{src['repo']}.git"
if not os.path.isdir(os.path.join(dest, '.git')):
    subprocess.run(['git', 'clone', '-q', url, dest], check=True)
subprocess.run(['git', '-C', dest, 'fetch', '-q', 'origin', src['sha']], check=False)
subprocess.run(['git', '-C', dest, 'checkout', '-q', src['sha']], check=True)
print(os.path.join(dest, src.get('path', '')).rstrip('/'))
PY
}

# 데모 폴더를 이미 신뢰했는지 (~/.claude.json 을 읽기만 한다). 처음이면 신뢰 확인창에서 "예"를 고른다
trusted() {
  python3 - "$DEMO/shop-api" <<'PY'
import json, os, sys
path = os.path.realpath(sys.argv[1])
try:
    projects = json.load(open(os.path.expanduser('~/.claude.json'))).get('projects', {})
except Exception:
    projects = {}
while True:
    if projects.get(path, {}).get('hasTrustDialogAccepted'):
        print(1); break
    parent = os.path.dirname(path)
    if parent == path:
        print(0); break
    path = parent
PY
}

# 촬영으로 생긴 흔적만 지운다: 데모 프로젝트의 대화 기록, 새로 생긴 mod 저장 파일, 입력 기록의 데모 줄
cleanup() {
  python3 - "$DEMO/shop-api" "$DEMO/store-before.txt" <<'PY'
import json, os, re, shutil, sys, tempfile
home = os.path.expanduser('~')
project = os.path.realpath(sys.argv[1])
removed = []
d = os.path.join(home, '.claude', 'projects', re.sub(r'[^A-Za-z0-9]', '-', project))
if os.path.isdir(d):
    shutil.rmtree(d); removed.append(d)
store = os.path.join(home, '.claude', 'plugins', 'store')
before = set(open(sys.argv[2]).read().split()) if os.path.exists(sys.argv[2]) else set()
if os.path.isdir(store):
    for f in os.listdir(store):
        if '_inline-' in f and f not in before:
            os.remove(os.path.join(store, f)); removed.append(os.path.join(store, f))
hp = os.path.join(home, '.claude', 'history.jsonl')
if os.path.exists(hp):
    lines = open(hp, encoding='utf-8').readlines()
    keep = []
    for line in lines:
        try:
            if json.loads(line).get('project', '').startswith(os.path.dirname(project)):
                continue
        except Exception:
            pass
        keep.append(line)
    if len(keep) != len(lines):
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(hp))
        with os.fdopen(fd, 'w', encoding='utf-8') as fh:
            fh.writelines(keep)
        os.chmod(tmp, os.stat(hp).st_mode)
        os.replace(tmp, hp)
        removed.append(f'{hp} ({len(lines) - len(keep)}줄)')
for r in removed:
    print('  지움:', r)
PY
  rm -rf "$DEMO/shop-api" "$DEMO/ext" "$DEMO/settings.json" "$DEMO/store-before.txt"
}

for NAME in "$@"; do
  TAPE="$ROOT/scripts/demo/shots/$NAME.tape"
  [ -f "$TAPE" ] || { echo "shoot: $TAPE 이(가) 없어요" >&2; exit 1; }
  S_SIZE=1000x820 S_TYPE=png S_CROP= S_PAD=14 S_START=0 S_MODEL=sonnet S_ALLOW= S_PLUGINS=$NAME S_OPTIONS='{}'
  eval "$(python3 - "$TAPE" <<'PY'
import shlex, sys
line = next((l for l in open(sys.argv[1], encoding='utf-8') if l.startswith('# shoot:')), '')
for tok in shlex.split(line[len('# shoot:'):]):
    key, _, value = tok.partition('=')
    print(f'S_{key.upper()}={shlex.quote(value)}')
PY
)"
  [ -n "$S_CROP" ] || { echo "shoot: $NAME 장면에 crop이 없어요" >&2; exit 1; }
  W=${S_SIZE%x*}; H=${S_SIZE#*x}
  X0=$(echo "$S_CROP" | cut -d, -f1); Y0=$(echo "$S_CROP" | cut -d, -f2)
  X1=$(echo "$S_CROP" | cut -d, -f3); Y1=$(echo "$S_CROP" | cut -d, -f4)
  CW=$((X1 - X0)); CH=$((Y1 - Y0)); P=$S_PAD
  START=${K_START:-$S_START}

  echo "== $NAME"
  "$ROOT/scripts/demo/make-workspace.sh" "$DEMO/shop-api" >/dev/null
  # --plugin-dir로 불러온 mod의 설정은 "<이름>@inline" 아래에 둔다
  python3 -c 'import json, sys; print(json.dumps({"tui": "fullscreen", "spinnerTipsEnabled": False, "pluginConfigs": {sys.argv[1] + "@inline": {"options": json.loads(sys.argv[2])}}}))' \
    "${S_PLUGINS%% *}" "$S_OPTIONS" > "$DEMO/settings.json"
  ls "$HOME/.claude/plugins/store" 2>/dev/null > "$DEMO/store-before.txt" || true
  DIRS=""
  for p in $S_PLUGINS; do DIRS="$DIRS $(plugin_dir "$p")"; done
  export K_CMD="$ROOT/scripts/demo/claude.sh $DEMO/settings.json$DIRS" K_MODEL="$S_MODEL" K_ALLOW="$S_ALLOW"

  RUN="$SHOTS/$NAME.run.tape"
  {
    printf 'Output "%s"\n' "$SHOTS/$NAME.gif"
    printf 'Set Shell "bash"\nSet FontFamily "D2Coding ligature"\nSet FontSize 22\n'
    printf 'Set Width %s\nSet Height %s\nSet Padding 20\nSet Theme "Catppuccin Mocha"\n' "$W" "$H"
    printf 'Set Framerate 15\nSet TypingSpeed 45ms\n\n'
    printf 'Hide\nType "cd %s && clear && $K_CMD"\nEnter\nWait+Screen@60s /❯/\nSleep 1.5s\n' "$DEMO/shop-api"
    if [ "$(trusted)" != 1 ]; then printf 'Down\nEnter\nSleep 5s\n'; fi
    printf 'Show\n\n'
    grep -v '^# shoot:' "$TAPE"
    # 끝내는 장면은 녹화하지 않는다(GIF 끝에 빈 화면이 남지 않게)
    printf '\nHide\nCtrl+C\nSleep 0.5s\nCtrl+C\nSleep 1.5s\n'
  } > "$RUN"
  (cd "$ROOT" && vhs "$RUN" >/dev/null)

  PADV="pad=$((CW + 2 * P)):$((CH + 2 * P)):$P:$P:color=$BG"
  if [ "$S_TYPE" = gif ]; then
    if [ "$START" = 0 ]; then
      FILTER="[0]fps=12,crop=$CW:$CH:$X0:$Y0,$PADV,split[x][y]"
    else
      FILTER="[0]fps=12,crop=$CW:$CH:$X0:$Y0,$PADV,split[c1][c2];[c1]trim=start=$START,setpts=PTS-STARTPTS[b];[c2]trim=end=$START,setpts=PTS-STARTPTS[a];[b][a]concat=n=2:v=1:a=0,split[x][y]"
    fi
    ffmpeg -v error -y -i "$SHOTS/$NAME.gif" -filter_complex "$FILTER;[x]palettegen=max_colors=192:stats_mode=full[p];[y][p]paletteuse=dither=none" "$OUT/$NAME.gif"
    echo "  저장: $OUT/$NAME.gif"
  else
    ffmpeg -v error -y -i "$SHOTS/$NAME.png" -vf "crop=$CW:$CH:$X0:$Y0,$PADV" "$OUT/$NAME.png"
    echo "  저장: $OUT/$NAME.png"
  fi
  if [ "${K_KEEP:-}" = 1 ]; then echo "  (K_KEEP=1: 데모 폴더와 기록을 남겼어요)"; else cleanup; fi
  echo "  원본: $SHOTS/$NAME.*"
done
