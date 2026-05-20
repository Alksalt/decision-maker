import { describe, it, expect } from 'vitest';
import { buildStripLabels, findTargetIndex, cellFontSizePx } from '../src/components/Reel.helpers';

describe('buildStripLabels', () => {
  it('returns three question marks when no labels', () => {
    expect(buildStripLabels([])).toEqual(['?', '?', '?']);
  });

  it('repeats labels 12 times by default', () => {
    const out = buildStripLabels(['A', 'B', 'C']);
    expect(out.length).toBe(36);
    expect(out.slice(0, 3)).toEqual(['A', 'B', 'C']);
    expect(out.slice(-3)).toEqual(['A', 'B', 'C']);
  });

  it('honours a custom repeat count', () => {
    expect(buildStripLabels(['X'], 5)).toEqual(['X', 'X', 'X', 'X', 'X']);
  });
});

describe('findTargetIndex', () => {
  it('returns floor mid-point when winner is null', () => {
    const strip = ['A', 'B', 'C', 'A', 'B', 'C'];
    expect(findTargetIndex(strip, null, 3)).toBe(3);
  });

  it('returns the last matching cell within the search window', () => {
    const strip = ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'];
    // search window = last (3 * 2) = 6 cells, indices 6..11. Last 'B' in window is index 10.
    expect(findTargetIndex(strip, 'B', 3)).toBe(10);
  });

  it('returns 0 when winner not found in search window', () => {
    const strip = ['A', 'A', 'A', 'A', 'A', 'A'];
    expect(findTargetIndex(strip, 'Z', 1)).toBe(0);
  });
});

describe('cellFontSizePx', () => {
  it('returns 38 for labels <= 5 chars', () => {
    expect(cellFontSizePx('a')).toBe(38);
    expect(cellFontSizePx('abcde')).toBe(38);
  });

  it('returns 30 for labels 6..8 chars', () => {
    expect(cellFontSizePx('abcdef')).toBe(30);
    expect(cellFontSizePx('abcdefgh')).toBe(30);
  });

  it('returns 22 for labels > 8 chars', () => {
    expect(cellFontSizePx('abcdefghi')).toBe(22);
    expect(cellFontSizePx('abcdefghijklmnop')).toBe(22);
  });
});
