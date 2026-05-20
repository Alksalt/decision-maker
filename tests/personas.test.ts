import { describe, it, expect } from 'vitest';
import { PERSONAS, getPersona, resolvePhrase } from '../src/personas';

describe('personas catalogue', () => {
  it('ships exactly four starter personas', () => {
    expect(PERSONAS).toHaveLength(4);
  });

  it('includes the four expected ids in order', () => {
    expect(PERSONAS.map(p => p.id)).toEqual(['overthinker', 'sarcastic', 'mystic', 'zen']);
  });

  it('every persona has all required phrase slots populated', () => {
    for (const p of PERSONAS) {
      expect(p.phrases.spinning.length).toBeGreaterThan(0);
      expect(p.phrases.reveal.length).toBeGreaterThan(0);
      expect(p.phrases.doubt.length).toBeGreaterThan(0);
      expect(p.phrases.gutCheck).toBeTruthy();
      expect(p.phrases.relieved).toBeTruthy();
      expect(p.phrases.disappointed).toBeTruthy();
      expect(p.phrases.consensusIntro).toBeTruthy();
      expect(p.phrases.consensusClear).toBeTruthy();
      expect(p.phrases.consensusSplit).toBeTruthy();
    }
  });
});

describe('getPersona', () => {
  it('returns the persona matching the id', () => {
    expect(getPersona('overthinker').id).toBe('overthinker');
  });

  it('falls back to overthinker for unknown ids', () => {
    expect(getPersona('nope').id).toBe('overthinker');
  });
});

describe('persona color (arcade)', () => {
  it('every persona has a 6-digit hex color', () => {
    for (const p of PERSONAS) {
      expect(typeof p.color).toBe('string');
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('uses the arcade hex values from the handoff', () => {
    const byId = Object.fromEntries(PERSONAS.map(p => [p.id, p.color]));
    expect(byId.overthinker).toBe('#FF6B1F');
    expect(byId.sarcastic).toBe('#FFD700');
    expect(byId.mystic).toBe('#B16CFF');
    expect(byId.zen).toBe('#3AE0C9');
  });
});

describe('resolvePhrase', () => {
  it('substitutes {winner}', () => {
    expect(resolvePhrase('It says {winner}.', { winner: 'Pepsi' })).toBe('It says Pepsi.');
  });

  it('substitutes {other}, {others}, {n} together', () => {
    expect(resolvePhrase('{winner} won {n}/5 over {others}', {
      winner: 'A', others: 'B, C', n: 3,
    })).toBe('A won 3/5 over B, C');
  });

  it('leaves unknown placeholders alone', () => {
    expect(resolvePhrase('Hello {unknown}', { winner: 'X' })).toBe('Hello {unknown}');
  });

  it('handles empty context', () => {
    expect(resolvePhrase('static', {})).toBe('static');
  });
});
