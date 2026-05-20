import { describe, it, expect } from 'vitest';
import { pickWinner, runConsensus, type Option } from '../src/spin';

const opts = (...labels: string[]): Option[] =>
  labels.map((label, i) => ({ id: String(i), label }));

const seqRng = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('pickWinner', () => {
  it('returns the option at the index implied by the RNG', () => {
    const o = opts('A', 'B', 'C');
    expect(pickWinner(o, seqRng([0])).label).toBe('A');
    expect(pickWinner(o, seqRng([0.34]))).toBe(o[1]);
    expect(pickWinner(o, seqRng([0.99])).label).toBe('C');
  });

  it('produces a roughly uniform distribution over many trials', () => {
    const o = opts('A', 'B', 'C', 'D');
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (let i = 0; i < 4000; i++) counts[pickWinner(o).label]++;
    for (const c of Object.values(counts)) {
      expect(c).toBeGreaterThan(800);
      expect(c).toBeLessThan(1200);
    }
  });

  it('throws if given an empty array', () => {
    expect(() => pickWinner([])).toThrow();
  });
});

describe('runConsensus', () => {
  it('records the requested number of rounds', () => {
    const result = runConsensus(opts('A', 'B'), 5, seqRng([0, 0, 0.6, 0, 0.6]));
    expect(result.results).toHaveLength(5);
  });

  it('returns a clear winner when one label has a majority', () => {
    const result = runConsensus(opts('A', 'B'), 5, seqRng([0, 0, 0, 0.6, 0.6]));
    expect(result.results).toEqual(['A', 'A', 'A', 'B', 'B']);
    expect(result.winner).toBe('A');
  });

  it('returns null when no label reaches majority', () => {
    const result = runConsensus(
      opts('A', 'B', 'C'),
      5,
      seqRng([0, 0, 0.4, 0.4, 0.8]),
    );
    expect(result.results).toEqual(['A', 'A', 'B', 'B', 'C']);
    expect(result.winner).toBeNull();
  });

  it('defaults to 5 rounds when not specified', () => {
    expect(runConsensus(opts('A', 'B')).results).toHaveLength(5);
  });
});
