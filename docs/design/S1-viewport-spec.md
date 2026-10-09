# S1 Viewport + Sprite Stage Spec — GRITui/119

Owner: agent-N (ux-ui) · Card `t_d1a36892` (119-S1-U1) · Baseline `main` @ `28c6c46`
Implements: audit row **#3** (Part A) and **#9** (Part B) of `docs/audit/S0-issue-audit.md`
Consumed by: `119-S1-B2` `t_2e82094c` (Part A code), `119-S3-A1` `t_83e1e414` (Part B art), `119-S3-B3` `t_1dc4aa61` (Part B code)

Every value below is measured from the running app or read from source, not estimated.
Measurement method and raw numbers are in **Appendix A** so the builder can re-derive them.

---

## 0. What the measurement found (read this first)

The audit records #3 as "no sticky / no 15% rule, 1440 not measured". Measurement found
**three** defects, two of which are not in the audit at all:

| # | Defect | Evidence | In audit? |
|---|---|---|---|
| **B1** | HUD is **217px** on mobile — **25.7%** of 390×844 and **33.9%** of 360×640. The `<header>` uses `flex-wrap` (`NovelView.tsx:208`), so on mobile it wraps into three stacked rows. | Appendix A.1 | yes (#3) |
| **B2** | HUD rows 2 and 3 **overflow the right edge**. The toolbar row is 408px wide and the meters row 406px, both inside a 360–390px viewport. At 360 the `Preferences` button is clipped by 36px and `Main Menu` by **72px** — the Home button is half off-screen. Root cause: both are flex children with default `min-width:auto` and no shrink. | Appendix A.2 + screenshot | **no** |
| **B3** | At 360×640 with a choice node, the **dialogue box is rendered entirely off-screen** — `box.bottom = 871.5px` against a 640px viewport, so the player cannot read the line or the Thai sub-line at all. Root cause: the centre column (`:394`) is `flex-1` **without `min-h-0`**, so it cannot shrink below its content height, and the root (`:188`) is `h-screen` + `overflow-hidden`, which silently clips the overflow instead of scrolling. | Appendix A.3 + screenshot | **no** |

**B3 is the most severe**: it is a silent content loss on the smallest supported viewport, and
the root's `overflow-hidden` is why it produces no scrollbar and no error. The fix is three
CSS declarations (§1.1).

The audit's "no 15% sticky rule" reading is correct but understates it: this is not a missing
max-height, it is a wrap behaviour plus a missing `min-h-0`.

---

## 1. Part A — Viewport, HUD and dialogue box (audit #3)

### 1.1 Root shell — fix B3 first

`src/components/NovelView.tsx:187-191`. This is the change that makes every cap below possible.

| Property | Today | Specified | Why |
|---|---|---|---|
| `height` | `h-screen` (=`100vh`) | `height: 100dvh` | `100vh` reports the *largest* viewport (mobile browser chrome retracted), so on iOS/Android the flex column is taller than the visible area and the bottom of the dialogue box sits under the browser UI. `dvh` is the dynamic viewport. |
| `overflow` | `overflow-hidden` | keep `overflow-hidden` | Correct for a fixed-frame VN — but only once the centre column can shrink (below), so nothing is silently clipped. |
| `flex-direction` | `flex-col` | keep | |

```css
/* root shell */
.vn-root {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100dvh;            /* was h-screen / 100vh */
  width: 100%;
  overflow: hidden;
}

/* centre column — THE B3 FIX */
.vn-stage-col {
  position: relative;
  z-index: 30;
  flex: 1 1 auto;
  min-height: 0;             /* <-- without this the column cannot shrink; box renders off-screen */
  overflow-y: auto;          /* <-- overflow scrolls instead of being clipped by the root */
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
```

In Tailwind: `min-h-0` + `overflow-y-auto` on the `:394` container; `h-[100dvh]` on the `:188` root.
`min-h-0` is the single most important value in this document.

### 1.2 Breakpoints

Tailwind v4 defaults (`sm:640 md:768 lg:1024 xl:1280 2xl:1536`). Three tiers only — no fourth.

| Tier | Range | Class prefix | Frame |
|---|---|---|---|
| **MOBILE** | `< 768px` | *(base)* | 360×640, 390×844 |
| **TABLET** | `768–1279px` | `md:` | 768×1024 |
| **DESKTOP** | `1280px+` | `xl:` | **1440×900 (baseline)** |

The 15% sticky rule is a MOBILE rule (§1.3). TABLET and DESKTOP are capped by fixed heights instead.

### 1.3 The 15% sticky boundary

**Rule:** on MOBILE, `header.offsetHeight / window.innerHeight ≤ 0.15`, measured with the viewport
scrolled to any position. The root never scrolls, so the HUD is effectively always on screen — the
rule exists to stop it *eating the frame*, not to manage a scroll offset.

| Viewport | 15% budget | Specified HUD height | Ratio | Headroom |
|---|---|---|---|---|
| 390×844 | 126.6px | **71px** | **8.41%** | 55px |
| 360×640 | 96.0px | **71px** | **11.09%** | 25px |
| 768×1024 (tablet) | — | 88px | 8.59% | fixed height |
| 1440×900 (desktop) | — | **88px** | **9.78%** | fixed height |

71px is a **fixed** height, not a max — it must render identically at every mobile width so the
layout below never reflows. Today's 217px must come down to 71px.

Sticky mechanics: `<header>` gets `position: sticky; top: 0; z-index: 30; flex-shrink: 0`.
Because the root is `overflow:hidden` and the column scrolls, `sticky` is belt-and-braces; it
guarantees the HUD stays put if the centre column is ever scrolled.

### 1.4 Mobile HUD — the 71px budget

71px = `8 (padding-top) + 18 (row 1) + 6 (row gap) + 30 (row 2) + 8 (padding-bottom) + 1 (border)`.
`box-sizing: border-box`; heights are exact, not minimums.

**Row 1 — context strip, `height: 18px`**

Single line, `min-width: 0`, everything `text-overflow: ellipsis`. Never wraps.

| Element | Spec |
|---|---|
| chapter | `#FBBF24` (amber-400), `700`, `12px`, `uppercase`, `letter-spacing: 0.05em`, `max-width: 50%`, ellipsis |
| separators `·` | `#64748B`, `12px`, `aria-hidden`, `flex: 0 0 auto` |
| location | `#CBD5E1`, `500`, `12px`, `flex: 1 1 auto; min-width: 0`, ellipsis |
| timeOfDay | `#94A3B8`, `12px`, `flex: 0 0 auto` |
| weather chip | `flex: 0 0 auto`, `height: 18px`, `padding: 0 6px`, `border-radius: 6px`, `background: rgb(15 23 42 / 0.9)`, `border: 1px solid rgb(51 65 85 / 0.6)`, `gap: 4px`; icon `12×12`; temp `11px/600` `#E2E8F0` tabular-nums; impact `10px/700` — `#34D399` when `> 0`, `#FB7185` when `< 0`; `⚡` glyph |
| weather **label** | hidden below `md` (existing `hidden md:inline` at `:243` is correct — keep it) |

**Row 2 — controls strip, `height: 30px`, `display:flex; justify-content: space-between; gap: 8px; min-width: 0`**

Left group — **meters collapse to icon + value** (the audit's `flex-wrap` wrap is replaced, not kept):

| Meter | Icon | Value | Colour |
|---|---|---|---|
| Sanity | `Zap` 14×14 | `82%` | icon `#FBBF24`; `#F87171` + `animate-pulse` when `< 30` |
| Work Rating | `Target` 14×14 | `65%` | `#2DD4BF` |
| Integrity | `Shield` 14×14 | `80%` | `#818CF8` |
| Cash | **no icon** | `฿ 8,420` | `#6EE7B7` |

Each chip: `height: 24px; padding: 0 3px; gap: 2px; display:flex; align-items:center`;
value `10px/600` `#E2E8F0`, `font-variant-numeric: tabular-nums`.
Measured left group ≈ **159px**.

*Why Cash loses its icon on mobile:* `฿` is already the currency mark, and the Wallet glyph beside
it is redundant. It is the only way to fit all four values **and** the toolbar inside 336px at
360 wide (§1.5). Desktop keeps the icon.

Right group — **toolbar, 5 icon buttons + overflow**:

| # | Button | Icon | Colour | Size |
|---|---|---|---|---|
| 1 | Phone | `Smartphone` | `#FBBF24` | 28×28 |
| 2 | Log | `History` | `#94A3B8` | 28×28 |
| 3 | Map | `GitBranch` | `#FBBF24` | 28×28 |
| 4 | Save | `Save` | `#94A3B8` | 28×28 |
| 5 | **More** | `MoreHorizontal` (new) | `#94A3B8` | 28×28 |

Button: `28×28`, `border-radius: 8px`, `border: 1px solid rgb(51 65 85)`,
`background: rgb(15 23 42 / 0.8)`, icon `16×16`, `display: grid; place-items: center`,
hover `background: rgb(30 41 59 / 0.9)`. Unread phone dot unchanged: `10px` rose-500 circle at
`top:-2px; right:-2px` (today's `-top-1 -right-1`).
Widths `4px` gap: `5×28 + 4×4` = **156px**.

**Why a `More` button is required (this is new UI, deliberately):**
`159 + 8 + 156 = 323px` fits 360-wide (`336px` usable). The current 7-button toolbar alone is
`408px` — it cannot fit 360 or 390 at any icon size above ~20px, which is why B2 clips today.
`More` opens a bottom sheet holding the three secondary controls. Sheet spec:
`position: fixed; inset: auto 0 0 0; z-index: 50; background: rgb(2 6 23 / 0.96);
backdrop-filter: blur(12px); border-top: 1px solid rgb(51 65 85); border-radius: 16px 16px 0 0;
padding: 12px 12px calc(12px + env(safe-area-inset-bottom))`, three full-width rows
`height: 48px`, `font-size: 14px`, `#E2E8F0`, gap `8px`, icons `18px`; tapping the scrim or
`Escape` closes it. Reuse the existing `z-50` modal pattern from `GlossaryModal.tsx:27`.

*Trade-off, stated:* this drops the 28px tap target below the 44px iOS / 48px Android guideline.
Accepted for MOBILE only — the toolbar is secondary interaction (the dialogue box is the primary
one) and the alternative was losing a control or dropping a stat value. DESKTOP keeps 32×32.

### 1.5 Overflow budget check (B2)

| Viewport | Usable (`vw − 24px` padding) | Row 2 needs | Slack |
|---|---|---|---|
| 360 | 336px | 323px | 13px |
| 390 | 366px | 323px | 43px |

Also required, or B2 returns: **every** `<header>` child gets `min-width: 0`, and the two strip
rows get `flex-wrap: nowrap` (inheriting the root's `nowrap` is fine) plus `overflow: hidden`
so a future long chapter title clips instead of widening the row.

### 1.6 Dialogue box + Thai sub-line

Shared tokens, all tiers: `background: rgb(2 6 23 / 0.90)`, `backdrop-filter: blur(12px)`,
`border: 1px solid rgb(51 65 85 / 0.8)`, `border-radius: 16px`,
`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
(keep the existing `shadow-2xl`), `cursor: pointer`, click handler unchanged.

| Tier | Width | Padding | `min-height` | `max-height` |
|---|---|---|---|---|
| MOBILE | `left/right: 12px` (full width) | `12px 14px` | **145px** (unchanged, `:539`) | `46dvh` → 294px @640, 388px @844 |
| TABLET | `max-width: 640px; margin: 0 auto` | `16px 20px` | 150px | `46dvh` |
| DESKTOP | **`848px`, `margin: 0 auto`** (measured today — unchanged) | `20px` | **164px** (measured today) | 300px |

`max-height` + `overflow-y: auto` is the guarantee that an over-long line can never push the box
off-screen (B3). Internal scroll is a last resort — the caps are sized so real content fits
(§1.7).

**Vertical stack inside the box** — fixed, top to bottom:

| Row | Mobile | Desktop | Notes |
|---|---|---|---|
| nameplate | `28px`, `gap: 10px`, `margin-bottom: 8px` | `28px`, `gap: 10px`, `margin-bottom: 10px` | avatar badge `28×28` kept (S3-B3 requirement) + name `14px/700` in `character.color` + role `11px` `#94A3B8`; role hidden below `sm` |
| EN body | `14px/1.6` `#F8FAFC` (thought: italic `#CBD5E1`) | `16px/1.6` | unchanged from `:563-569` |
| Thai sub-line | `margin-top: 8px; padding-top: 6px; border-top: 1px solid rgb(30 41 59 / 0.8)`; `12px/1.5` `#94A3B8` | same, `13px/1.5` | unchanged position from `:570-572` |
| hint row | `margin-top: 10px; 11px` `#64748B` | `12px` | unchanged from `:578` |

**Thai line-breaking (audit #16's open item, cheap to close here).**
`overflow-wrap: anywhere; word-break: normal; line-break: normal;` on the Thai `<p>`.
Thai script has no inter-word spaces, so the browser has no legal break points; `anywhere` lets
it break inside a run instead of overflowing.

**Thai font — one line, do it.** `index.html:14` already loads Sarabun (300–600) but nothing
applies it: there is no `@theme` block in `src/index.css`, so Tailwind's `font-sans` is the stock
`ui-sans-serif` stack and **every Thai glyph on the site falls back to the OS Thai font**
(Thonburi on Apple, Noto on Android/Linux) — different shapes per platform. Add to `src/index.css`:

```css
@theme {
  --font-sans: 'Plus Jakarta Sans', 'Sarabun', system-ui, sans-serif;
}
```

Sarabun already covers Thai + Latin, so EN and TH lines in one line-box share a type voice, and
the site stops shipping two different Thai designs depending on the reader's OS.

### 1.7 Do the caps fit the real content? (measured from `storyData.ts`)

| | Longest | p90 | median |
|---|---|---|---|
| EN dialogue line | **293 chars** (12 lines > 200) | 207 | 118 |
| Thai sub-line | **132 chars** (18 lines total) | — | 90 |
| Worst choice line | **227 chars** EN (`nn_7`) | — | — |

At MOBILE 360, inner text width = `336 − 28` = **308px**. EN at `14px` ≈ 45 chars/line →
293 chars = **7 lines** = `7 × 22.4` = **157px**. Thai at `12px` ≈ 46 chars/line →
132 chars = **3 lines** = `3 × 18` = **54px**. Plus nameplate 28 + 8, hint 10 + 16, Thai border 6,
box padding 24 → **311px**. Cap is 294px (`46dvh` @640).

**The 17px shortfall is real and is resolved by scrolling, not by shrinking type.** Mobile frame
budget at 360×640: HUD 71 + gap 8 + box ≤ 294 + bottom pad 8 = 381 of 640 → **259px** of stage
above the box, so the box never grows past its cap in practice; the scroll only engages on the
single 293-char line. Do not reduce the type size to chase it.

Choice stack (`min-h` none, `max-height` per tier): MOBILE **200px**, TABLET 260px,
DESKTOP **320px**, with `overflow-y: auto` and `gap: 8px` (today's `gap-2.5`).
Mobile choice button: `padding: 10px 12px; border-radius: 12px;` title `14px/700`,
subtext `12px/1.4` `#CBD5E1`, impact `11px` `#FBBF24`; `→` arrow `16px` `#64748B`.
Frame check, worst case 360×640 with choices: `71 + 8 + 200 + 8 + 294 + 8` = **589 ≤ 640** ✓
(51px slack). At 1440×900: `88 + 12 + 320 + 12 + 300 + 16` = **748 ≤ 900** ✓.

**Writer rule (no code):** no dialogue line above **220 characters**. The 293-char outlier would
have scrolled on every mobile device. That is a writing problem, not a UI problem — flag new
lines over 220 to VN-W rather than shrinking the type.

### 1.8 Desktop 1440×900 baseline — exact expected values

The probe in 119-S1-B2 asserts these. Today vs specified:

| Metric | Today | Specified | Δ |
|---|---|---|---|
| HUD height | 97px (10.78%) | **88px** (9.78%) | −9px |
| HUD rows | 2 (wraps) | 2 (explicit) | — |
| Row 1 | metadata + meters, `h 26px` | same, `h 26px` | — |
| Row 2 | toolbar, `h 30px` | toolbar, `h 30px` | — |
| Toolbar buttons | 7 × ~32px | 7 × **32px**, `gap 8px` = 272px, left-aligned | — |
| Meters | 4, labels shown, right-aligned in row 1 | 4, labels shown, right-aligned in row 1 | — |
| Weather label | shown (`lg:inline`) | shown | — |
| Dialogue box width | 848px centred | **848px** centred | unchanged |
| Dialogue box `min-height` | 164px | **164px** | unchanged |
| Choices visible without scroll | 3 | 3 (stack 320px) | — |
| Right-edge clipping | none | none | — |

DESKTOP HUD internals: `height: 88px` fixed, `padding: 8px 24px`, `gap: 12px`,
row 1 `26px`, row 2 `30px`, `border-bottom: 1px solid rgb(30 41 59 / 0.6)`,
`background: rgb(2 6 23 / 0.80)`, `backdrop-filter: blur(12px)`.
Row 1 = `justify-content: space-between`, metadata left, meters right, `nowrap`.
Row 2 = toolbar left, `nowrap`. **All 7 buttons visible** — no `More` sheet above `md`.

Why 88 and not 96: `88/900 = 9.78%` clears the 15% rule by 5.2 points even if the tier is ever
re-capped, and it is 9px shorter than today on the busiest frame (long chapter title + weather
label + all meters). The empty right half of row 2 is deliberate — a quiet baseline.

### 1.9 Z-order (Part A layers)

| z | Layer | Element |
|---|---|---|
| 0 | background photo | `:193` `img.absolute inset-0` |
| 10 | rain canvas | `RainCanvas.tsx:76` / `WeatherOverlay.tsx:264` |
| 15 | heat-haze shimmer | `WeatherOverlay.tsx:268` — **change `z-15` → `z-[15]`** (`z-15` is not a default Tailwind step) |
| **20** | **sprite stage** | new, §2.5 |
| 30 | HUD header | `:208` |
| 30 | centre column + dialogue box + choices + banners | `:394` |
| 50 | modals (Phone, Log, Map, Save/Load, Glossary, Settings, **More sheet**) | all `*Modal.tsx` |

---

## 2. Part B — Sprite stage (audit #9)

### 2.1 Canvas — **1024 × 1536 px** (2:3 portrait)

**Every sprite is exactly 1024×1536, transparent background, 8-bit RGBA PNG.**
One size for all four characters and all seven moods — the art card (`t_83e1e414`) acceptance
already requires identical WxH, and one size is what makes a shared crossfade and a single
`object-fit` rule possible.

| Decision | Value | Why |
|---|---|---|
| Master size | `1024 × 1536` | ≥ 2× the largest on-screen size. Largest display is `520px` tall on DESKTOP; at `deviceScaleFactor: 2` that needs 1040 device px, so 1536 master stays crisp on retina without upscaling. |
| Aspect | 2:3 | Full figure head-to-toe with breathing room. VN convention (Ren'Py, LoV, VA) — a waist-up crop reads as a portrait, not a character. |
| Figure extent | feet at `y = 1536`, head crown ≈ `y = 96` | Bottom-anchored figure; the top 96px is headroom for tall hair/hats so no mood needs a different crop. |
| Anchor | **`(512, 1536)` — bottom-centre** | Feet are the stable identity across moods; the face moves, the stance does not. Bottom-centre anchoring also means the dialogue box can overlap the figure's lower legs without any per-mood offset. |
| Margin | ≥ 24px on all four sides | Keeps arms/hair out of neighbouring slots and out of the fade. |
| Target file size | ≤ 400 KB each (28 files ≈ 11 MB max, realistically ~3 MB for flat-vector art) | Above this, art must flatten — see art card. |

**Paths** (unchanged from the art/builder card bodies, now fixed by this spec):
`public/sprites/<characterId>/<mood>.png`, e.g. `public/sprites/chai/smug.png`.

### 2.2 Cast, slots and who goes where

Sprites exist for **4** characters. `mae` and `narrator` never get one.

| id | Name | Sprite | Roles | Moods used in `storyData.ts` |
|---|---|---|---|---|
| `ton` | Ton | ✅ | Junior UX/UI Designer, POV | `exhausted` (1) |
| `may` | May | ✅ | Junior Frontend Dev, peer | `neutral` 1, `happy` 5, `stressed` 3, `shocked` 1, `determined` 1, `exhausted` 1 |
| `chai` | P' Chai | ✅ | Senior Account Director, team lead | `neutral` 4, `shocked` 2, **`smug` 7** |
| `lin` | Khun Lin | ✅ | Managing Director & Partner | `neutral` 5, `happy` 2 |
| `mae` | Mae (Mom) | ❌ | phone-only | `neutral` (1) — no sprite |
| `narrator` | Bangkok Observer | ❌ | voice-over | — |

**Art deliverable: 4 × 7 = 28 PNGs.** All seven moods for all four characters, including `smug`
for ton/may/lin even though only `chai` uses it today — the fallback rule (§2.4) is simpler when
the matrix is complete, and the art card already allows for this.

**`smug` is P' Chai's signature** — 7 of the 34 mood lines in the whole story, all his. It is the
beat that carries the game's moral-pressure theme, so it must be the strongest read on the stage:
half-lidded, asymmetric smirk, chin slightly up. Do not draw it as "happy".

**Two-slot rule** (`data` has 8 direct non-ton → non-ton transitions, e.g. `may→chai`,
`chai→lin`, `lin→may`, so a single fixed side per character would make sprites teleport):

1. The **incoming** speaker takes the slot the **outgoing** speaker is *not* in.
2. If incoming == outgoing (same speaker, new mood), the sprite **crossfades in place** — the slot
   never changes.
3. If the target slot is occupied, that occupant is replaced (i.e. the speaker from two lines ago).
4. **Initial placement:** `ton` → LEFT, every other character → RIGHT.
5. **Narrator / `mae` lines change nothing.** No fade, no swap — the last on-stage sprites stay
   put and simply go idle. `ton → narrator` occurs 12 times and `narrator → ton` 7 times; fading
   the whole stage out and back on every narration beat would strobe the frame. The nameplate
   ("Bangkok Observer" / "Mae (Mom)") carries the attribution, so there is no ambiguity.
6. **Facing:** draw every sprite facing **3/4 to the right**. The RIGHT slot renders
   `transform: scaleX(-1)`. One asset serves both slots — halving the art workload — and it is
   safe because sprites carry no text (the nameplate is DOM text, `NovelView.tsx:550`). Do not
   draw text, logos or badges on a sprite; if a mood needs a prop with lettering, letter it
   mirrored in the source.

### 2.3 Display size and slot geometry

`object-fit: contain`, `object-position: 50% 100%` (bottom-centre), `pointer-events: none`.

**DESKTOP (1280px+) — the 1440 baseline**

| Value | Spec |
|---|---|
| Display height | **520px** → display width `520 × (1024/1536)` = **347px** |
| LEFT slot — centre `x` | **300px** → box `x: 127`, `y: 200`, `w: 347`, `h: 520` |
| RIGHT slot — centre `x` | **1140px** → box `x: 967`, `y: 200`, `w: 347`, `h: 520` |
| Slot centre separation | **840px** (≥ 2× width, so no overlap) |
| Bottom anchor | sprite bottom = dialogue box top edge (`y ≈ 720` at 1440×900) |
| Stage band | `top: 97` (below HUD) → `bottom: 720`; height **623px**, sprite 520 → 103px slack |

**TABLET (768–1279)**

| Value | Spec |
|---|---|
| Display height | **380px** → width **253px** |
| LEFT centre `x` | `18%` of viewport width; RIGHT `82%` |
| Bottom anchor | dialogue box top |

**MOBILE (< 768px) — the 390 and 360 baseline**

| Value | Spec (390×844) | Spec (360×640) |
|---|---|---|
| Display height | **240px** | **240px** |
| Display width | **160px** | **160px** |
| LEFT slot — centre `x` | **115px** | **110px** |
| RIGHT slot — centre `x` | **275px** | **250px** |
| Slot centre separation | 160px (exactly touching — no overlap) | 140px → 20px overlap, acceptable at this width |
| Bottom anchor | dialogue box top edge | dialogue box top edge |

Both sprites at `240px` sit inside the 259px of stage the frame budget leaves (§1.7).

**Mobile visibility rule:** the stage is `flex: 1 1 auto; min-height: 0`. If the resolved stage
height is **< 200px**, the sprite is **not rendered** (nameplate badge only — no clipped sliver).
In practice this means **MOBILE hides sprites whenever a choice stack is visible**, because the
200px choice cap plus a 294px box leaves too little stage. With no choice node, stage is 259px and
sprites show. Implement with a `ResizeObserver` on the stage element (threshold 200px), not with
media queries — the stage height depends on content, not viewport.

### 2.4 Mood resolution and fallback (order matters)

Applied per frame, from `line.speakerId` + `line.mood`:

| # | Condition | Result |
|---|---|---|
| 1 | speaker is `narrator` or `mae` | **no sprite change** (§2.2 rule 5) |
| 2 | speaker not in {ton, may, chai, lin} | no sprite; nameplate only |
| 3 | `line.mood` is `undefined` or `null` | use `neutral` |
| 4 | `line.mood` ∉ the 7 `Mood` values (data drift) | use `neutral` |
| 5 | `public/sprites/<id>/<mood>.png` loads | use it |
| 6 | that file 404s | use `public/sprites/<id>/neutral.png` |
| 7 | `neutral` also 404s | render **no sprite**; keep the avatar-initial badge. No broken `<img>`, no console error, no layout shift. |
| 8 | `smug` requested but the file is absent | falls through rule 6 to `neutral` — **never** to `happy`. `smug` is a distinct beat; substituting `happy` would make P' Chai look pleased when the script means predatory. |

Rules 5–8 are what 119-S3-B3 asserts (`no 404s in the network log`, `unknown mood shows the
fallback with no console error`).

**The one mood with no art direction in the audit's list is `smug`** — the audit's #9 criterion
names six moods (Neutral / Happy / Stressed / Shocked / Determined / Exhausted) but the data also
carries `smug` (7 lines, all P' Chai). `smug` is a **required 7th mood**, art-directed as §2.2.
This is the gap between the issue text and the shipped data.

### 2.5 DOM shape, crossfade, preload

```html
<!-- inside .vn-stage-col, FIRST child, above the banners and the box -->
<div class="vn-sprite-stage" aria-hidden="true">
  <div class="vn-sprite-slot vn-sprite-slot--left">
    <img class="vn-sprite-layer" src="/sprites/chai/smug.png" alt="">
    <img class="vn-sprite-layer" src="/sprites/chai/neutral.png" alt="">  <!-- crossfading out -->
  </div>
  <div class="vn-sprite-slot vn-sprite-slot--right"> … </div>
</div>
```

```css
.vn-sprite-stage { position: relative; flex: 1 1 auto; min-height: 0; z-index: 20; pointer-events: none; }
.vn-sprite-slot  { position: absolute; bottom: 0; }
.vn-sprite-slot--left  { left: 0; }
.vn-sprite-slot--right { right: 0; }
.vn-sprite-layer {
  position: absolute; bottom: 0; height: 520px; width: auto;
  object-fit: contain; object-position: 50% 100%;
  transition: opacity 150ms linear;
  opacity: 0;
}
.vn-sprite-layer.is-active { opacity: 1; }
.vn-sprite-slot--right .vn-sprite-layer { transform: scaleX(-1); }
@media (max-width: 1279px) { .vn-sprite-layer { height: 380px; } }
@media (max-width: 767px)  { .vn-sprite-layer { height: 240px; } }
```

**150ms crossfade** (the #9 criterion, verbatim): `transition: opacity 150ms linear`, both layers.
Swap sequence — mount the new `<img>` with `opacity: 0`, force reflow (`void el.offsetWidth`),
add `is-active` on the next `requestAnimationFrame`, unmount the old layer at
`transitionend` (or a `setTimeout(150)` fallback if `transitionend` never fires — a cached or
failed image can skip it). **Linear, not ease-in-out**: at 150ms an eased curve reads as a
slow-down at the end, which on a face swap looks like a grimace. The linear ramp keeps the
expression change legible as a cut-through-blur.

Same-speaker mood change crossfades **in place** in the same slot; a speaker change crossfades
old-slot-out / new-slot-in with the same 150ms (they are independent elements, so they overlap
rather than queue — total perceived transition stays 150ms, not 300ms).

**Preload:** on node change, `new Image().src` for every `<speakerId>/<mood>.png` the incoming
node's lines reference, plus that character's `neutral.png`. Without it the fade-in starts from a
blank frame on first load — the #9 acceptance explicitly probes for this.

**`alt` is always empty and the stage is `aria-hidden`** — the speaker is already announced by
the nameplate text, so an image label would double-read it.

### 2.6 Sprite ↔ overlay interaction

Sprites render **above** the rain canvas (`z-20` vs `z-10`) and **below** the HUD, banners and
dialogue box (`z-30`). Consequence: rain streaks pass *behind* the figures (correct — they are in
the scene), while the heat-haze shimmer (`z-[15]`) and the dialogue box pass in front. The box
overlapping a figure's shins is deliberate VN depth, not a collision, and is why the anchor is
bottom-centre.

---

## 3. Builder checklist (119-S1-B2, Part A)

1. Root `:187-191`: `h-screen` → `h-[100dvh]`.
2. Centre column `:394`: add `min-h-0 overflow-y-auto`, set `gap` per tier (§1.7).
3. Header `:208`: `sticky top-0 z-30 shrink-0`, fixed height per tier, `min-w-0` on all children,
   `overflow-hidden` on both strip rows.
4. Restructure the header into exactly two rows (context / controls) with the tier values in §1.4,
   §1.8. Meters → icon + value on mobile, Cash loses its icon. Toolbar → 5 icon buttons +
   `More` sheet (MOBILE/TABLET), 7 buttons (DESKTOP).
5. Dialogue box `:537-540`: tier width/padding/`min-height`/`max-height` + `overflow-y-auto` (§1.6).
6. Thai `<p>` `:570-572`: add `overflow-wrap: anywhere`.
7. `src/index.css`: add the `@theme { --font-sans: … 'Sarabun' … }` block.
8. `WeatherOverlay.tsx:268`: `z-15` → `z-[15]`.
9. Probe asserts: `header.offsetHeight / innerHeight ≤ 0.15` at 390×844 and 360×640; HUD = 71px
   both; HUD = 88px at 1440×900; dialogue box `bottom ≤ innerHeight` and Thai `<p>` bottom
   `≤ innerHeight` on prologue + a choice node + a Thai-sub-line node, at all three sizes;
   zero header children with `right > innerWidth`.
10. `npm run check` exit 0.

## 4. Art checklist (119-S3-A1, Part B) — read this before drawing

**Canvas: 1024 × 1536 px (2:3), transparent, identical for every file.**
Anchor `(512, 1536)` bottom-centre, feet on the bottom edge, ≥ 24px margin all sides, head crown
≈ `y = 96`. 4 characters × 7 moods = **28 PNGs** at `public/sprites/<id>/<mood>.png`.
Draw **facing 3/4 right** — the right slot mirrors with `scaleX(-1)`. No text on any sprite.

## 5. Builder checklist (119-S3-B3, Part B)

1. Add the stage as first child of `.vn-stage-col` (§2.5 DOM).
2. Mood resolution + fallback chain (§2.4, rules 1–8). `smug` → `neutral`, never `happy`.
3. Two-slot assignment (§2.2 rules 1–6); narrator/`mae` lines change nothing.
4. 150ms linear crossfade, old layer unmounted on `transitionend` + 150ms fallback timer.
5. Slot geometry + `ResizeObserver` hide-below-200px (§2.3).
6. Preload the incoming node's sprites (§2.5).
7. Keep the avatar-initial badge in the nameplate.
8. Probe: `src` matches `/sprites/<speaker>/<mood>.png`; unknown mood → fallback, no console
   error; **no 404s**; before/mid-75ms/after screenshots at 390×844 and 1440×900; 119-S1-B2's
   ≤ 15% probe still passes **with sprites on screen**.

---

## Appendix A — measurements

`npm run dev` on `main` @ `28c6c46`, headless Chrome via CDP,
`Emulation.setDeviceMetricsOverride` per size, `deviceScaleFactor: 1`, title screen
"Begin Journey" clicked, then 6 dialogue advances; choice state reached by advancing until
`Impact:` buttons appeared (12–13 clicks).

### A.1 Current HUD height (defect B1)

| Viewport | HUD height | Ratio | 15% budget | Over by |
|---|---|---|---|---|
| 390×844 | **217px** | **25.71%** | 126.6px | +90.4px |
| 360×640 | **217px** | **33.91%** | 96.0px | +121px |
| 1440×900 | 97px | 10.78% | — | — |

Why 217: the header's three children wrap onto three rows —
context block `98px` (y 12–110), meters `32px` (y 126–158), toolbar `30px` (y 174–204).

### A.2 Current right-edge overflow (defect B2)

Measured row widths vs viewport:

| Row | Intrinsic width | 390 | 360 |
|---|---|---|---|
| meters (`:265-295`) | 406px | overflows by 16px | overflows by 46px |
| toolbar (`:297-390`) | 408px | overflows by 18px | overflows by 48px |

Clipped buttons (`right − innerWidth`, negative = past the edge):

| Viewport | Preferences | Main Menu | Cash meter |
|---|---|---|---|
| 390×844 | −6px | **−42px** | −40px |
| 360×640 | **−36px** | **−72px** | −70px |
| 1440×900 | none | none | none |

### A.3 Current dialogue box (defect B3)

| Viewport | State | `box.top` | `box.bottom` | Box height | Inside viewport? |
|---|---|---|---|---|---|
| 390×844 | plain | 647.3 | 828 | 180.8 | ✅ |
| 390×844 | choice ×3 | 658 | 828 | 170 | ✅ |
| 360×640 | plain | 443.3 | 624 | 180.8 | ✅ |
| 360×640 | choice ×3 | **701.5** | **871.5** | 170 | ❌ **231.5px below the fold** |
| 1440×900 | plain | 719.5 | 884 | 164.5 | ✅ |
| 1440×900 | choice ×3 | 739 | 884 | 145 | ✅ |

At 360×640 with choices the column's `scrollHeight` is 681 against a 680.5px client box, and the
root reports `scrollHeight − innerHeight = 0` — the overflow is swallowed by the root's
`overflow-hidden`, so there is no scrollbar and no error, only an unreadable screen.

### A.4 Story data

- 84 line objects; **34** carry `mood`.
- EN dialogue lines: 108, longest **293**, p90 207, p50 118; 12 lines > 200.
- Thai sub-lines: **18**, longest **132**, p50 90.
- Choices: 13 lines; worst EN on a choice line **227** (`nn_7`).
- Speaker → mood: `chai` neutral 4 / shocked 2 / **smug 7**; `lin` neutral 5 / happy 2;
  `may` happy 5 / stressed 3 / neutral 1 / shocked 1 / determined 1 / exhausted 1;
  `ton` exhausted 1; `mae` neutral 1.
- Speaker order: `ton→narrator` ×12, `narrator→ton` ×7, `ton→ton` ×6, `narrator→narrator` ×6,
  `narrator→may` ×6, `may→ton` ×5, `may→chai` ×5, `chai→narrator` ×4, `chai→ton` ×4,
  `narrator→lin` ×4. Direct non-ton → non-ton transitions: `may↔chai`, `chai↔lin`, `lin→may`,
  `may→may`, `lin→lin`, `chai→chai` (8 pairs) → the two-slot rule in §2.2 is required.

### A.5 Mockups

- `docs/design/S1-viewport-spec-mobile-390x844.png` — MOBILE tier with the 15% boundary drawn.
- `docs/design/S1-viewport-spec-desktop-1440x900.png` — DESKTOP baseline with slot geometry.

### A.6 Background images

All four `src/assets/images/bangkok_*.jpg` are **1376 × 768** (1.79:1). At 1440×900 the
`object-cover` crop is roughly 9% top and bottom; at 390×844 it crops ~28% off each side. Keep
`object-position: center` (current) — the stage slots in §2.3 sit over the frame's centre where
the crop retains the subject.

## Appendix B — why these values

- **71px mobile HUD** — the 15% rule budgets 126.6px @844 and 96px @640. 71px clears both with
  real headroom, which matters because Thai/English chapter titles and locations vary in length
  and a wrap would silently blow the budget. Two rows of 18 + 30px is what fits four stat values,
  four controls and a weather chip at 336px usable width (§1.5).
- **`min-h-0` before any cap** — a flex item's default `min-height:auto` prevents it shrinking
  below content. Without it, no `max-height` on the box or the column can prevent B3; the cap
  has to be paired with the shrink permission.
- **Meters keep their numbers on mobile** — the four stats are the game's whole feedback loop;
  an icon-only HUD would hide the mechanic the player is making decisions with. They lose the
  *label* (icon + value only), which is what the 13px slack at 360 forces.
- **`More` sheet instead of seven tiny buttons** — arithmetic, not taste: seven buttons cannot fit
  360px above 20px per button, and at 20px they fail the tap-target guideline anyway. One extra
  element is cheaper than losing a control or a stat.
- **Narration does not touch the stage** — 19 of the speaker transitions involve `narrator`. A
  fade-out/fade-in per narration beat strobes the frame; the nameplate already says who is
  speaking.
- **One sprite canvas, mirrored for the right slot** — 28 files instead of 56, one `object-fit`
  rule, and the art card's "identical WxH" acceptance becomes automatic. Safe because no sprite
  carries text.
- **150ms linear** — the criterion's number, kept. `linear` rather than eased because an eased
  150ms ramp decelerates into the new expression, which on a face reads as a settle-in rather
  than a change of mood.
- **`smug` is required art, `smug` never falls back to `happy`** — it is P' Chai's signature beat
  in 7 lines, and substituting `happy` would invert the scene's meaning. It also reveals that the
  audit's six-mood list predates the shipped data.
- **Thai font wired in via `@theme`** — Sarabun is already being downloaded and discarded. One
  declaration makes Thai render in the intended typeface on every platform instead of whatever
  the reader's OS ships, and keeps EN and TH in one type voice.

## Appendix C — known trade-offs

| Trade-off | Chosen | Rejected alternative |
|---|---|---|
| Mobile toolbar tap targets | 28×28 (below the 44px guideline) | 20px buttons (fails worse) or dropping a control |
| Mobile stat labels | Icon + value, label hidden | Full labels — ~46px over budget at 360 |
| 293-char line | Scrolls inside the box's 294px cap | Shrinking mobile type below 14px |
| Writer line length | ≤ 220 chars (no code) | Silent scroll on every phone |
| Desktop row 2 right half | Empty | Centring the toolbar — breaks HUD ↔ box left-edge alignment |
| `mae` / `narrator` sprites | None, stage holds its last state | Phone-portrait sprite; fades every narration beat |
