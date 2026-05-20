import { buildStripLabels, cellFontSizePx, findTargetIndex } from './Reel.helpers';

type Mode =
  | 'idle'
  | 'spinning'
  | 'revealed'
  | 'gutCheck'
  | 'testing'
  | 'testComplete'
  | 'outcome';

type ReelProps = {
  mode: Mode;
  winner: { id: string; label: string } | null;
  options: { id: string; label: string }[];
  spinningPhrase?: string;
};

const CELL_H = 80;

const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sizeMod(label: string): 'lg' | 'md' | 'sm' {
  const px = cellFontSizePx(label);
  if (px === 38) return 'lg';
  if (px === 30) return 'md';
  return 'sm';
}

function transitionFor(mode: Mode): string {
  if (PREFERS_REDUCED_MOTION) return 'none';
  if (mode === 'spinning') return 'transform 1.6s cubic-bezier(.15,.6,.2,1)';
  if (mode === 'revealed') return 'none';
  return 'transform .3s ease';
}

export function Reel(props: ReelProps) {
  const { mode, winner, options, spinningPhrase } = props;

  const labels = options.map(o => o.label).filter(s => s.trim().length > 0);
  const strip = buildStripLabels(labels);
  const targetIdx = findTargetIndex(strip, winner?.label ?? null, labels.length);

  const offset =
    mode === 'spinning' || mode === 'revealed'
      ? -(targetIdx - 1) * CELL_H
      : -Math.floor(strip.length / 2) * CELL_H;

  const transition = transitionFor(mode);

  return (
    <div class="reel">
      <div class="reel__fade" />
      <div class="reel__selector" />
      <span class="reel__bolt reel__bolt--tl" />
      <span class="reel__bolt reel__bolt--tr" />
      <span class="reel__bolt reel__bolt--bl" />
      <span class="reel__bolt reel__bolt--br" />
      <div
        class="reel__track"
        style={{ transform: `translateY(${offset}px)`, transition }}
      >
        {strip.map((label, i) => (
          <div key={i} class={`reel__cell reel__cell--${sizeMod(label)}`}>
            {label}
          </div>
        ))}
      </div>
      {mode === 'spinning' && spinningPhrase && (
        <div class="reel__phrase">{spinningPhrase}</div>
      )}
    </div>
  );
}
