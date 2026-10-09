# S3 stage sprite manifest — 119 วัน / 119 Days

Card: `119-S3-A1` `t_83e1e414` · spec: `docs/design/S1-viewport-spec.md` §2.1–2.2 · style:
`../../first-jobber-vn/docs/art/style-scene1.md`

## How every sprite was made

**Code-drawn flat-vector with PIL** — `docs/art/make_sprites.py` (deterministic, no RNG, no
seed: the same run always produces identical pixels). **No AI generator and no paid image API
was used.** DrawThings, the owner's iPad DrawThings endpoint (`http://100.67.184.60:7860`), was
unreachable when this ran — probe returned HTTP `000` (no route), the same failure recorded on the
VN-A1 card `t_9612ac9f`. So the sprites were drawn in the **exact register of the shipped Scene 1
backgrounds** rather than in a different one: flat colour blocks butted edge-to-edge, **no
outlines**, one key light from the right, 2–3 hard tone bands per surface, no gradients or blur.
The silhouette is carried by colour blocks, not by stroke — the Scene 1 rule, applied to figures.

Rendering: drawn at 2× (2048×3072) and downsampled with LANCZOS for antialiased edges, then saved
as 8-bit RGBA PNG with a transparent background.

## Geometry contract (spec §2.1)

| Property | Value | Verified |
|---|---|---|
| Canvas | **1024 × 1536** (2:3 portrait) | all 28 files, single distinct size |
| Anchor | bottom-centre — feet on the bottom edge | bbox y1 = 1515 for every file |
| Head crown | ≈ y = 96 | measured 72–92 |
| Margin | ≥ 24px all sides | 0 ink in the edge band, all 28 files |
| Format | PNG, RGBA, transparent | alpha min = 0 everywhere |
| Facing | **3/4 to the right** in the source | nose on the leading (right) edge; right slot mirrors with `scaleX(-1)` |
| Text on sprites | none | required by spec §2.2 rule 6 |

Every mood of a character is **pixel-identical outside the head band** — same `bbox`
`(x0, 72, x1, 1515)` for all 7 of Ton's moods, same figure mass within 0.7%. That is the spec's
"the face moves, the stance does not" (§2.1) measured rather than asserted: mood is carried by
brows / eyes / mouth plus a small shoulder slump (`stressed` +7px, `exhausted` +13px), never by a
re-crop or a re-pose.

## Cast design

Colour keys follow `CHARACTERS` in `src/data/storyData.ts` (ton amber, may teal, chai rose, lin
purple). The character is recognisable across moods by hair silhouette, build and cloth layer —
the three things the check script measures.

| id | Name / role | Build | Hair | Cloth | Distinguishing read |
|---|---|---|---|---|---|
| `ton` | Ton — Junior UX/UI Designer, 22, probation day 88/119 | narrow shoulders, average | short messy, warm dark brown, lifted tuft | **amber** hoodie over paper tee, drawstrings | youngest read; amber is the brightest cloth on stage |
| `may` | May — Junior Frontend Dev, probation peer | slight, 0.965 height scale | **long** dark hair to mid-thigh, side part | **teal** cardigan over paper tee | the only long straight hair; teal |
| `chai` | P' Chai — Senior Account Director & Team Lead | **broadest** shoulders (134), 1.02 height | **swept back** with grey at the temples | **rose-tinted** suit, rose tie, paper shirt | biggest silhouette + grey temples; reads seniority |
| `lin` | Khun Lin — Managing Director & Partner | medium, 0.985 height scale | **bob**, volume 1.16, dark plum | **purple** blazer, lapels + single button, paper blouse | the only voluminous bob; purple |

## Mood matrix — 4 × 7 = 28 PNGs at `public/sprites/<id>/<mood>.png`

Moods actually used in `storyData.ts` (measured by parsing `speakerId` + `mood`, 34 lines):
`ton` exhausted 1 · `may` happy 5, stressed 3, neutral 1, shocked 1, determined 1, exhausted 1 ·
`chai` **smug 7**, neutral 4, shocked 2 · `lin` neutral 5, happy 2. The full 7 × 4 is drawn anyway,
per spec §2.2, so the §2.4 fallback chain never has a hole.

| mood | Art direction (same for every character — the face carries it, the body does not) |
|---|---|
| `neutral` | brows level, open eyes, small closed smile. The baseline the fallback chain lands on. |
| `happy` | brows raised, **eyes closed arcing up**, open smile with a teeth band, blush on both cheeks. |
| `stressed` | brows pinched **inward-down**, brow furrow line, tight wavy mouth, sweat drop at the temple, faint flush. |
| `shocked` | brows high and wide, **eyes at maximum** (large sclera, small iris), small round open mouth, **two** sweat drops. |
| `determined` | brows low and angled **inward-down**, eyes half-lidded under a hard upper lid, flat wide-set mouth line with a firm shadow bar. |
| `exhausted` | brows drooping, eyes half-lidded low with under-eye lines, downturned open frown, slumped shoulders (+13px), sweat drop. |
| `smug` | **half-lidded, asymmetric** — near eye more closed than the far eye, brows at different heights, one-sided smirk arc with the corner lifted, chin implied up. Deliberately **not** happy: spec §2.4 rule 8 forbids falling back to `happy`, because P' Chai's 7 `smug` lines mean *predatory*, not pleased. |

`mae` and `narrator` have no sprite (phone-only / voice-over) — their lines leave the stage
untouched (spec §2.2 rule 5).

## Verification — `docs/art/S3-sprites-check.log`

`python3 docs/art/check_sprites.py` (exit 0 = pass). It re-runs the card's acceptance criteria:
28 files present · all PNG/RGBA · transparent background · identical 1024×1536 · ≥24px margin ·
bottom-anchored with a uniform crop · contact sheet + manifest present · per-character palette and
silhouette stable across all 7 moods and distinct between characters.

Palette identity uses **share-thresholded colour buckets** (every bucket ≥1.5% of the band), not
top-N-by-count: two near-equal buckets swap rank when the face moves a few pixels, which made an
identical palette report as changed on `lin` in the first run.

Contact sheet (visual QA): `docs/art/S3-sprites-contact.png`. To inspect the art in the terminal
without a GUI, `python3 docs/art/ascii_view.py <id> --part head` renders any region as
BOX-downsampled ASCII — point-sampling aliases and hides the face, which is why it resizes to the
character grid first.

## Regenerate

```
python3 docs/art/make_sprites.py            # all 28 + contact sheet
python3 docs/art/make_sprites.py ton --sheet  # one character
python3 docs/art/check_sprites.py           # acceptance check -> S3-sprites-check.log
```