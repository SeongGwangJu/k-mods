#!/usr/bin/env python3
"""상태줄에 컨텍스트 카드를 그리는 스크립트 (ctx-strip의 userConfig display="statusline" 전용).

ctx-strip 모드가 턴마다 쓰는 <사람별 임시 폴더>/<세션ID>.json을 읽는다. 폴더 계산식은
mods/ctx-strip/hooks/paths.ts의 tempDirFrom과 똑같이 맞춰 뒀다: TMPDIR(없으면 /tmp) 아래
"ctx-strip-<사용자 이름>". 자기 플러그인 설치 경로를 몰라도 되게, 이 스크립트가 직접 같은
공식으로 계산한다.

Claude 공식 영상의 context 패널 스타일(색 사각형 범례·위계 있는 글자)을 옮겼다.
  3줄: [막대 ──────────────┃──]  38%
  4줄: ■ 대화 33%  ■ 도구 2.7%  ■ 스킬 1.0%   +3.7k  상세↗
파일이 없으면(아직 /ctx를 한 번도 안 열었거나, display가 "band"거나) 아무것도 출력하지 않는다.

설치 경로 예시(사람마다 다름): /ctx 리포트처럼 세션마다 같은 폴더에 쓰이므로, 이 스크립트를
직접 복사해서 자기 상태줄 명령에서 불러도 되고, 플러그인이 설치된 경로의
extras/statusline-ctx.py를 그대로 가리켜도 된다. README의 "설정" 절을 보라.

사용: statusline-ctx.py <session_id> <columns>
"""
import getpass
import json
import os
import sys
import tempfile
import unicodedata

# 레퍼런스(Claude 공식 영상)의 파스텔. 분류끼리 겹치지 않는다.
PASTEL = {
    "System prompt": (0x86, 0xA0, 0xDC),
    "System tools": (0x8E, 0xC5, 0xCC),
    "MCP tools": (0x9F, 0x8F, 0xF2),
    "MCP server instructions": (0xB9, 0xAE, 0xF5),
    "Custom agents": (0xA8, 0xC9, 0x8A),
    "Memory files": (0xE3, 0xC5, 0x6A),
    "Skills": (0xE8, 0xA6, 0xC4),
    "Messages": (0xDE, 0x8E, 0x62),
}
FALLBACK = [(0xC8, 0xC8, 0xC8), (0x9C, 0xD3, 0xB0), (0xD9, 0xB3, 0x8C)]
LABELS = {
    "System prompt": "시스템",
    "System tools": "도구",
    "MCP tools": "MCP",
    "MCP server instructions": "MCP 안내",
    "Custom agents": "에이전트",
    "Memory files": "메모리",
    "Skills": "스킬",
    "Messages": "대화",
}
# 파스텔은 공통이고, 막대 홈·글자 색만 배경에 맞춘다. mod가 스냅샷에 적은 palette를 따른다.
TONES = {
    # 어두운 터미널(기본): 홈은 배경보다 살짝 밝게, 글자는 밝게
    "dark": {
        "TRACK": (0x3A, 0x3E, 0x47),
        "MARK": (0xF2, 0x8B, 0x9B),
        "CHIP_INK": (0x1E, 0x21, 0x27),
        "DIM": (0x8A, 0x90, 0x9B),
        "BRIGHT": (0xE8, 0xEA, 0xED),
        "WARN": (0xF0, 0xC9, 0x87),
        "DANGER": (0xF2, 0x8B, 0x9B),
    },
    # 회색 배경(#bdbec6): 홈은 배경보다 살짝 짙게, 글자는 짙게
    "gray": {
        "TRACK": (0xAE, 0xB0, 0xBA),
        "MARK": (0x9F, 0x12, 0x39),
        "CHIP_INK": (0x1F, 0x23, 0x2E),
        "DIM": (0x5B, 0x60, 0x70),
        "BRIGHT": (0x11, 0x18, 0x27),
        "WARN": (0x7C, 0x4A, 0x03),
        "DANGER": (0x9F, 0x12, 0x39),
    },
}
TRACK = MARK = CHIP_INK = DIM = BRIGHT = WARN = DANGER = None


def use_tone(name):
    global TRACK, MARK, CHIP_INK, DIM, BRIGHT, WARN, DANGER
    t = TONES.get(name, TONES["dark"])
    TRACK, MARK, CHIP_INK, DIM, BRIGHT, WARN, DANGER = (
        t["TRACK"], t["MARK"], t["CHIP_INK"], t["DIM"], t["BRIGHT"], t["WARN"], t["DANGER"]
    )
RESET = "\033[0m"
BOLD = "\033[1m"
NOBOLD = "\033[22m"


def fg(rgb):
    return "\033[38;2;%d;%d;%dm" % rgb


def bg(rgb):
    return "\033[48;2;%d;%d;%dm" % rgb


def cells(text):
    return sum(2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1 for ch in text)


def pct_text(tokens, total):
    p = tokens / total * 100
    if p >= 10:
        return f"{p:.0f}%"
    if p >= 0.1:
        return f"{p:.1f}%"
    return "<0.1%"


def k(n):
    if n >= 1000:
        return f"{n / 1000:.{0 if n >= 100_000 else 1}f}k"
    return str(n)


def plain_line(body):
    return body + RESET


def snapshot_dir():
    """mods/ctx-strip/hooks/paths.ts의 tempDirFrom과 같은 공식."""
    base = os.environ.get("TMPDIR") or tempfile.gettempdir() or "/tmp"
    user = os.environ.get("USER") or os.environ.get("USERNAME")
    if not user:
        try:
            user = getpass.getuser()
        except Exception:
            user = "user"
    return f"{base.rstrip('/')}/ctx-strip-{user}"


def main():
    if len(sys.argv) < 2 or not sys.argv[1]:
        return
    sid = sys.argv[1]
    try:
        with open(f"{snapshot_dir()}/{sid}.json") as f:
            d = json.load(f)
    except (OSError, ValueError):
        return
    # theme 팔레트는 터미널 테마를 알 수 없으므로 dark 톤으로 그린다
    use_tone("gray" if d.get("palette") == "gray" else "dark")
    columns = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 100
    inner = columns - 4  # 들여쓰기·여유

    total_max = d.get("maxTokens") or 1
    pct = d.get("percentage", 0)
    cats = d.get("categories", [])
    colors = {c["name"]: PASTEL.get(c["name"], FALLBACK[i % len(FALLBACK)]) for i, c in enumerate(cats)}

    # ---- 3줄: 막대 + 사용률 ----
    pct_label = f" {pct}%"
    pct_color = DANGER if pct >= 85 else WARN if pct >= 70 else BRIGHT
    width = max(10, inner - 4 - cells(pct_label))
    slots = []
    acc = 0
    for c in cats:
        acc += c["tokens"]
        end = round(acc / total_max * width)
        if end <= len(slots):
            end = len(slots) + 1  # 작은 분류도 한 칸은 보이게
        while len(slots) < min(width, end):
            slots.append(colors[c["name"]])
    threshold = d.get("autoCompactThreshold")
    mark = min(width - 1, round(threshold / total_max * width)) if threshold else None

    bar = " " + fg(TRACK) + "▐"
    run = None
    for i in range(width):
        if i < len(slots):
            if slots[i] != run:
                bar += bg(slots[i])
                run = slots[i]
            bar += " "
        elif i == mark:
            bar += bg(TRACK) + fg(MARK) + "▕"
            run = None
        else:
            if run != TRACK:
                bar += bg(TRACK)
                run = TRACK
            bar += " "
    bar += RESET + fg(TRACK) + "▌" + RESET + fg(pct_color) + BOLD + pct_label + NOBOLD
    line1 = plain_line(bar)

    # ---- 4줄: 범례 칩 (막대와 같은 파스텔 + 어두운 글씨) + 증가량 + 상세 링크 ----
    tail, tail_w = "", 0
    delta = d.get("delta")
    if delta is not None and abs(delta) >= 1000:
        big = delta >= 20000
        text = f"  {'+' if delta > 0 else '−'}{k(abs(delta))}"
        tail += fg(WARN if big else DIM) + text
        tail_w += cells(text)
    if threshold:
        left = max(0, threshold - d.get("totalTokens", 0))
        if left < total_max * 0.15:
            text = f"  압축까지 {k(left)}"
            tail += fg(DANGER) + BOLD + text + NOBOLD
            tail_w += cells(text)
    report = f"{snapshot_dir()}/{sid}.html"
    if os.path.exists(report):
        tail += "  \033]8;;file://" + report + "\a" + fg((0x1E, 0x40, 0xAF)) + "상세↗(/ctx로 새로 고침)" + "\033]8;;\a"
        tail_w += 2 + cells("상세↗(/ctx로 새로 고침)")

    legend, legend_w = " ", 1
    for c in sorted(cats, key=lambda c: -c["tokens"]):
        name = LABELS.get(c["name"], c["name"])
        share = pct_text(c["tokens"], total_max)
        text_w = cells(f" {name} {share} ") + 1
        if legend_w + text_w + tail_w > inner:
            break
        # 칩 = 막대와 같은 파스텔 + 어두운 글씨. 흰 글씨는 Orca(xterm.js)의 최소 대비 보정이 어둡게 바꿔버린다.
        legend += bg(colors[c["name"]]) + fg(CHIP_INK) + f" {name} " + BOLD + share + NOBOLD + " " + RESET + " "
        legend_w += text_w
    line2 = plain_line(legend + tail)

    sys.stdout.write(" " + line1 + "\n " + line2)


main()
