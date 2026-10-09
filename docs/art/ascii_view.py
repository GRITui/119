#!/usr/bin/env python3
"""Visual QA for the S3 sprites: render a region to ASCII in the terminal.

Point-sampling a downscaled region aliases badly and hides the face. This
BOX-resizes to the exact character grid first (so every cell is a true average
of the source pixels) and then classifies the averaged colour, which is what
makes the result readable.

Usage:
  python3 docs/art/ascii_view.py ton                    # all 7 moods, head band
  python3 docs/art/ascii_view.py ton --mood smug --part head
  python3 docs/art/ascii_view.py ton --mood neutral --part full
  python3 docs/art/ascii_view.py --chars                 # cast identity row
"""
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SP = os.path.join(ROOT, "public", "sprites")

MOODS = ["neutral", "happy", "stressed", "shocked", "determined", "exhausted", "smug"]

# face / head / full regions in sprite coordinates (canvas is 1024x1536)
PARTS = {
    "head": (430, 60, 620, 350),
    "brow": (430, 160, 620, 230),
    "eyes": (430, 200, 620, 265),
    "mouth": (470, 255, 600, 320),
    "full": (0, 0, 1024, 1536),
    "upper": (250, 60, 800, 900),
}


def classify(r, g, b, a):
    """Char per averaged pixel. Order matters: ink/sclera before skin, hair last."""
    if a < 60:
        return " "
    lum = (r * 299 + g * 587 + b * 114) // 1000
    # very dark -> lash / iris / brow / mouth / trouser
    if lum < 58:
        return "@"
    # near-white -> sclera
    if r > 226 and g > 220 and b > 210 and lum > 216:
        return "O"
    # hair band: dark but warm-neutral, distinct from ink by hue spread
    if lum < 108 and abs(r - b) < 34 and r >= 40:
        return "%"
    if lum > 200:
        return "o"      # lit skin
    if lum > 150:
        return "-"      # mid skin
    if lum > 100:
        return "+"      # shadowed skin
    return "*"          # deepest skin / dark cloth accent


def region_rows(path, part="head", cols=104):
    x0, y0, x1, y1 = PARTS[part]
    im = Image.open(path).convert("RGBA").crop((x0, y0, x1, y1))
    ar = im.width / im.height
    rows = max(1, int(cols * (im.height / im.width) / 2.05))
    small = im.resize((cols, rows), Image.BOX)
    out = []
    for y in range(rows):
        line = ""
        for x in range(cols):
            line += classify(*small.getpixel((x, y)))
        out.append(line.rstrip())
    return out


def show(cid, moods, part, cols=104):
    grids = []
    for m in moods:
        g = region_rows(os.path.join(SP, cid, m + ".png"), part, cols)
        grids.append((m, g))
    w = max(len(l) for _, g in grids for l in g) if grids else 0
    print(f"### {cid} / {part}  ({w} cols)")
    for i in range(0, len(grids), 2):
        pair = grids[i:i + 2]
        print("  ".join(m.ljust(w) for m, _ in pair))
        for r in range(max(len(g) for _, g in pair)):
            print("  ".join(g[r].ljust(w) if r < len(g) else " " * w for _, g in pair))
        print("  ".join(m.center(w) for m, _ in pair))
        print()


def identity():
    """Same-hair/clothes/palette check: skin+hair+cloth colour histogram per mood."""
    print("### cast identity - dominant non-transparent colours per mood")
    for cid in ["ton", "may", "chai", "lin"]:
        print(f"--- {cid}")
        for m in MOODS:
            p = os.path.join(SP, cid, m + ".png")
            if not os.path.exists(p):
                continue
            im = Image.open(p).convert("RGBA")
            px = [q for q in im.getdata() if q[3] > 200]
            counts = {}
            for r, g, b, a in px:
                k = (r // 24, g // 24, b // 24)
                counts[k] = counts.get(k, 0) + 1
            top = sorted(counts.values(), reverse=True)[:5]
            tot = sum(top) or 1
            share = [f"{100 * t / tot:.0f}%" for t in top]
            print(f"   {m:<11} top5 share {', '.join(share)}  n={len(px)}")


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    if a and a[0] == "--chars":
        identity()
    else:
        cid = a[0] if a else "ton"
        opts = sys.argv[1:]
        mood = None
        part = "head"
        cols = 104
        for i, o in enumerate(opts):
            if o == "--mood":
                mood = opts[i + 1]
            if o == "--part":
                part = opts[i + 1]
            if o == "--cols":
                cols = int(opts[i + 1])
        show(cid, [mood] if mood else MOODS, part, cols)