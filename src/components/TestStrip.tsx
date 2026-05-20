type Props = {
  results: string[];
  consensus?: string;
};

export function TestStrip({ results, consensus }: Props) {
  const cells = Array.from({ length: 5 }, (_, i) => results[i] ?? null);
  return (
    <div class="test-strip">
      <div class="test-strip__header">5-SPIN TEST · {results.length}/5</div>
      <div class="test-strip__row">
        {cells.map((label, i) => (
          <div
            key={i}
            class={`test-cell ${label ? 'test-cell--filled' : ''}`}
          >
            {label ?? '·'}
          </div>
        ))}
      </div>
      {consensus && <div class="test-strip__consensus">{consensus}</div>}
    </div>
  );
}
