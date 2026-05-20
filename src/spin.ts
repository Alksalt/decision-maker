export type Option = { id: string; label: string };
export type RNG = () => number;
export type ConsensusResult = { results: string[]; winner: string | null };

export function pickWinner(options: Option[], rng: RNG = Math.random): Option {
  if (options.length === 0) {
    throw new Error('pickWinner requires at least one option');
  }
  const idx = Math.floor(rng() * options.length);
  return options[Math.min(idx, options.length - 1)];
}

export function runConsensus(
  options: Option[],
  rounds = 5,
  rng: RNG = Math.random,
): ConsensusResult {
  const results: string[] = [];
  const counts = new Map<string, number>();
  for (let i = 0; i < rounds; i++) {
    const label = pickWinner(options, rng).label;
    results.push(label);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const majority = Math.floor(rounds / 2) + 1;
  let winner: string | null = null;
  for (const [label, count] of counts) {
    if (count >= majority) {
      winner = label;
      break;
    }
  }
  return { results, winner };
}
