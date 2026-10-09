/**
 * Automated script to push all planned issues to your GitHub repository via GitHub REST API.
 * Usage:
 *   GITHUB_TOKEN="ghp_your_token" GITHUB_REPO="username/repository-name" node scripts/sync-issues.js
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // format: "owner/repo"

if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.error('\n❌ Missing required environment variables!');
  console.error('Please run with:');
  console.error('  GITHUB_TOKEN="your_personal_access_token" GITHUB_REPO="owner/repo" node scripts/sync-issues.js\n');
  process.exit(1);
}

const ISSUES = [
  {
    title: '[Sprint 1] Core Visual Novel State Machine & Script Parser',
    body: `### Description
Implement a deterministic state machine for scene transitions, typewriter text delivery, skip mode, and auto-play pacing.

### Acceptance Criteria
- [ ] Support TITLE, PLAYING, and ENDING states.
- [ ] Typewriter engine with configurable speeds (Instant, Fast, Normal, Slow) and click-to-complete.
- [ ] Keyboard listeners for Space, Enter, and mouse click to advance dialogue.
- [ ] Prevent race conditions during rapid skipping.`,
    labels: ['area:engine', 'priority:critical', 'sprint-1'],
  },
  {
    title: '[Sprint 1] Prologue Script & Bangkok Commute Dilemma',
    body: `### Description
Write complete English and Thai script for the 08:15 AM BTS Siam Station commute dilemma.

### Acceptance Criteria
- [ ] Script lines include character tags, thoughts, and atmospheric setting markers.
- [ ] Establish Ton's background, the 119-day probation countdown, and financial stress.
- [ ] Implement 3 divergent choices: BTS crowd squeeze, Win-Win motorbike taxi, and 7-Eleven cold brew wait.`,
    labels: ['area:story', 'priority:high', 'sprint-1'],
  },
  {
    title: '[Sprint 1] Responsive VN Viewport & Top Bar HUD',
    body: `### Description
Build the 1440px desktop baseline interface with responsive mobile scaling, dialogue nameplates, and vitals meters.

### Acceptance Criteria
- [ ] Display unboxed metadata: Current Chapter, Location, and Time of Day.
- [ ] Render real-time meters for Sanity (Energy), Work Performance, Integrity, and THB Cash.
- [ ] Mobile layout maintains a max 15% sticky boundary without obscuring narrative text.`,
    labels: ['area:visual', 'area:engine', 'priority:high', 'sprint-1'],
  },
  {
    title: '[Sprint 1] Web Audio Procedural SFX Prototype',
    body: `### Description
Build the zero-dependency browser Web Audio synthesizer for key environmental audio.

### Acceptance Criteria
- [ ] Synthesize authentic BTS Skytrain 2-tone chime (E5 -> B4).
- [ ] Procedural pink-noise filter for Bangkok monsoon rain.
- [ ] Mechanical keyboard typing clicks and UI tap feedback.
- [ ] Safe user-gesture audio context initialization (prevents autoplay blocking).`,
    labels: ['area:audio', 'priority:medium', 'sprint-1'],
  },
  {
    title: '[Sprint 2] Act 1 & 2 Script: The 18:45 Scope Crisis & Midnight Red Bull',
    body: `### Description
Write the full branching script for P' Chai's urgent Friday night scope change and the Slide 14 metric manipulation dilemma.

### Acceptance Criteria
- [ ] Path A (All-Nighter): High stress, compromised data, and peer friction.
- [ ] Path B (Tactical Diplomacy): Phased MVP presentation, preserving team sanity.
- [ ] Path C (Direct Rebellion): Technical honesty triggering Managing Director Lin's intervention.`,
    labels: ['area:story', 'priority:critical', 'sprint-2'],
  },
  {
    title: '[Sprint 2] Act 3, 4 & The 5 Endings Script',
    body: `### Description
Finalize the narrative arcs for Soi 22 late-night noodles, Day 119 final probation review, and all 5 distinct epilogues.

### Acceptance Criteria
- [ ] Ending 1: The Silicon Sukhumvit Climber (Corporate promotion, isolated burnout).
- [ ] Ending 2: Studio Chao Phraya (Resigned with May, indie creative freedom).
- [ ] Ending 3: The Bangkok Pragmatist (Master of 18:30 boundaries).
- [ ] Ending 4: Burnout Crash & Life Reboot (Medical pause, family perspective).
- [ ] Ending 5: The Glass Tower Reformer (Whistleblower triumph, systemic culture change).`,
    labels: ['area:story', 'priority:critical', 'sprint-2'],
  },
  {
    title: '[Sprint 2] Interactive Smartphone Subsystem (LINE Chat & Mobile Banking)',
    body: `### Description
Develop an in-game smartphone widget styled like modern chat and banking apps.

### Acceptance Criteria
- [ ] Chat threads with Mom (Mae), junior peer May, and senior lead P' Chai.
- [ ] Live ledger for K-Mobile Banking showing salary credits, condo rent deductions, and transit costs.
- [ ] Unread notification badges triggered by story events with sound alerts.`,
    labels: ['area:engine', 'area:visual', 'priority:high', 'sprint-2'],
  },
  {
    title: '[Sprint 2] Local Storage Save/Load System & Backlog Transcript',
    body: `### Description
Implement persistent game state recording with 4 manual save slots, auto-save, and full conversation history.

### Acceptance Criteria
- [ ] Save slot stores current node, line index, timestamp, stats, and text snippet.
- [ ] Backlog modal maintains chronological dialogue transcript with speaker color tags.
- [ ] Graceful schema migrations if story node structures are modified.`,
    labels: ['area:engine', 'priority:high', 'sprint-2'],
  },
  {
    title: '[Sprint 3] High-Fidelity Character Sprites & Expression System',
    body: `### Description
Produce multi-expression character portraits for Ton, May, P' Chai, and Khun Lin.

### Acceptance Criteria
- [ ] Provide expressions: Neutral, Happy, Stressed, Shocked, Determined, and Exhausted.
- [ ] Smooth 150ms crossfade between expression transitions.
- [ ] Responsive character anchoring on left/right stage positions.`,
    labels: ['area:visual', 'priority:high', 'sprint-3'],
  },
  {
    title: '[Sprint 3] Canvas Particle Rain & Dynamic Weather System',
    body: `### Description
Implement dynamic weather rendering (Monsoon, Heat Haze, AC Chill, Golden Dusk) and screen-shake cues for intense confrontations.

### Acceptance Criteria
- [ ] Lightweight 60 FPS HTML5 canvas weather renderer with adjustable conditions.
- [ ] Atmospheric heat shimmer and AC mist particles.
- [ ] Dynamic energy stat modifier impacting player vitals based on location climate.`,
    labels: ['area:visual', 'area:engine', 'priority:medium', 'sprint-3'],
  },
  {
    title: '[Sprint 3] Lo-Fi Rhodes Synthesizer & BGM Ambiences',
    body: `### Description
Expand the Web Audio synthesizer with generative background music tracks.

### Acceptance Criteria
- [ ] Smooth repeating Rhodes chord progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7) for street food and condo scenes.
- [ ] Low-frequency drone and dissonant beating for boardroom confrontations.
- [ ] Master volume controls for BGM and SFX with independent mute toggles.`,
    labels: ['area:audio', 'priority:medium', 'sprint-3'],
  },
  {
    title: '[Sprint 3] Interactive Narrative Flowchart & Jump-to-Node Engine',
    body: `### Description
Build a visual flowchart showing unlocked branches and discovered endings.

### Acceptance Criteria
- [ ] Visual graph highlighting visited vs. locked nodes.
- [ ] Trophy shelf displaying all 5 endings with status badges.
- [ ] Jump to Node action allowing players to resume gameplay from any unlocked checkpoint.`,
    labels: ['area:engine', 'area:visual', 'priority:high', 'sprint-3'],
  },
  {
    title: '[Sprint 4] Cloud Save Sync API (Express + Database)',
    body: `### Description
Create REST endpoints for syncing game saves across user devices.

### Acceptance Criteria
- [ ] Endpoints: POST /api/saves, GET /api/saves/:userId, DELETE /api/saves/:slotId.
- [ ] Validate payload schema (slot index, node ID, stats, timestamp).
- [ ] Fall back cleanly to localStorage when offline or unauthenticated.`,
    labels: ['area:backend', 'priority:high', 'sprint-4'],
  },
  {
    title: '[Sprint 4] Global Dilemma Telemetry & How Others Chose Overlay',
    body: `### Description
Collect anonymous player decisions at major checkpoints and display aggregate percentages (Telltale-style).

### Acceptance Criteria
- [ ] Endpoint POST /api/telemetry/choice to record selected option ID.
- [ ] Endpoint GET /api/telemetry/stats/:choiceId returning choice distributions.
- [ ] Ending screen displays percentage comparisons.`,
    labels: ['area:backend', 'area:visual', 'priority:medium', 'sprint-4'],
  },
  {
    title: '[Sprint 4] Rate Limiting, Input Validation & Security Hardening',
    body: `### Description
Secure backend API endpoints against abuse and injection.

### Acceptance Criteria
- [ ] Implement Express rate-limiting on telemetry endpoints.
- [ ] Sanitize all inbound JSON parameters with Zod/validator schemas.
- [ ] Ensure zero sensitive environment credentials leak to client bundles.`,
    labels: ['area:backend', 'priority:high', 'sprint-4'],
  },
  {
    title: '[Sprint 5] Complete Thai/English Dual-Language Toggle',
    body: `### Description
Enable seamless switching between full English, full Thai, or hybrid Thai/English subtitles.

### Acceptance Criteria
- [ ] Externalize all dialogue strings into structured i18n JSON resource files.
- [ ] Instant in-game language switcher without restarting the chapter.
- [ ] Verify Thai line-breaking and typographic wrapping on mobile viewports.`,
    labels: ['area:story', 'area:engine', 'priority:high', 'sprint-5'],
  },
  {
    title: '[Sprint 5] Bangkok First Jobber Lore Handbook & Glossary',
    body: `### Description
Deliver a searchable in-game cultural guide explaining labor laws and Bangkok urban life.

### Acceptance Criteria
- [ ] Categorized entries: Labor Protection Act Section 118, P/Nong hierarchy, OT expectations, Win-Win taxis.
- [ ] Real-time search filter and category segmentation.`,
    labels: ['area:story', 'area:visual', 'priority:medium', 'sprint-5'],
  },
  {
    title: '[Sprint 5] Performance Audit, WCAG AA Accessibility & Cross-Browser QA',
    body: `### Description
Verify audio stability, memory retention, WCAG contrast, and cross-browser rendering.

### Acceptance Criteria
- [ ] Audit text contrast against dark backgrounds (minimum 4.5:1 ratio).
- [ ] Ensure zero memory leaks during 30+ minutes of rapid skipping or repeated node jumps.
- [ ] Confirm Web Audio API compatibility across Chrome, Safari, Firefox, and mobile Safari.
- [ ] Lighthouse performance score >= 90 with zero render-blocking warnings.`,
    labels: ['area:qa', 'priority:critical', 'sprint-5'],
  },
];

function createIssue(issue) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(issue);
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/issues`,
      method: 'POST',
      headers: {
        'User-Agent': 'Node-GitHub-Issue-Creator',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const json = JSON.parse(body);
          console.log(`✅ Created Issue #${json.number}: ${issue.title}`);
          resolve(json);
        } else {
          console.error(`❌ Failed (${res.statusCode}): ${body}`);
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log(`🚀 Publishing ${ISSUES.length} issues to https://github.com/${GITHUB_REPO} ...\n`);
  for (const issue of ISSUES) {
    try {
      await createIssue(issue);
      // Wait 800ms between requests to avoid secondary rate limits
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error(`Error creating issue "${issue.title}":`, err.message);
    }
  }
  console.log('\n🎉 Finished creating GitHub Issues!');
}

run();
