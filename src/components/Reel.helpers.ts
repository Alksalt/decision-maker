export function buildStripLabels(labels: string[], repeats = 12): string[] {
  if (labels.length === 0) return ['?', '?', '?'];
  const out: string[] = [];
  for (let i = 0; i < repeats; i++) for (const l of labels) out.push(l);
  return out;
}

export function findTargetIndex(
  strip: string[],
  winnerLabel: string | null,
  labelsLen: number,
): number {
  if (!winnerLabel) return Math.floor(strip.length / 2);
  const start = Math.max(0, strip.length - labelsLen * 2);
  for (let i = strip.length - 1; i >= start; i--) {
    if (strip[i] === winnerLabel) return i;
  }
  return 0;
}

export function cellFontSizePx(label: string): 22 | 30 | 38 {
  const n = label.length;
  if (n <= 5) return 38;
  if (n <= 8) return 30;
  return 22;
}
