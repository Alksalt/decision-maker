import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  setOutcome,
  reset,
  addQuickOption,
  revealWinner,
} from '../src/state';

describe('outcome mode', () => {
  it('createInitialState has outcomeText null and mode idle', () => {
    const s = createInitialState();
    expect(s.mode).toBe('idle');
    expect(s.outcomeText).toBeNull();
  });

  it('setOutcome sets mode=outcome and outcomeText', () => {
    const s = setOutcome(createInitialState(), 'Go with pizza.');
    expect(s.mode).toBe('outcome');
    expect(s.outcomeText).toBe('Go with pizza.');
  });

  it('reset clears outcomeText and returns to idle', () => {
    const s = setOutcome(createInitialState(), 'Go with pizza.');
    const r = reset(s);
    expect(r.mode).toBe('idle');
    expect(r.outcomeText).toBeNull();
  });

  it('addQuickOption preserves outcomeText null on fresh state', () => {
    const s = addQuickOption(createInitialState());
    expect(s.outcomeText).toBeNull();
  });

  it('setOutcome does not clobber options or winner', () => {
    const seeded = revealWinner(addQuickOption(createInitialState()), { id: 'o1', label: 'A' });
    const out = setOutcome(seeded, 'final');
    expect(out.options).toEqual(seeded.options);
    expect(out.winner).toEqual({ id: 'o1', label: 'A' });
  });
});
