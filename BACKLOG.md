# Bangkok 9-to-Late: Project Backlog & GitHub Issues

This document contains the complete specification of all 18 planned GitHub Issues across 5 Sprints.

---

## Sprint 1: Core VN Engine & Prologue (Week 1–2)

### 1. [Sprint 1] Core Visual Novel State Machine & Script Parser
- **Labels:** `area:engine`, `priority:critical`, `sprint-1`
- **Description:** Implement a deterministic state machine for scene transitions, typewriter text delivery, skip mode, and auto-play pacing.
- **Acceptance Criteria:**
  - Support `TITLE`, `PLAYING`, and `ENDING` states.
  - Implement typewriter engine with configurable speeds (Instant, Fast, Normal, Slow) and click-to-complete.
  - Keyboard listeners for `Space`, `Enter`, and mouse click to advance dialogue.
  - Prevent race conditions during rapid skipping.

### 2. [Sprint 1] Prologue Script & Bangkok Commute Dilemma
- **Labels:** `area:story`, `priority:high`, `sprint-1`
- **Description:** Write complete English and Thai script for the 08:15 AM BTS Siam Station commute dilemma.
- **Acceptance Criteria:**
  - Script lines include character tags, thoughts, and atmospheric setting markers.
  - Establish Ton's background, the 119-day probation countdown, and financial stress.
  - Implement 3 divergent choices: BTS crowd squeeze, Win-Win motorbike taxi, and 7-Eleven cold brew wait.

### 3. [Sprint 1] Responsive VN Viewport & Top Bar HUD
- **Labels:** `area:visual`, `area:engine`, `priority:high`, `sprint-1`
- **Description:** Build the 1440px desktop baseline interface with responsive mobile scaling, dialogue nameplates, and vitals meters.
- **Acceptance Criteria:**
  - Display unboxed metadata: Current Chapter, Location, and Time of Day.
  - Render real-time meters for Sanity (Energy), Work Performance, Integrity, and THB Cash.
  - Mobile layout maintains a max 15% sticky boundary without obscuring narrative text.

### 4. [Sprint 1] Web Audio Procedural SFX Prototype
- **Labels:** `area:audio`, `priority:medium`, `sprint-1`
- **Description:** Build the zero-dependency browser Web Audio synthesizer for key environmental audio.
- **Acceptance Criteria:**
  - Synthesize authentic BTS Skytrain 2-tone chime (E5 -> B4).
  - Procedural pink-noise filter for Bangkok monsoon rain.
  - Mechanical keyboard typing clicks and UI tap feedback.
  - Safe user-gesture audio context initialization (prevents autoplay blocking).

---

## Sprint 2: Branching Narrative & Smartphone System (Week 3–4)

### 5. [Sprint 2] Act 1 & 2 Script: The 18:45 Scope Crisis & Midnight Red Bull
- **Labels:** `area:story`, `priority:critical`, `sprint-2`
- **Description:** Write the full branching script for P' Chai's urgent Friday night scope change and the Slide 14 metric manipulation dilemma.
- **Acceptance Criteria:**
  - Path A (All-Nighter): High stress, compromised data, and peer friction.
  - Path B (Tactical Diplomacy): Phased MVP presentation, preserving team sanity.
  - Path C (Direct Rebellion): Technical honesty triggering Managing Director Lin's intervention.

### 6. [Sprint 2] Act 3, 4 & The 5 Endings Script
- **Labels:** `area:story`, `priority:critical`, `sprint-2`
- **Description:** Finalize the narrative arcs for Soi 22 late-night noodles, Day 119 final probation review, and all 5 distinct epilogues.
- **Acceptance Criteria:**
  - Ending 1: The Silicon Sukhumvit Climber (Corporate promotion, isolated burnout).
  - Ending 2: Studio Chao Phraya (Resigned with May, indie creative freedom).
  - Ending 3: The Bangkok Pragmatist (Master of 18:30 boundaries).
  - Ending 4: Burnout Crash & Life Reboot (Medical pause, family perspective).
  - Ending 5: The Glass Tower Reformer (Whistleblower triumph, systemic culture change).

### 7. [Sprint 2] Interactive Smartphone Subsystem (LINE Chat & Mobile Banking)
- **Labels:** `area:engine`, `area:visual`, `priority:high`, `sprint-2`
- **Description:** Develop an in-game smartphone widget styled like modern chat and banking apps.
- **Acceptance Criteria:**
  - Chat threads with Mom (Mae), junior peer May, and senior lead P' Chai.
  - Live ledger for K-Mobile Banking showing salary credits, condo rent deductions, and transit costs.
  - Unread notification badges triggered by story events with sound alerts.

### 8. [Sprint 2] Local Storage Save/Load System & Backlog Transcript
- **Labels:** `area:engine`, `priority:high`, `sprint-2`
- **Description:** Implement persistent game state recording with 4 manual save slots, auto-save, and full conversation history.
- **Acceptance Criteria:**
  - Save slot stores current node, line index, timestamp, stats, and text snippet.
  - Backlog modal maintains chronological dialogue transcript with speaker color tags.
  - Graceful schema migrations if story node structures are modified.

---

## Sprint 3: Audiovisual Polish & Dynamic Effects (Week 5–6)

### 9. [Sprint 3] High-Fidelity Character Sprites & Expression System
- **Labels:** `area:visual`, `priority:high`, `sprint-3`
- **Description:** Produce multi-expression character portraits for Ton, May, P' Chai, and Khun Lin.
- **Acceptance Criteria:**
  - Provide expressions: Neutral, Happy, Stressed, Shocked, Determined, and Exhausted.
  - Smooth 150ms crossfade between expression transitions.
  - Responsive character anchoring on left/right stage positions.

### 10. [Sprint 3] Canvas Particle Rain & Dynamic Weather System
- **Labels:** `area:visual`, `area:engine`, `priority:medium`, `sprint-3`
- **Description:** Implement dynamic weather rendering (Monsoon, Heat Haze, AC Chill, Golden Dusk) and screen-shake cues for intense confrontations.
- **Acceptance Criteria:**
  - Lightweight 60 FPS HTML5 canvas weather renderer with adjustable conditions.
  - Atmospheric heat shimmer and AC mist particles.
  - Dynamic energy stat modifier impacting player vitals based on location climate.

### 11. [Sprint 3] Lo-Fi Rhodes Synthesizer & BGM Ambiences
- **Labels:** `area:audio`, `priority:medium`, `sprint-3`
- **Description:** Expand the Web Audio synthesizer with generative background music tracks.
- **Acceptance Criteria:**
  - Smooth repeating Rhodes chord progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7) for street food and condo scenes.
  - Low-frequency drone and dissonant beating for boardroom confrontations.
  - Master volume controls for BGM and SFX with independent mute toggles.

### 12. [Sprint 3] Interactive Narrative Flowchart & Jump-to-Node Engine
- **Labels:** `area:engine`, `area:visual`, `priority:high`, `sprint-3`
- **Description:** Build a visual flowchart showing unlocked branches and discovered endings.
- **Acceptance Criteria:**
  - Visual graph highlighting visited vs. locked nodes.
  - Trophy shelf displaying all 5 endings with status badges.
  - Jump to Node action allowing players to resume gameplay from any unlocked checkpoint.

---

## Sprint 4: Backend Integration & Community Telemetry (Week 7–8)

### 13. [Sprint 4] Cloud Save Sync API (Express + Database)
- **Labels:** `area:backend`, `priority:high`, `sprint-4`
- **Description:** Create REST endpoints for syncing game saves across user devices.
- **Acceptance Criteria:**
  - Endpoints: `POST /api/saves`, `GET /api/saves/:userId`, `DELETE /api/saves/:slotId`.
  - Validate payload schema (slot index, node ID, stats, timestamp).
  - Fall back cleanly to localStorage when offline or unauthenticated.

### 14. [Sprint 4] Global Dilemma Telemetry & How Others Chose Overlay
- **Labels:** `area:backend`, `area:visual`, `priority:medium`, `sprint-4`
- **Description:** Collect anonymous player decisions at major checkpoints and display aggregate percentages (Telltale-style).
- **Acceptance Criteria:**
  - Endpoint `POST /api/telemetry/choice` to record selected option ID.
  - Endpoint `GET /api/telemetry/stats/:choiceId` returning choice distributions.
  - Ending screen displays percentage comparisons.

### 15. [Sprint 4] Rate Limiting, Input Validation & Security Hardening
- **Labels:** `area:backend`, `priority:high`, `sprint-4`
- **Description:** Secure backend API endpoints against abuse and injection.
- **Acceptance Criteria:**
  - Implement Express rate-limiting on telemetry endpoints.
  - Sanitize all inbound JSON parameters with Zod/validator schemas.
  - Ensure zero sensitive environment credentials leak to client bundles.

---

## Sprint 5: Localization, Accessibility & Release QA (Week 9–10)

### 16. [Sprint 5] Complete Thai/English Dual-Language Toggle
- **Labels:** `area:story`, `area:engine`, `priority:high`, `sprint-5`
- **Description:** Enable seamless switching between full English, full Thai, or hybrid Thai/English subtitles.
- **Acceptance Criteria:**
  - Externalize all dialogue strings into structured i18n JSON resource files.
  - Instant in-game language switcher without restarting the chapter.
  - Verify Thai line-breaking and typographic wrapping on mobile viewports.

### 17. [Sprint 5] Bangkok First Jobber Lore Handbook & Glossary
- **Labels:** `area:story`, `area:visual`, `priority:medium`, `sprint-5`
- **Description:** Deliver a searchable in-game cultural guide explaining labor laws and Bangkok urban life.
- **Acceptance Criteria:**
  - Categorized entries: Labor Protection Act Section 118, P/Nong hierarchy, OT expectations, Win-Win taxis.
  - Real-time search filter and category segmentation.

### 18. [Sprint 5] Performance Audit, WCAG AA Accessibility & Cross-Browser QA
- **Labels:** `area:qa`, `priority:critical`, `sprint-5`
- **Description:** Verify audio stability, memory retention, WCAG contrast, and cross-browser rendering.
- **Acceptance Criteria:**
  - Audit text contrast against dark backgrounds (minimum 4.5:1 ratio).
  - Ensure zero memory leaks during 30+ minutes of rapid skipping or repeated node jumps.
  - Confirm Web Audio API compatibility across Chrome, Safari, Firefox, and mobile Safari.
  - Lighthouse performance score >= 90 with zero render-blocking warnings.
