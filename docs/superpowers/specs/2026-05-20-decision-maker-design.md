# Decision Maker — Design Spec

**Date:** 2026-05-20
**Status:** Approved for implementation planning

## Summary

A mobile-first static web app that picks one option from a user-provided list — but always with doubt. The randomizer never just hands you an answer; a swappable "persona" voices second-guessing and offers a follow-up test to confirm or overturn the result. Designed to be a one-screen, one-tap experience that ships in a day.

## Goals

- One-tap decision making with personality, not a sterile RNG.
- Make indecision visible and resolvable through gut-check or consensus.
- Mobile-first, install-free, no accounts, no backend.

## Non-Goals

- No user accounts, login, or cloud sync. Each visit is a clean slate.
- No history, favorites, or saved option-sets (localStorage included).
- No social sharing of results.
- No animations beyond the slot reel and minimal UI transitions.
- No multi-screen routing — single HTML page only.

## User Flow

1. **Entry.** User lands on a single screen. Persona chip is shown at the top (default: Anxious Overthinker). Below it, an options list starts empty with two helper buttons: "+ Quick option" (adds a row labeled with the next unused letter — A on first tap, then B, C, D, E, F… up through Z) and "+ Typed option" (adds an editable text row). Quick and typed options can mix freely in the same list. Min 2 non-empty options unlocks the primary SPIN button. Each row also has a "×" button to remove it.
2. **Spin.** User taps SPIN. A single vertical slot reel cycles through the option labels, decelerates, lands on the winner. Mobile haptic buzz fires on stop (`navigator.vibrate(40)` if supported).
3. **Reveal.** The winner is shown large. Below it: the persona's doubt phrase, with `{winner}` and `{others}` placeholders filled in. Three action buttons:
   - **Spin again** — re-randomize from the same options.
   - **Gut-check** (visible only if exactly 2 options) OR **Run 5-spin test** (visible only if 3+ options).
   - **Done** — clears the result, returns to entry state with options preserved.
4. **Gut-check (2 options).** Shows the persona's `gutCheck` prompt and two buttons: "Relieved" and "Disappointed". Relieved → shows the `relieved` phrase, journey ends. Disappointed → shows the `disappointed` phrase with the *other* option named, journey ends.
5. **5-spin test (3+ options).** Auto-runs 5 spins in quick succession (~400 ms each), showing each result inline. After the fifth, tallies winners. If one option won 3 or more: shows `consensusClear` phrase with that winner. Otherwise: shows `consensusSplit` phrase. Journey ends.

End states always offer a "Spin again" / "Reset" path back to the entry screen with options preserved.

## Persona System

Personas are plain objects defined in `src/personas.ts`. The app ships with four:

- **Anxious Overthinker** (default) — nervous, second-guessing, relatable.
- **Sarcastic Friend** — dry wit, teasing.
- **Mystic Oracle** — cryptic, dramatic, fortune-teller flavor.
- **Zen Monk** — calm, mindful, philosophical.

Each persona conforms to the same shape:

```ts
type Persona = {
  id: string;
  name: string;
  emoji: string;
  phrases: {
    spinning: string[];        // shown briefly during reel animation
    reveal: string[];          // wraps the winner reveal
    doubt: string[];           // the doubt line below the winner
    gutCheck: string;          // prompt shown in 2-option gut-check
    relieved: string;          // shown after "Relieved" tap
    disappointed: string;      // shown after "Disappointed" tap, names other
    consensusIntro: string;    // before the 5-spin test starts
    consensusClear: string;    // when a winner emerges from 5 spins
    consensusSplit: string;    // when results are split
  };
};
```

Phrase strings support placeholders: `{winner}`, `{other}` (the non-winner in a 2-option flow), `{others}` (comma-joined non-winners in 3+ flows), `{n}` (the consensus count, e.g. "3" in "won 3/5"). A small `resolvePhrase(template, context)` helper performs substitution at render time. No persona-specific copy lives anywhere outside `personas.ts`.

Persona switching: the chip at the top of the screen opens a bottom sheet listing the four personas. Tapping one updates state and re-renders any visible phrases. The selected persona is held in memory only — refreshing the page resets to the default.

## Architecture

Single-page Vite app, TypeScript, no framework, no router. Static deploy.

### File layout

```
decision-maker/
├── index.html              # single screen markup
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.ts             # bootstrap, state wiring, event handlers
│   ├── state.ts            # central app state + state transitions
│   ├── personas.ts         # persona dict + resolvePhrase helper
│   ├── spin.ts             # pure randomizer + 5-spin consensus logic
│   ├── reel.ts             # slot reel animation (DOM + CSS transforms)
│   └── style.css           # mobile-first styles
└── tests/
    └── spin.test.ts        # vitest unit tests for spin.ts pure functions
```

### State model

A single `AppState` object held in `state.ts`:

```ts
type Mode = 'idle' | 'spinning' | 'revealed' | 'gutCheck' | 'testing' | 'testComplete';

type AppState = {
  personaId: string;
  options: Array<{ id: string; label: string }>;
  mode: Mode;
  winner: string | null;
  testResults: string[]; // for 5-spin mode
};
```

State transitions are explicit functions (`startSpin`, `revealWinner`, `enterGutCheck`, `runConsensus`, `reset`). Each function returns the new state; `main.ts` re-renders the affected DOM regions in response. No reactive framework — manual but trivial at this scope.

### Module responsibilities

- **`personas.ts`** — exports the persona dict and a `resolvePhrase(template, context)` helper. Pure, no DOM, fully unit-testable (though only the resolver needs tests; the data is self-evident).
- **`spin.ts`** — exports `pickWinner(options)` (returns one option uniformly at random) and `runConsensus(options, rounds = 5)` (returns `{ results: string[], winner: string | null }` where winner is non-null iff one option received ≥ majority). Pure functions, accept an optional RNG parameter for deterministic tests.
- **`reel.ts`** — owns the slot reel animation. Exposes `animateReel(targetLabel: string, allLabels: string[]): Promise<void>` that resolves when the reel has landed on the target. Uses CSS `transform: translateY()` and `requestAnimationFrame` for the deceleration curve.
- **`state.ts`** — defines `AppState`, the `Mode` enum, and state transition functions. No DOM access.
- **`main.ts`** — wires DOM events to state transitions and re-renders affected sections. Holds the single mutable state instance.

### Styling

Mobile-first: design at 360 px viewport, scale up. System font stack. `prefers-color-scheme` for light/dark mode (no manual toggle). Large tap targets (min 48 px). Single column. No external CSS framework.

## Error Handling

Surface area is small, so error cases are limited:

- **Fewer than 2 options on SPIN tap** — SPIN button stays disabled; no error needed.
- **Empty label on a typed option** — option is ignored when counting; user sees the row but it doesn't count toward the minimum.
- **`navigator.vibrate` unsupported** — silently no-op. Don't gate the experience on haptics.
- **Animation timing failures** (e.g. background tab) — `animateReel` resolves on the next visible frame; no special handling beyond what `requestAnimationFrame` already provides.

No error boundaries, no toast system, no error logging.

## Testing

- **Unit tests (vitest)** — `tests/spin.test.ts` covers `pickWinner` (uniform distribution with seeded RNG over many trials), `runConsensus` (clear-winner case, split case, edge case of exactly 3/5), and `resolvePhrase` (placeholder substitution including missing placeholders).
- **Manual mobile verification** — open on a real phone, verify tap targets, haptic, reel animation smoothness, dark mode auto-switch.
- **No e2e tests** — scope doesn't justify the setup cost. The DOM logic in `main.ts` and `reel.ts` is exercised by manual testing.

## Out of Scope (Explicitly)

The following were considered and rejected for this spec:

- Saved option-sets in localStorage — would require UI surface and confuses the "ephemeral" model.
- Sound effects — adds asset weight and autoplay-policy friction.
- Custom user-defined personas — possible follow-up; ship with the four starters first.
- PWA / installable shell — defer until usage justifies it.
- Analytics — defer until there's something to learn.

## Open Questions

None at design time. Implementation may surface ergonomic questions (exact reel deceleration curve, persona phrase tuning) — those are decided during implementation, not gated on this spec.
