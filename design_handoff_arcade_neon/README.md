# Handoff: Decision Maker — Arcade Neon Refactor

## Overview

A full visual + UX refactor of the **Decision Maker** mobile web app (the project at `github.com/Alksalt/decision-maker`). Functionality is preserved — list options, tap to randomize, get a winner, second-guess it with a persona — but the look and feel is rebuilt around a chunky, retro-arcade slot machine identity.

The flow stays single-screen and single-tap:

```
  idle ──tap SPIN──► spinning ──reel lands──► revealed
                                                  │
                       ┌──── 2 options ───────────┤
                       │                          │
                       ▼                          ▼ 3+ options
                   gut-check                  5-spin test
                       │                          │
                       └──► outcome ◄─────────────┘
                                │
                                └── tap Reset/Spin again ──► idle
```

## About the design files

The files in this bundle are **design references created in HTML+React+Babel** — interactive prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the existing decision-maker codebase** (Vite + TypeScript, vanilla DOM, no framework) using its established patterns, OR — if you'd prefer — port it to a small React shell while keeping the same project structure.

The current repo's structure (`src/main.ts`, `src/state.ts`, `src/spin.ts`, `src/reel.ts`, `src/personas.ts`, `src/style.css`, `index.html`) is well-shaped for this redesign — `spin.ts` and `personas.ts` need no logic changes, `state.ts` only needs the `Mode` enum extended with `'outcome'`, and most of the work is in `style.css` + `main.ts` rendering + a new `reel.ts` to match the chunkier arcade reel.

## Fidelity

**High-fidelity (hifi).** Colors, type, spacing, radii, shadows, and motion are all specified to final values below. Recreate pixel-perfectly. Reference files in this bundle:

- `reference/index.html` — full multi-direction prototype (the design canvas)
- `reference/theme-arcade.jsx` — the Arcade direction (this handoff)
- `reference/personas.jsx` — persona data, identical to current `src/personas.ts` plus a per-theme `color` map you can ignore for a single-theme implementation
- `reference/app-core.jsx` — the state hook (`useDecisionFlow`) — mirrors the existing state transitions but with `'outcome'` added

The arcade-only standalone preview is `arcade-preview.html` in the root of the project — open it to see the design running by itself in an iPhone-frame mock at 0.55× scale.

## Design tokens

### Color

| Token | Hex | Used for |
| --- | --- | --- |
| `--arc-bg` | `#0B0712` | App background (base) |
| `--arc-bg-glow` | `#2A1850` | Top-of-screen radial glow |
| `--arc-card` | `#1B1430` | Cards, persona chip, option rows, test cells |
| `--arc-border` | `#2D2347` | All cards & inputs border |
| `--arc-reel-bg` | `#0A0612` | Reel inner background |
| `--arc-text` | `#FFE9C7` | Primary text (warm cream) |
| `--arc-text-muted` | `#A09BC0` | Secondary text, disabled, dim icons |
| `--arc-primary` | `#FF6B1F` | SPIN button, accents, reveal highlight |
| `--arc-primary-deep` | `#B73C00` | Bottom shadow on SPIN button (chunky 3D edge) |
| `--arc-yellow` | `#FFD23F` | Reel labels, persona prefix text, ghost-button label |
| `--arc-reel-label` | `#FFE066` | Reel cell text fill (slightly different from `--arc-yellow` for glow contrast) |
| `--arc-hot` | `#FF3D7F` | 5-spin test header accent |
| `--arc-bolt` | `#3A2858` | Corner bolts on the reel frame |

Gradient backgrounds:
- App body: `radial-gradient(120% 60% at 50% 0%, #2A1850 0%, #0B0712 60%)`
- SPIN button: `linear-gradient(180deg, #FF8C4A 0%, #FF6B1F 100%)`

Scanline overlay: `repeating-linear-gradient(0deg, transparent 0 3px, #fff 3px 4px)` at `opacity: 0.05`, `pointer-events: none`, `position: absolute; inset: 0; z-index: 1`.

### Typography

Load via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Archivo+Black&display=swap" rel="stylesheet">
```

| Role | Family | Weight | Notes |
| --- | --- | --- | --- |
| Body / UI | `"Space Grotesk"` | 400, 500, 600, 700 | Most copy, buttons, inputs |
| Display / Marquee | `"Archivo Black"` | 900 (only weight) | Reel cell labels, SPIN button, option index numerals, eyebrow "★ PICK & DOUBT ★" |

Type scale (px):

| Token | Size | Weight | Use |
| --- | --- | --- | --- |
| `eyebrow` | 10 / 11 | Archivo Black | "★ PICK & DOUBT ★", section labels, reveal prefix (uppercase + letter-spacing 2–4px) |
| `body-sm` | 12, 13, 14 | 500–600 | Doubt bubble, action buttons, persona menu items |
| `option` | 14 | 500 | Option row input value |
| `reel-md` | 30 | Archivo Black | Reel cell when label length 6–8 |
| `reel-lg` | 38 | Archivo Black | Reel cell when label length ≤ 5 |
| `reel-sm` | 22 | Archivo Black | Reel cell when label length > 8 |
| `spin-button` | 26 | Archivo Black, letter-spacing 6 | SPIN primary button |
| `winner-doubt` | 14 | Space Grotesk 500 | Persona's doubt sentence in card |

Letter-spacing: eyebrow text uses `letter-spacing: 2–4px`; SPIN uses 6px; reel cells use `-1px` (tight); all uppercase except the doubt bubble and option inputs.

### Spacing

- Horizontal page padding: 20px
- Vertical gaps: 6, 8, 10, 12, 14 (use the smallest that works; the layout is dense)
- Reel container border-radius: 22px
- Cards / buttons border-radius: 12–18px
- Persona chip border-radius: 999px (pill)
- All cards have a 2px solid `--arc-border` border

### Shadow / depth

- Reel frame: `inset 0 0 0 4px #1a1230, inset 0 0 30px rgba(255,109,31,0.15), 0 10px 30px rgba(0,0,0,0.5)`
- Reel center selector glow: `inset 0 0 30px rgba(255,107,31,0.4)` with `border-top` + `border-bottom` of `2px solid #FF6B1F66`
- SPIN button (chunky 3D): `0 5px 0 #B73C00, 0 18px 40px rgba(255,107,31,0.5), inset 0 2px 0 rgba(255,255,255,0.6)`. On press: `translateY(4px)` to slam down (and the bottom shadow effectively disappears).
- Reel cell text glow: `text-shadow: 0 0 16px rgba(255,107,31,0.8), 0 0 2px #fff`
- Persona pop-over: `0 20px 40px rgba(0,0,0,0.6)`

## Layout (iPhone 402 × 874)

Top → bottom:

| Region | Height | Notes |
| --- | --- | --- |
| iOS status-bar reserve | ~56px | Empty — the iOS frame chrome renders here |
| Eyebrow + persona chip | ~64px | Centered. Eyebrow "★ PICK & DOUBT ★" above, chip below |
| **Reel** | 240px + 12px below | 3 cells × 80px high. Below: 30+px region for either reveal-doubt, test strip, gut-check, or outcome (reuses space) |
| Options block | ~150px max | "OPTIONS · 3" header with [+ A] [+ Text] buttons, then list (max-height 124px, scrolls) |
| Action region | ~88px | Primary SPIN button (idle/spinning) OR Spin-again + secondary buttons (revealed/complete) |
| Safe-area pad | 30px |  |

Total ≈ 670 logical px of content + 56 status-bar + 30 safe area + 34 home-indicator = fits 874.

## Components

### 1. Eyebrow + Persona chip

**Eyebrow** "★ PICK & DOUBT ★"
- Font: Archivo Black, 10–11px, letter-spacing 4px, uppercase
- Color: `#FFD23F`
- Center-aligned, margin-bottom 4px

**Persona chip** — button, opens a popover menu of all four personas
- Pill shape, border 2px `#2D2347`, background `#1B1430`
- Padding `5px 14px 5px 5px`, font 13px Space Grotesk 600
- Left: 26px circle, `radial-gradient(circle at 30% 25%, #ffffff30, transparent 60%), <persona.color.arcade>` background, contains the persona emoji at 15px
- Right: persona's short name (`Overthinker`, `Sarcastic`, `Oracle`, `Zen`) + a 10×6 chevron-down SVG in `#A09BC0`
- On click: opens a popover positioned `top: 110%, left: 50% translateX(-50%)`, z-index 50, 6px padding, 16px border-radius, with a transparent full-screen click-catch behind at z-index 49
- Each menu item: 8px gap, 18px emoji + name, 10px border-radius, padding `8px 10px`; the currently-selected item has background `#2D2347`

### 2. Reel

**Frame**
- Background `#0A0612`, border 2px `#2D2347`, border-radius 22px, height 240px, position relative, overflow hidden
- Inset shadow stack as listed above
- Four 8×8 circular "bolts" at the corners, background `#3A2858`, `inset 0 0 0 2px rgba(0,0,0,0.5)`, positioned 10px from each corner, z-index 3

**Track** (the scrolling strip inside)
- Builds a long strip by repeating the valid options 12 times (so the reel has plenty of cells to scroll through and land plausibly on the target)
- Each cell: height 80px, flex centered, font Archivo Black, color `#FFE066`, text-shadow `0 0 16px rgba(255,107,31,0.8), 0 0 2px #fff`, uppercase
- Cell font-size adapts to label length: 38px (≤5 chars), 30px (6–8), 22px (>8)

**Center selector window**
- A 80px-tall band at vertical center (top: 80px, height: 80px, full width)
- Top + bottom borders: `2px solid #FF6B1F66`
- Inner glow: `inset 0 0 30px rgba(255,107,31,0.4)`
- pointer-events: none, z-index 1

**Fade overlay**
- Top + bottom fade so cells just-out-of-view dissolve into the frame
- `position: absolute; inset: 0; pointer-events: none; z-index: 2`
- `background: linear-gradient(180deg, #0A0612 0%, transparent 20%, transparent 80%, #0A0612 100%)`

**Spin animation**
- On enter spin: pick the winner via `pickWinner(validOptions)` (existing pure fn in `src/spin.ts` — keep as-is).
- Find an index in the strip near the end that matches the winner's label.
- Apply `transform: translateY(-(targetIdx - 1) * 80px)` with `transition: transform 1.6s cubic-bezier(.15, .6, .2, 1)`.
- The deceleration curve is critical — `cubic-bezier(.15, .6, .2, 1)` gives a fast start, long deceleration tail, no overshoot.
- After 1.6s settle, snap to `transition: none` and trigger the reveal state. (Don't re-trigger the same transition class — just clear transitions and write the same offset, so the next spin starts cleanly from there.)
- Optional: `navigator.vibrate(40)` on landing.

**Spinning phrase** (small overlay)
- Absolute, bottom 8px, full width centered, color `#FFD23F` at opacity 0.7, font 11px, letter-spacing 1.5, uppercase, z-index 3
- Text comes from `persona.phrases.spinning[]` — pick a random one when entering the `spinning` mode

### 3. Reveal doubt card (sits below reel when `mode === 'revealed'`)

- Above the bubble: persona's `reveal` phrase (e.g. `"It says {winner}."`) — 11px Archivo Black, uppercase, letter-spacing 2, `#FFD23F`, center-aligned
- Below: a card — `padding: 10px 14px`, background `#1B1430`, border 2px `#2D2347`, border-radius 14
- Inside the card: persona emoji at 20px on the left, then doubt sentence (14px Space Grotesk 500, line-height 1.4, color `#FFE9C7`) — flex row, gap 8, items: flex-start
- Animation on mount: `arcadePop` keyframes — `0% { opacity:0; transform: scale(.92) }`, `60% { transform: scale(1.04) }`, `100% { opacity:1; transform: scale(1) }`, duration 350ms, easing `cubic-bezier(.2, 1.4, .4, 1)` (slight overshoot)

### 4. Options block

**Header row**
- Left: "OPTIONS · N" — 10px Archivo Black, uppercase, letter-spacing 2, color `#A09BC0`
- Right: two pill buttons "+ A" and "+ Text"
  - Padding `4px 10px`, transparent background, 1.5px border `#2D2347`, border-radius 999, color `#FFD23F`, font 10px 700 uppercase letter-spacing 1
  - "+ A" adds an option labeled with the next unused letter (`addQuickOption` in `state.ts` already does this)
  - "+ Text" adds an empty editable option (`addTypedOption`)

**Option rows**
- Container: max-height 124px, overflow-y auto, gap 5px
- Each row: flex row, gap 8, background `#1B1430`, border 2px `#2D2347`, border-radius 10, padding `4px 4px 4px 12px`, min-height 34px
  - Index numeral on the left: Archivo Black 10px, color `#A09BC0`, min-width 16, formatted `01` `02` etc.
  - Input in the middle: transparent background, no border/outline, color `#FFE9C7`, Space Grotesk 14px 500, placeholder `"type…"` at 0.45 opacity
  - Remove button on the right: 26×26, transparent, color `#A09BC0`, font 16px "×", border-radius 6
- Empty state: dashed 2px border `#2D2347` rounded 12, padding 12, centered "add at least 2 options to spin →" text in `#A09BC0` 12px

**Disabled appearance** during `spinning` / `testing`:
- Wrapper gets `opacity: 0.35`, `pointer-events: none`, transition `opacity .25s`

### 5. Action buttons

**Primary SPIN** (modes: `idle`, `spinning`)
- Full width, padding `16px 0`, border-radius 18
- Font Archivo Black 26px, uppercase, letter-spacing 6
- When `validOptions.length >= 2`:
  - Background `linear-gradient(180deg, #FF8C4A 0%, #FF6B1F 100%)`, color `#fff`
  - Shadow `0 5px 0 #B73C00, 0 18px 40px rgba(255,107,31,0.5), inset 0 2px 0 rgba(255,255,255,0.6)`
  - Cursor pointer
- When disabled (< 2 valid options):
  - Background `#2a2040`, color `#A09BC0`, no shadow, `cursor: not-allowed`
- When `spinning`:
  - Label changes to "SPINNING…"
  - Transform `translateY(4px)` (button slams down, the 5px bottom shadow effectively collapses)
  - Transition `transform .15s`

**Revealed-state stack** (column gap 7)
- "Spin again" — primary variant ArcadeBtn (orange, 4px bottom shadow)
- Row gap 7, containing:
  - "Gut-check" (if exactly 2 valid options) — ghost ArcadeBtn → enter `gutCheck`
  - "5-spin test" (if 3+ valid options) — ghost ArcadeBtn → enter `testing` and run `runConsensus`
  - "Done" — dim ArcadeBtn → reset to `idle`

**Test-complete + outcome + gut-check rows**
- "Spin again" primary + "Reset" ghost — both clear current mode; spin again triggers a fresh spin

**ArcadeBtn variants** (used inside flex rows; each `flex: 1`, padding `12px 0`, font Space Grotesk 700 13px letter-spacing 1, border-radius 12, uppercase)

| Variant | Background | Color | Border | Shadow |
| --- | --- | --- | --- | --- |
| primary | `#FF6B1F` | `#fff` | none | `0 4px 0 #B73C00, inset 0 1px 0 #ffffff66` |
| ghost | `#1B1430` | `#FFD23F` | 2px `#2D2347` | none |
| dim | transparent | `#A09BC0` | 2px `#2D2347` | none |

### 6. 5-spin test strip (sits below reel when `mode === 'testing'` or `'testComplete'`)

- Header: "5-SPIN TEST · {n}/5" — 10px Archivo Black, uppercase, letter-spacing 2, color `#FF3D7F` (hot pink), centered
- 5 cells in a row, `flex: 1, gap 5px`:
  - Empty cell: background `#0e0820`, border 2px `#2D2347`, color `#A09BC0`, content `·`
  - Filled cell: background `#1B1430`, border 2px `#FF6B1F`, color `#FFD23F`
  - Each cell: padding `7px 4px`, border-radius 10, min-height 30, font Archivo Black 9–12px (smaller for longer labels), uppercase, text-align center
  - Filled cell animates in with `arcadePop` 250ms ease
- When `testComplete`: below the strip, render the persona's `consensusClear` (if a winner ≥3/5) or `consensusSplit` phrase — 13px Space Grotesk, color `#FFE9C7`, padding `0 6px`, text-align center, top margin 8

### 7. Gut-check (2-option flow, after Gut-check tap)

Replaces the reveal-doubt card area:
- Prompt: persona's `gutCheck` phrase, color `#FFD23F`, 12px, letter-spacing 1.5, uppercase, center-aligned, margin-bottom 8
- Two ghost ArcadeBtns side by side: **Relieved 😌** and **Bummed 😩**
- Tapping either fills the outcome state with `relieved` or `disappointed` persona phrase (resolved with `{winner}` and `{other}` placeholders)
- Animation: same `arcadePop`

### 8. Outcome (after gut-check finishes OR consensus completes)

- Single card: padding `12px 14px`, background `#1B1430`, border 2px `#FF6B1F`, border-radius 14
- Text: 14px Space Grotesk, color `#FFE9C7`, line-height 1.4, center-aligned
- Animates in with `arcadePop`

## Interactions & behavior

### Click flow
- Tap SPIN → instant transition to `spinning` mode, reel begins decelerating immediately
- After 1.6s the reel settles → `revealed` mode, doubt bubble pops in, action buttons swap from "SPIN" to the revealed-state stack
- Tap "Gut-check" (2 options) → swap doubt card for gut-check buttons → tap either → swap for outcome card
- Tap "5-spin test" (3+ options) → swap doubt card for 5-cell strip → cells fill one per 600ms → after the 5th, show summary text
- Tap "Done" / "Reset" → `idle`, options preserved
- Tap "Spin again" anywhere → new spin from same options (don't reset the option list)

### Animations summary

| Element | Anim | Duration | Easing |
| --- | --- | --- | --- |
| Reel track | `transform: translateY` | 1.6s | `cubic-bezier(.15, .6, .2, 1)` |
| Reveal-doubt card | `arcadePop` | 350ms | `cubic-bezier(.2, 1.4, .4, 1)` (overshoot) |
| Test-cell fill | `arcadePop` | 250ms | ease |
| Gut-check / outcome enter | `arcadePop` variant | 300ms | ease |
| SPIN button press | `transform: translateY(4px)` | 150ms | linear |
| Options block enable/disable | `opacity` | 250ms | linear |

`arcadePop` keyframes:
```css
@keyframes arcadePop {
  0% { opacity: 0; transform: scale(0.92); }
  60% { transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
```

### Edge cases & rules

- **SPIN disabled** when fewer than 2 non-empty options. Apply dimmed background + `cursor: not-allowed`. Don't show an error toast.
- **Empty option labels** are filtered out of the random pool but stay visible in the list (the existing `nonEmptyOptions` helper handles this).
- **Background tab / blurred page** during spin: don't add special handling; the existing `requestAnimationFrame` flow (or in this case, the single CSS transition) naturally resumes when the tab is foregrounded.
- **`navigator.vibrate(40)`** on reveal — wrap in a try/catch since not all browsers support it. Same with `navigator.vibrate([30, 60, 30])` on 5-spin-test completion.
- **Run-id tracking**: if the user taps Reset / Spin Again mid-spin or mid-5-spin-test, abort the in-flight resolve. The reference's `useDecisionFlow` increments a `runId` ref and short-circuits each `await` if it changed — mirror this pattern in the vanilla TS port.

### Persona system

No logic changes from current `src/personas.ts` — the 4 personas, phrase shapes, and `resolvePhrase` helper are kept. The chip + popover UI is what's new. The reference adds a `color: { arcade, mystic, paper }` map per persona; for this single-direction implementation only `arcade` is used and you can collapse it back to a single `color: string` field.

Persona phrase use:
- **Spinning**: pick one `spinning` phrase on enter, show below reel
- **Revealed**: pick one `reveal` phrase (eyebrow above doubt card) + one `doubt` phrase (in card)
- **Gut-check**: show `gutCheck` as prompt; the chosen branch shows `relieved` or `disappointed` (with `{winner}` and `{other}` filled)
- **Testing**: show `consensusIntro` (optional eyebrow), then `consensusClear` or `consensusSplit` on complete

Pick a fresh random phrase each time the user enters the state — don't cache one. The reference uses `pickRandom()`.

## State management

Reuse the existing `state.ts`. Add one mode: `'outcome'` (after gut-check choice or before reset). The `Mode` type becomes:

```ts
type Mode = 'idle' | 'spinning' | 'revealed' | 'gutCheck' | 'testing' | 'testComplete' | 'outcome';
```

Add a corresponding state field for the rendered outcome text:

```ts
type AppState = {
  // …existing fields…
  outcomeText: string | null;
};
```

And two new transitions:

```ts
export function showOutcome(state: AppState, text: string): AppState {
  return { ...state, mode: 'outcome', outcomeText: text };
}
```

(`reset` should also clear `outcomeText`.)

## Files in this bundle

```
design_handoff_arcade_neon/
├── README.md                          ← you are here
├── reference/
│   ├── index.html                     ← full 3-direction prototype (canvas + tweaks)
│   ├── theme-arcade.jsx               ← the Arcade direction — copy patterns from here
│   ├── personas.jsx                   ← persona data + resolvePhrase + presets
│   └── app-core.jsx                   ← useDecisionFlow hook reference (state machine)
└── screenshots/
    ├── 01-idle.png                    ← idle + 5 food options
    ├── 02-spinning.png                ← mid-spin, reel scrolling
    ├── 03-revealed.png                ← winner landed + persona doubt bubble
    ├── 04-testing.png                 ← 3/5 test cells filled
    └── 05-test-complete.png           ← all 5 cells + consensus phrase
```

To see it running, open `reference/index.html` (the design canvas with all 3 directions side-by-side), or open the standalone `arcade-preview.html` in the project root which mounts only the Arcade direction inside an iPhone frame at 0.55× scale.

## Implementation notes for the existing codebase

1. **Keep the existing `state.ts`, `spin.ts`, `personas.ts` mostly as-is.** They're well-shaped. Add the `'outcome'` mode + transition and a `color` field per persona.
2. **`reel.ts`** — rebuild. The current implementation is fine but the new visual needs:
   - 3-cell viewport (240px tall, not 240 with 80px cells)
   - Glow + scanline + bolt decorations
   - Easing curve `cubic-bezier(.15, .6, .2, 1)` over 1.6s
3. **`style.css`** — full rewrite using the tokens above as CSS custom properties.
4. **`main.ts`** — keep the explicit DOM rendering pattern (no framework). Render each region in its own function. Three regions are mutually exclusive in the reveal-row area (doubt / test-strip / gut-check / outcome); switch them with a single function `renderRevealRow(mode)`.
5. **No dark mode toggle** — the design is intentionally dark-only (cabinet/arcade vibe). Remove the existing `@media (prefers-color-scheme)` block.
6. **Drop the existing dialog-based persona sheet** in favor of the chip-with-popover pattern shown in the reference.
7. **Touch targets:** the reduced size on option rows (34px min-height) is below iOS's 44px recommendation. This is intentional for density. The remove × button is 26px tall but inside a 34px row, so the row itself remains tappable; the input is the primary hit area. Leave it.

## Assets

No external assets. Everything is CSS + a handful of inline SVGs (chevron, status-bar icons in the iPhone frame). Emoji are system-rendered: 😬 🙃 🔮 🧘.

Fonts: load from Google Fonts as specified above. If your project disallows external font hosting, self-host **Space Grotesk** (variable, 400–700) and **Archivo Black** (regular only) — both are SIL OFL licensed.

## Open questions for the dev to confirm

- Do you want to keep the current Vite + vanilla-TS architecture, or migrate to a small React/Preact shell? The reference is React-based for prototype speed; the design is framework-agnostic. The vanilla-TS port is straightforward — the state machine is small.
- Reduced motion: current spec ignores it. If you want to honor `prefers-reduced-motion`, replace the 1.6s reel scroll with an instant cut to the winner (no transform animation) and skip the `arcadePop` enter animations.
