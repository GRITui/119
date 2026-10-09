#!/usr/bin/env python3
"""
119-S3-A1 (t_83e1e414) - VN stage character expression sprites.
4 characters x 7 moods = 28 PNGs, 1024x1536 RGBA transparent, bottom-centre anchored.

Code-drawn flat-vector with PIL. No AI generator and no paid API: DrawThings was
unreachable (probe http://100.67.184.60:7860 -> no route, see manifest), so this
matches the Scene 1 register exactly - flat fills, NO outlines, 2-3 hard tone bands
per surface, silhouette carried by colour blocks. Style rules: docs/art/style-scene1.md.
Geometry contract: docs/design/S1-viewport-spec.md Part B (2.1).

Deterministic: no RNG anywhere, so this script always produces identical pixels.

Usage:  python3 docs/art/make_sprites.py [ton|may|chai|lin|all] [--sheet]
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "sprites")

# ---------------------------------------------------------------- geometry ---
W, H = 1024, 1536          # spec 2.1 - identical for every file
SS = 2                     # supersample factor, LANCZOS down on save
CX = 512                   # canvas centre x  (anchor is bottom-centre 512,1536)
CROWN_Y = 96               # spec 2.1 head crown ~ y=96
CHIN_Y = 326
SHOULDER_Y = 392
HIP_Y = 830
ANKLE_Y = 1452
FEET_Y = 1512              # H - 24 -> honours the >=24px margin on all sides
MARGIN = 24

MOODS = ["neutral", "happy", "stressed", "shocked", "determined", "exhausted", "smug"]
IDS = ["ton", "may", "chai", "lin"]

# ------------------------------------------------------------------ colour ---
# palette from docs/art/style-scene1.md (UX-locked tokens)
INK = (26, 22, 20)
PAPER = (245, 239, 230)
MUTED = (185, 178, 164)
AMBER = (232, 163, 61)
ROSE = (217, 122, 156)
TEAL = (46, 110, 115)
DAWN = (201, 214, 209)
PURPLE = (126, 107, 156)   # added for Khun Lin (purple accent in storyData)

SKIN = (226, 181, 143)
SKIN_D = (206, 158, 121)   # one shade down, hard band - no gradient
SCLERA = (250, 248, 244)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def box(x0, y0, x1, y1):
    return [x0 * SS, y0 * SS, x1 * SS, y1 * SS]


def poly(d, pts, fill):
    d.polygon([(x * SS, y * SS) for x, y in pts], fill=fill)


def ell(d, cx, cy, rx, ry, fill):
    d.ellipse(box(cx - rx, cy - ry, cx + rx, cy + ry), fill=fill)


def line(d, x0, y0, x1, y1, fill, w):
    d.line([(x0 * SS, y0 * SS), (x1 * SS, y1 * SS)], fill=fill, width=int(w * SS))


# ------------------------------------------------------------------- cast ----
# colours keyed to storyData.ts CHARACTERS: ton amber, may teal, chai rose, lin purple
CHARS = {
    "ton": dict(
        name="Ton", thai="ต้น",
        role="Junior UX/UI Designer, 22, probation day 88/119",
        build=dict(shoulder=116, hip=92, neck=32, limb=40, height=1.0),
        skin=SKIN,
        hair=dict(
            style="messy", main=(64, 47, 38), hi=(96, 72, 56), len=0,
            part=0.12, volume=1.0,
        ),
        cloth=dict(
            jacket=lerp(AMBER, INK, 0.20), jacket_hi=AMBER, panel=PAPER,
            trouser=lerp(INK, MUTED, 0.26), shoe=lerp(INK, MUTED, 0.10),
            accent=AMBER, layer="hoodie",
        ),
    ),
    "may": dict(
        name="May", thai="เมย์",
        role="Junior Frontend Dev, probation peer",
        build=dict(shoulder=106, hip=88, neck=28, limb=34, height=0.965),
        skin=SKIN,
        hair=dict(
            style="long", main=(48, 36, 34), hi=(84, 66, 62), len=740,
            part=-0.16, volume=1.06,
        ),
        cloth=dict(
            jacket=lerp(TEAL, PAPER, 0.20), jacket_hi=lerp(TEAL, PAPER, 0.40),
            panel=PAPER, trouser=lerp(INK, MUTED, 0.20), shoe=lerp(INK, MUTED, 0.12),
            accent=TEAL, layer="cardigan",
        ),
    ),
    "chai": dict(
        name="P' Chai", thai="พี่ชัย",
        role="Senior Account Director & Team Lead",
        build=dict(shoulder=134, hip=98, neck=38, limb=46, height=1.02),
        skin=lerp(SKIN, MUTED, 0.10),
        hair=dict(
            style="swept", main=(58, 47, 43), hi=(132, 126, 119), len=0,
            part=0.0, volume=0.94, grey=True,
        ),
        cloth=dict(
            jacket=lerp(INK, ROSE, 0.10), jacket_hi=lerp(INK, ROSE, 0.22),
            panel=PAPER, trouser=lerp(INK, MUTED, 0.14), shoe=lerp(INK, MUTED, 0.06),
            accent=ROSE, layer="suit",
        ),
    ),
    "lin": dict(
        name="Khun Lin", thai="คุณหลิน",
        role="Managing Director & Partner",
        build=dict(shoulder=118, hip=94, neck=30, limb=36, height=0.985),
        skin=lerp(SKIN, MUTED, 0.05),
        hair=dict(
            style="bob", main=(62, 44, 54), hi=(116, 96, 106), len=600,
            part=-0.10, volume=1.16,
        ),
        cloth=dict(
            jacket=PURPLE, jacket_hi=lerp(PURPLE, PAPER, 0.26),
            panel=PAPER, trouser=lerp(INK, MUTED, 0.30), shoe=lerp(INK, MUTED, 0.16),
            accent=PURPLE, layer="blazer",
        ),
    ),
}

# small posture deltas only (spec 2.1: "the face moves, the stance does not")
POSTURE = {
    "neutral": 0, "happy": 0, "stressed": 7, "shocked": 0,
    "determined": 0, "exhausted": 13, "smug": 0,
}

EYE_Y = 234
BROW_Y = 204
MOUTH_Y = 286


# ------------------------------------------------------------------- parts ---
def draw_legs(d, C):
    tr = C["cloth"]["trouser"]
    hip, sh = C["build"]["hip"], C["build"]["shoulder"]
    # left leg (far side, 3/4 right -> slightly narrower + darker)
    poly(d, [(CX - hip, HIP_Y), (CX - 4, HIP_Y),
             (CX - 30, ANKLE_Y), (CX - 72, ANKLE_Y)], lerp(tr, INK, 0.22))
    # right leg (near side)
    poly(d, [(CX + 8, HIP_Y), (CX + hip, HIP_Y),
             (CX + 86, ANKLE_Y), (CX + 22, ANKLE_Y)], tr)
    # knee break - one hard tone band, no gradient
    for pts, c in (([(CX - 70, 1150), (CX - 8, 1150), (CX - 16, 1216), (CX - 74, 1216)], lerp(tr, INK, 0.30)),
                   ([(CX + 12, 1150), (CX + 82, 1150), (CX + 86, 1216), (CX + 16, 1216)], lerp(tr, INK, 0.16))):
        poly(d, pts, c)


def draw_shoes(d, C):
    s = C["cloth"]["shoe"]
    for ox, tone in ((-58, lerp(s, INK, 0.25)), (54, s)):
        x = CX + ox
        poly(d, [(x - 22, ANKLE_Y - 34), (x + 26, ANKLE_Y - 34),
                 (x + 40, ANKLE_Y + 26), (x + 42, FEET_Y),
                 (x - 30, FEET_Y), (x - 28, ANKLE_Y + 10)], tone)
        ell(d, x + 40, ANKLE_Y + 34, 12, 9, lerp(tone, INK, 0.35))


def draw_torso(d, C, slump):
    b, c = C["build"], C["cloth"]
    sw, hw = b["shoulder"], b["hip"]
    sy = SHOULDER_Y + slump
    # shoulders - rounded cap then tapered body
    ell(d, CX, sy + 26, sw, 46, c["jacket"])
    poly(d, [(CX - sw, sy + 20), (CX + sw, sy + 20),
             (CX + hw, HIP_Y + 26), (CX - hw, HIP_Y + 26)], c["jacket"])
    # key light from the right: one hard highlight band on the lit side
    poly(d, [(CX + sw * 0.34, sy + 14), (CX + sw, sy + 20),
             (CX + hw, HIP_Y + 26), (CX + hw * 0.28, HIP_Y + 26)], c["jacket_hi"])
    # shadow band on the away-from-light side
    poly(d, [(CX - sw, sy + 20), (CX - sw * 0.42, sy + 16),
             (CX - hw * 0.44, HIP_Y + 26), (CX - hw, HIP_Y + 26)], lerp(c["jacket"], INK, 0.30))

    layer = c["layer"]
    panel_w = {"hoodie": 26, "cardigan": 46, "suit": 34, "blazer": 52}[layer]
    # inner shirt / blouse panel
    poly(d, [(CX - panel_w, sy + 6), (CX + panel_w, sy + 6),
             (CX + panel_w + 8, HIP_Y + 10), (CX - panel_w - 8, HIP_Y + 10)], c["panel"])
    if layer == "suit":
        poly(d, [(CX - 13, sy + 8), (CX + 13, sy + 8), (CX + 9, HIP_Y), (CX - 9, HIP_Y)], c["accent"])
        poly(d, [(CX - 9, sy + 96), (CX + 9, sy + 96), (CX + 8, sy + 128), (CX - 8, sy + 128)],
             lerp(c["accent"], INK, 0.28))
    if layer == "hoodie":
        poly(d, [(CX - 62, sy - 4), (CX + 62, sy - 4), (CX + 50, sy + 44), (CX - 50, sy + 44)],
             lerp(c["jacket"], INK, 0.18))
        line(d, CX - 22, sy + 40, CX - 26, sy + 150, lerp(c["jacket"], INK, 0.45), 5)
        line(d, CX + 22, sy + 40, CX + 26, sy + 150, lerp(c["jacket"], INK, 0.45), 5)
    if layer == "cardigan":
        line(d, CX - panel_w - 2, sy + 12, CX - panel_w - 14, HIP_Y, lerp(c["jacket"], INK, 0.34), 5)
        line(d, CX + panel_w + 2, sy + 12, CX + panel_w + 14, HIP_Y, lerp(c["jacket"], INK, 0.34), 5)
    if layer == "blazer":
        poly(d, [(CX - 96, sy + 10), (CX - 52, sy + 8), (CX - 40, HIP_Y), (CX - 96, HIP_Y)],
             lerp(c["jacket"], INK, 0.22))
        poly(d, [(CX + 96, sy + 10), (CX + 52, sy + 8), (CX + 40, HIP_Y), (CX + 96, HIP_Y)],
             lerp(c["jacket"], INK, 0.10))
        ell(d, CX + 60, HIP_Y - 44, 9, 9, lerp(c["accent"], PAPER, 0.45))


def draw_arms(d, C, slump):
    b, c = C["build"], C["cloth"]
    sw, limb = b["shoulder"], b["limb"]
    sy = SHOULDER_Y + slump
    for sgn, tone in ((-1, lerp(c["jacket"], INK, 0.22)), (1, c["jacket"])):
        x0 = CX + sgn * (sw - 10)
        x1 = CX + sgn * (sw + 6)
        poly(d, [(x0 - limb * 0.5, sy + 24), (x0 + limb * 0.5, sy + 24),
                 (x1 + limb * 0.38, sy + 268), (x1 - limb * 0.38, sy + 268)], tone)
        ell(d, x1, sy + 292, limb * 0.42, 30, tone)
        ell(d, x1, sy + 356, 19, 24, C["skin"])          # hand
        ell(d, x1, sy + 356, 19, 24, C["skin"])
        ell(d, x1 + sgn * 4, sy + 364, 13, 17, lerp(C["skin"], INK, 0.14))


def draw_neck(d, C):
    b = C["build"]
    nw = b["neck"]
    poly(d, [(CX - nw - 6, CHIN_Y - 44), (CX + nw + 6, CHIN_Y - 44),
             (CX + nw + 2, SHOULDER_Y + 16), (CX - nw - 2, SHOULDER_Y + 16)], C["skin"])
    poly(d, [(CX - nw - 6, CHIN_Y - 44), (CX + nw + 6, CHIN_Y - 44),
             (CX + nw + 2, CHIN_Y + 4), (CX - nw - 2, CHIN_Y + 4)], lerp(C["skin"], INK, 0.26))


HCX = CX + 14   # head nudged right -> 3/4 view
HEAD_OUTLINE = [
    (HCX - 92, 176), (HCX - 88, 132), (HCX - 52, 101), (HCX + 10, CROWN_Y),
    (HCX + 66, 106), (HCX + 95, 150), (HCX + 101, 206), (HCX + 93, 251),
    (HCX + 71, 293), (HCX + 35, 322), (HCX - 6, 328), (HCX - 43, 312),
    (HCX - 73, 276), (HCX - 90, 232),
]


def draw_hair_back(d, C):
    h = C["hair"]
    if h["style"] in ("long", "bob"):
        ln = h["len"]
        w = 118 * h["volume"]
        poly(d, [(HCX - 46, CROWN_Y + 6), (HCX + 76, CROWN_Y + 6),
                 (HCX + w, 400), (HCX + w - 6, ln), (HCX + 44, ln - 26),
                 (HCX - 24, ln), (HCX - w + 4, ln - 14), (HCX - w, 420)],
             lerp(h["main"], INK, 0.24))
        poly(d, [(HCX - 40, CROWN_Y + 10), (HCX + 30, CROWN_Y + 10),
                 (HCX + 44, 420), (HCX + 40, ln - 40), (HCX - 26, ln - 54),
                 (HCX - 42, 430)], h["main"])


def draw_head(d, C):
    poly(d, HEAD_OUTLINE, C["skin"])
    # away-side shadow band (single key light from the right)
    poly(d, [(HCX - 92, 176), (HCX - 50, 150), (HCX - 52, 240),
             (HCX - 20, 310), (HCX - 6, 328), (HCX - 43, 312), (HCX - 73, 276),
             (HCX - 90, 232)], lerp(C["skin"], INK, 0.16))
    # cheek + temple light
    poly(d, [(HCX + 46, 176), (HCX + 95, 152), (HCX + 101, 206),
             (HCX + 90, 246), (HCX + 56, 232)], lerp(C["skin"], PAPER, 0.22))
    # nose on the leading (right) edge -> sells the 3/4 turn
    poly(d, [(HCX + 84, 240), (HCX + 96, 262), (HCX + 78, 270)], lerp(C["skin"], INK, 0.20))
    ell(d, HCX - 84, 232, 17, 25, C["skin"])          # ear on the far side
    ell(d, HCX - 86, 234, 8, 13, lerp(C["skin"], INK, 0.22))


def draw_hair_front(d, C):
    h = C["hair"]
    m, hi = h["main"], h["hi"]
    style = h["style"]
    if style == "messy":
        poly(d, [(HCX - 94, 182), (HCX - 90, 132), (HCX - 54, 100), (HCX + 10, CROWN_Y - 4),
                 (HCX + 68, 105), (HCX + 97, 149), (HCX + 102, 188),
                 (HCX + 86, 170), (HCX + 70, 199), (HCX + 52, 166), (HCX + 38, 201),
                 (HCX + 22, 163), (HCX + 6, 199), (HCX - 12, 166), (HCX - 32, 199),
                 (HCX - 50, 165), (HCX - 72, 192), (HCX - 84, 168)], m)
        poly(d, [(HCX - 76, 150), (HCX + 20, 122), (HCX + 66, 148),
                 (HCX + 60, 168), (HCX - 30, 168)], hi)
        poly(d, [(HCX - 6, CROWN_Y - 6), (HCX + 26, CROWN_Y - 22), (HCX + 44, CROWN_Y + 2)], m)
    elif style == "swept":
        poly(d, [(HCX - 92, 178), (HCX - 86, 132), (HCX - 50, 100), (HCX + 10, CROWN_Y - 2),
                 (HCX + 68, 106), (HCX + 97, 150), (HCX + 102, 190),
                 (HCX + 88, 176), (HCX + 80, 150), (HCX + 60, 140), (HCX + 30, 132),
                 (HCX - 10, 140), (HCX - 44, 152), (HCX - 62, 174), (HCX - 80, 172)], m)
        poly(d, [(HCX - 60, 146), (HCX + 16, 124), (HCX + 62, 148),
                 (HCX + 54, 162), (HCX - 34, 166)], hi)
        if h.get("grey"):
            poly(d, [(HCX - 92, 178), (HCX - 86, 132), (HCX - 60, 108),
                     (HCX - 58, 140), (HCX - 66, 176)], hi)
            poly(d, [(HCX + 84, 158), (HCX + 100, 154), (HCX + 102, 190), (HCX + 86, 178)], hi)
    elif style == "long":
        poly(d, [(HCX - 96, 190), (HCX - 92, 132), (HCX - 54, 100), (HCX + 10, CROWN_Y - 4),
                 (HCX + 70, 106), (HCX + 100, 152), (HCX + 104, 196),
                 (HCX + 88, 178), (HCX + 78, 210), (HCX + 56, 182), (HCX + 40, 214),
                 (HCX + 16, 178), (HCX - 6, 208), (HCX - 30, 174), (HCX - 56, 206),
                 (HCX - 78, 176), (HCX - 88, 208)], m)
        poly(d, [(HCX - 80, 148), (HCX - 10, 118), (HCX + 56, 142),
                 (HCX + 46, 162), (HCX - 40, 172)], hi)
        poly(d, [(HCX - 104, 196), (HCX - 92, 190), (HCX - 84, 300),
                 (HCX - 72, 420), (HCX - 96, 414), (HCX - 116, 300)], m)
    elif style == "bob":
        poly(d, [(HCX - 104, 200), (HCX - 98, 130), (HCX - 56, 96), (HCX + 14, CROWN_Y - 8),
                 (HCX + 76, 106), (HCX + 108, 154), (HCX + 112, 208),
                 (HCX + 96, 186), (HCX + 84, 222), (HCX + 60, 190), (HCX + 44, 224),
                 (HCX + 18, 186), (HCX - 8, 218), (HCX - 34, 184), (HCX - 60, 216),
                 (HCX - 86, 182), (HCX - 96, 214)], m)
        poly(d, [(HCX - 84, 144), (HCX - 6, 112), (HCX + 64, 140),
                 (HCX + 52, 164), (HCX - 44, 170)], hi)
        poly(d, [(HCX - 112, 202), (HCX - 98, 196), (HCX - 90, 320),
                 (HCX - 78, 392), (HCX - 106, 388), (HCX - 124, 300)], m)


# ------------------------------------------------------------------- face ----
def brow(d, x, y, tilt, w=30, h=8):
    """tilt > 0 = inner end raised (worry) ; < 0 = inner end down (scowl)."""
    d.polygon([((x - w / 2) * SS, (y + tilt * 0.6) * SS),
               ((x + w / 2) * SS, (y - tilt * 0.6) * SS),
               ((x + w / 2) * SS, (y - tilt * 0.6 - h) * SS),
               ((x - w / 2) * SS, (y + tilt * 0.6 - h) * SS)], fill=lerp(INK, C_SKIN_D, 0.0))


def eye(d, x, y, w, h, lid=0.0, iris=8, dx=3, lash=9):
    """Flat VN eye: dark almond shell, sclera, iris, highlight, heavy upper lash.
    lid 0..0.8 = upper-lid drop (half-lidded for smug/exhausted/determined)."""
    ell(d, x, y, w, h, INK)
    ell(d, x, y + lash * 0.5, w - 5, h - 4, SCLERA)
    ix = x + dx
    iy = y + lash * 0.5
    ell(d, ix, iy, iris, iris * 1.08, INK)
    ell(d, ix + iris * 0.34, iy - iris * 0.40, iris * 0.30, iris * 0.26, SCLERA)
    if lid > 0:
        ly = y - h + 2 * h * lid
        ell(d, x, y - h - 2, w + 3, h + 6, C_SKIN)
        ell(d, x, y - h - 2, w + 3, h * 0.9, C_SKIN)
        d.rectangle(box(x - w - 3, y - h - h, x + w + 3, ly), fill=C_SKIN)
        ell(d, x, ly, w + 3, 11, C_SKIN)
        ell(d, x, ly - 2, w * 0.92, 7, INK)


def eye_closed_up(d, x, y, w, h, thick=11):
    """happy: closed eye arcing up"""
    d.arc(box(x - w, y - h, x + w, y + h), 200, 340, fill=INK, width=int(thick * SS))


def eye_closed_down(d, x, y, w, h, thick=10):
    """exhausted / defeated: lid arcing down"""
    d.arc(box(x - w, y - h, x + w, y + h), 20, 160, fill=INK, width=int(thick * SS))


def mouth_line(d, x, y, w, h=9, curve=0):
    d.line([((x - w / 2) * SS, (y + curve * 0.5) * SS),
            (x * SS, (y - curve * 0.5) * SS),
            ((x + w / 2) * SS, (y + curve * 0.5) * SS)],
           fill=INK, width=int(h * SS), joint="curve")


def mouth_open(d, x, y, w, h, teeth=False):
    ell(d, x, y, w, h, INK)
    if teeth:
        d.chord(box(x - w * 0.78, y - h, x + w * 0.78, y + h * 0.2), 180, 360, fill=SCLERA)


def blush(d, x, y, r=19, tint=0.30):
    for sgn in (-1, 1):
        ell(d, x + sgn * 52, y, r, r * 0.56, lerp(C_SKIN, ROSE, tint))


def sweat(d, x, y, r=15):
    poly(d, [(x - r * 0.62, y - r * 0.2), (x + r * 0.62, y - r * 0.2),
             (x + r * 0.34, y + r * 0.85), (x, y + r * 1.9),
             (x - r * 0.34, y + r * 0.85)], lerp(TEAL, DAWN, 0.42))
    ell(d, x - r * 0.16, y + r * 0.35, r * 0.22, r * 0.26, DAWN)


C_SKIN = SKIN
C_SKIN_D = SKIN_D
EX, BX, MX = HCX + 42, None, HCX + 26      # near eye (right), near mouth
EXL = HCX - 30                            # far eye (left)


def draw_face(d, C, mood):
    global C_SKIN
    C_SKIN = C["skin"]
    ex_l, ex_r, mx = EXL, EX, MX
    ey, by, my = EYE_Y, BROW_Y, MOUTH_Y

    if mood == "neutral":
        brow(d, ex_l, by, 2); brow(d, ex_r, by, 2)
        eye(d, ex_l, ey, 17, 15); eye(d, ex_r, ey, 17, 15)
        mouth_line(d, mx, my, 30, 8, curve=1)

    elif mood == "happy":
        brow(d, ex_l, by - 6, 8); brow(d, ex_r, by - 6, 8)
        eye_closed_up(d, ex_l, ey + 2, 20, 15)
        eye_closed_up(d, ex_r, ey + 2, 20, 15)
        mouth_open(d, mx, my + 4, 26, 17, teeth=True)
        blush(d, mx, my - 26, 20, 0.26)

    elif mood == "stressed":
        brow(d, ex_l, by - 4, -13); brow(d, ex_r, by - 4, -13)   # inner ends down
        eye(d, ex_l, ey + 2, 18, 17, lid=0.18, iris=7)
        eye(d, ex_r, ey + 2, 18, 17, lid=0.18, iris=7)
        line(d, ex_l - 26, by + 16, ex_r + 26, by + 16, lerp(C_SKIN, INK, 0.30), 4)   # brow furrow
        mouth_line(d, mx, my + 6, 32, 8, curve=6)
        line(d, mx - 20, my + 22, mx - 6, my + 14, INK, 7)
        line(d, mx - 6, my + 14, mx + 8, my + 22, INK, 7)
        line(d, mx + 8, my + 22, mx + 20, my + 14, INK, 7)
        sweat(d, ex_l - 44, ey - 34, 15)
        blush(d, mx, my - 24, 17, 0.20)

    elif mood == "shocked":
        brow(d, ex_l, by - 20, 14); brow(d, ex_r, by - 20, 14)
        eye(d, ex_l, ey - 2, 21, 20, lid=0.0, iris=6)
        eye(d, ex_r, ey - 2, 21, 20, lid=0.0, iris=6)
        ell(d, mx, my + 6, 15, 21, INK)
        sweat(d, ex_l - 46, ey - 46, 17)
        sweat(d, ex_r + 52, ey - 30, 13)

    elif mood == "determined":
        brow(d, ex_l, by + 6, -17); brow(d, ex_r, by + 6, -17)
        eye(d, ex_l, ey + 4, 18, 14, lid=0.46, iris=8)
        eye(d, ex_r, ey + 4, 18, 14, lid=0.46, iris=8)
        mouth_line(d, mx, my + 10, 36, 10, curve=-2)
        line(d, mx - 22, my + 2, mx + 22, my + 2, INK, 6)

    elif mood == "exhausted":
        brow(d, ex_l, by + 8, 10); brow(d, ex_r, by + 8, 10)
        eye(d, ex_l, ey + 6, 18, 13, lid=0.56, iris=7, lash=8)
        eye(d, ex_r, ey + 6, 18, 13, lid=0.60, iris=7, lash=8)
        for sgn, xx in ((-1, ex_l), (1, ex_r)):
            d.arc(box(xx - 17, ey + 14, xx + 17, ey + 34), 200, 340,
                  fill=lerp(C_SKIN, INK, 0.34), width=int(4 * SS))
        mouth_line(d, mx, my + 16, 26, 8, curve=-7)
        blush(d, mx, my - 22, 16, 0.16)
        sweat(d, ex_l - 46, ey - 20, 12)

    elif mood == "smug":
        brow(d, ex_l, by - 4, 7, w=28); brow(d, ex_r, by - 12, -2, w=30)
        eye(d, ex_l, ey + 3, 18, 14, lid=0.58, iris=8, dx=2)
        eye(d, ex_r, ey + 3, 18, 14, lid=0.40, iris=8, dx=5)
        d.arc(box(mx - 30, my - 12, mx + 14, my + 30), 300, 30,
              fill=INK, width=int(9 * SS))
        line(d, mx + 14, my + 16, mx + 30, my + 4, INK, 8)
        line(d, mx - 26, my - 4, mx - 40, my - 20, lerp(C_SKIN, INK, 0.26), 4)


# ------------------------------------------------------------------ figure ---
def render(cid, mood):
    C = CHARS[cid]
    slump = POSTURE[mood]
    img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_legs(d, C)
    draw_shoes(d, C)
    draw_hair_back(d, C)
    draw_neck(d, C)
    draw_torso(d, C, slump)
    draw_arms(d, C, slump)
    draw_head(d, C)
    draw_hair_front(d, C)
    draw_face(d, C, mood)
    out = img.resize((W, H), Image.LANCZOS)
    ddir = os.path.join(OUT, cid)
    os.makedirs(ddir, exist_ok=True)
    p = os.path.join(ddir, mood + ".png")
    out.save(p, "PNG", optimize=True)
    return p


def font(sz):
    for f in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf",
              "/System/Library/Fonts/Helvetica.ttc",
              "/Library/Fonts/Arial.ttf"):
        if os.path.exists(f):
            try:
                return ImageFont.truetype(f, sz)
            except Exception:
                pass
    return ImageFont.load_default()


def contact_sheet(ids=None):
    ids = ids or IDS
    cw, ch = 214, 322
    pad, top = 16, 74
    sw = pad + len(MOODS) * (cw + pad)
    sh = top + len(ids) * (ch + pad) + 16
    sheet = Image.new("RGB", (sw, sh), (245, 239, 230))
    d = ImageDraw.Draw(sheet)
    f1, f2 = font(26), font(21)
    d.text((pad, 16), "119 stage sprites  -  4 characters x 7 moods  -  1024x1536, facing 3/4 right",
           font=f1, fill=(26, 22, 20))
    for j, m in enumerate(MOODS):
        d.text((pad + j * (cw + pad) + cw // 2, 50), m, font=f2,
               fill=(120, 112, 100), anchor="mm")
    for i, cid in enumerate(ids):
        y = top + i * (ch + pad)
        d.text((pad, y + ch // 2), cid.upper(), font=f1, fill=(26, 22, 20), anchor="lm")
        for j, m in enumerate(MOODS):
            x = pad + 24 + j * (cw + pad)
            p = os.path.join(OUT, cid, m + ".png")
            if os.path.exists(p):
                sp = Image.open(p).convert("RGBA")
                sp.thumbnail((cw, ch), Image.LANCZOS)
                sheet.paste(sp, (x + (cw - sp.width) // 2, y + (ch - sp.height) // 2), sp)
            d.rectangle([x, y, x + cw, y + ch], outline=(214, 206, 194))
    p = os.path.join(ROOT, "docs", "art", "S3-sprites-contact.png")
    sheet.save(p, "PNG", optimize=True)
    return p


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    want = args[0] if args else "all"
    targets = IDS if want == "all" else [want]
    for cid in targets:
        for m in MOODS:
            print(render(cid, m))
    if "--sheet" in sys.argv or want == "all":
        print(contact_sheet(targets if want != "all" else None))