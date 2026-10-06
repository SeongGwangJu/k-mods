#!/usr/bin/env python3
"""Claude Code 같은 TUI를 가상 터미널에 띄워 키를 보내고 화면을 텍스트·SVG로 저장한다.

mod가 그린 트리가 엔진 검증에서 떨어지면 엔진이 조용히 자기 그림을 그린다. 그래서 그리는 mod는
테스트만으로는 부족하고 실제 세션에서 한 번 봐야 한다. tmux 없이 그 일을 하는 도구다.

실행 (pyte가 필요해서 uvx로 띄운다. 시스템에는 아무것도 설치하지 않는다):

  uvx --with pyte python scripts/dev/tui.py \\
      --cmd "scripts/cc.sh --plugin-dir mods/memo-pad" \\
      --cols 100 --rows 32 --out .scratch/memo \\
      --step wait:6 --step 'send:/m\\r' --step wait:1 --step snap:open \\
      --step key:esc --step snap:closed

단계 (--step, 순서대로)
  wait:<초>                 기다린다
  waitfor:<정규식>[:<초>]    화면 글자가 정규식과 맞을 때까지 (기본 20초, 못 찾으면 실패)
  send:<글자>               글자를 보낸다. \\r \\n \\t \\x1b 같은 이스케이프를 쓸 수 있다
  key:<이름>                enter esc tab up down left right backspace ctrl-c ctrl-x ctrl-o space
  snap:<이름>               <out>/<이름>.txt 와 <이름>.svg 를 저장한다
  resize:<칸>x<줄>          창 크기를 바꾼다

끝나면 ctrl-c 두 번을 보내고 프로세스를 정리한다. 마지막 화면은 <out>/final.txt 로 남는다.
"""
import argparse
import codecs
import fcntl
import html
import os
import pty
import re
import select
import signal
import struct
import sys
import termios
import time

import pyte

KEYS = {
    "enter": "\r",
    "esc": "\x1b",
    "tab": "\t",
    "up": "\x1b[A",
    "down": "\x1b[B",
    "right": "\x1b[C",
    "left": "\x1b[D",
    "backspace": "\x7f",
    "ctrl-c": "\x03",
    "ctrl-x": "\x18",
    "ctrl-o": "\x0f",
    "ctrl-a": "\x01",
    "space": " ",
    "shift-tab": "\x1b[Z",
}

# 16색 이름 → 색. 어두운 배경 기준의 무난한 팔레트
NAMED = {
    "black": "#1e1e1e", "red": "#e06c75", "green": "#98c379", "brown": "#d19a66",
    "yellow": "#e5c07b", "blue": "#61afef", "magenta": "#c678dd", "cyan": "#56b6c2",
    "white": "#dcdfe4", "brightblack": "#5c6370", "brightred": "#ff7b86", "brightgreen": "#b5e890",
    "brightbrown": "#f0c674", "brightyellow": "#f0c674", "brightblue": "#82c3ff",
    "brightmagenta": "#de9cf0", "brightcyan": "#7fd6e0", "brightwhite": "#ffffff",
}


class Screen(pyte.Screen):
    """앱이 보내는 질의(커서 위치, 장치 속성)에 답을 돌려줄 수 있는 화면."""

    def __init__(self, cols, rows, reply):
        super().__init__(cols, rows)
        self._reply = reply

    def write_process_input(self, data):
        self._reply(data)


def set_size(fd, cols, rows):
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))


def screen_text(screen):
    return "\n".join(line.rstrip() for line in screen.display)


def color_of(value, default):
    if value in (None, "", "default"):
        return default
    if re.fullmatch(r"[0-9a-fA-F]{6}", value):
        return "#" + value.lower()
    return NAMED.get(value, default)


def screen_svg(screen, fg_default, bg_default, title=None):
    cell_w, cell_h, pad = 8.4, 17.0, 14
    cols, rows = screen.columns, screen.lines
    top = pad + (22 if title else 0)
    width = cols * cell_w + pad * 2
    height = rows * cell_h + top + pad
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}">',
        f'<rect width="100%" height="100%" rx="10" fill="{bg_default}"/>',
        "<style>text{font-family:'JetBrains Mono','D2Coding','SF Mono',Menlo,'Apple SD Gothic Neo',monospace;font-size:14px;white-space:pre}</style>",
    ]
    if title:
        out.append(f'<text x="{pad}" y="{pad + 8}" fill="#8b8f98" font-size="12">{html.escape(title)}</text>')
    for y in range(rows):
        line = screen.buffer[y]
        x = 0
        while x < cols:
            ch = line[x]
            fg = color_of(ch.fg, fg_default)
            bg = color_of(ch.bg, None)
            if ch.reverse:
                fg, bg = (bg or bg_default), fg
            data = ch.data
            wide = x + 1 < cols and line[x + 1].data == ""
            span = 2 if wide else 1
            px = pad + x * cell_w
            py = top + y * cell_h
            if bg:
                out.append(f'<rect x="{px:.1f}" y="{py:.1f}" width="{cell_w * span + 0.3:.1f}" height="{cell_h + 0.3:.1f}" fill="{bg}"/>')
            if data.strip():
                weight = ' font-weight="bold"' if ch.bold else ""
                italic = ' font-style="italic"' if ch.italics else ""
                deco = ' text-decoration="underline"' if ch.underscore else ""
                out.append(
                    f'<text x="{px:.1f}" y="{py + cell_h - 4:.1f}" fill="{fg}"{weight}{italic}{deco}>{html.escape(data)}</text>'
                )
            x += span
    out.append("</svg>")
    return "\n".join(out)


def unescape(text):
    return codecs.decode(text.encode("utf-8"), "unicode_escape").encode("latin-1").decode("utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cmd", required=True)
    ap.add_argument("--cwd", default=os.getcwd())
    ap.add_argument("--cols", type=int, default=100)
    ap.add_argument("--rows", type=int, default=32)
    ap.add_argument("--out", default=".scratch/tui")
    ap.add_argument("--fg", default="#dcdfe4")
    ap.add_argument("--bg", default="#1f2329")
    ap.add_argument("--title", default=None)
    ap.add_argument("--env", action="append", default=[])
    ap.add_argument("--step", action="append", default=[])
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    # 부모 Claude Code 세션의 표식은 넘기지 않는다 (넘기면 자식 세션으로 취급돼 기록 저장이 꺼지는 등 화면이 달라진다)
    env = {k: v for k, v in os.environ.items() if not (k.startswith("CLAUDE_CODE_") or k in ("CLAUDECODE", "CLAUDE_PID", "CLAUDE_EFFORT"))}
    env.update({"TERM": "xterm-256color", "COLORTERM": "truecolor", "LANG": env.get("LANG", "ko_KR.UTF-8")})
    for item in args.env:
        k, _, v = item.partition("=")
        env[k] = v

    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(args.cwd)
        os.execvpe("/bin/sh", ["/bin/sh", "-c", args.cmd], env)

    set_size(fd, args.cols, args.rows)
    screen = Screen(args.cols, args.rows, lambda data: os.write(fd, data.encode("utf-8")))
    stream = pyte.ByteStream(screen)
    alive = True

    def pump(seconds):
        nonlocal alive
        end = time.time() + seconds
        while alive:
            left = end - time.time()
            if left <= 0:
                break
            r, _, _ = select.select([fd], [], [], min(left, 0.05))
            if r:
                try:
                    data = os.read(fd, 65536)
                except OSError:
                    alive = False
                    break
                if not data:
                    alive = False
                    break
                stream.feed(data)

    def snap(name):
        text = screen_text(screen)
        with open(os.path.join(args.out, name + ".txt"), "w", encoding="utf-8") as f:
            f.write(text + "\n")
        with open(os.path.join(args.out, name + ".svg"), "w", encoding="utf-8") as f:
            f.write(screen_svg(screen, args.fg, args.bg, args.title))
        print(f"[snap] {name}")

    ok = True
    try:
        for step in args.step:
            kind, _, value = step.partition(":")
            if kind == "wait":
                pump(float(value))
            elif kind == "waitfor":
                pattern, _, timeout = value.rpartition(":") if re.search(r":\d+(\.\d+)?$", value) else (value, "", "20")
                deadline = time.time() + float(timeout)
                while time.time() < deadline and not re.search(pattern, screen_text(screen)):
                    pump(0.2)
                if not re.search(pattern, screen_text(screen)):
                    print(f"[fail] waitfor {pattern!r} 시간 초과", file=sys.stderr)
                    snap("waitfor-timeout")
                    ok = False
                    break
            elif kind == "send":
                os.write(fd, unescape(value).encode("utf-8"))
                pump(0.15)
            elif kind == "key":
                os.write(fd, KEYS[value].encode("utf-8"))
                pump(0.15)
            elif kind == "snap":
                pump(0.3)
                snap(value)
            elif kind == "resize":
                c, _, r = value.partition("x")
                set_size(fd, int(c), int(r))
                screen.resize(int(r), int(c))
                os.kill(pid, signal.SIGWINCH)
                pump(0.5)
            else:
                raise SystemExit(f"알 수 없는 단계: {step}")
    finally:
        with open(os.path.join(args.out, "final.txt"), "w", encoding="utf-8") as f:
            f.write(screen_text(screen) + "\n")
        for _ in range(2):
            try:
                os.write(fd, b"\x03")
            except OSError:
                break
            pump(0.4)
        # 자식(셸 → claude)을 프로세스 그룹째 정리한다. 기다리다 안 끝나면 SIGKILL
        for sig, grace in ((signal.SIGTERM, 2.0), (signal.SIGKILL, 1.0)):
            try:
                os.killpg(os.getpgid(pid), sig)
            except (ProcessLookupError, PermissionError):
                pass
            deadline = time.time() + grace
            done = False
            while time.time() < deadline:
                try:
                    if os.waitpid(pid, os.WNOHANG)[0] != 0:
                        done = True
                        break
                except ChildProcessError:
                    done = True
                    break
                pump(0.1)
            if done:
                break
        try:
            os.close(fd)
        except OSError:
            pass
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
