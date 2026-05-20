import type { Mode } from '../hooks/useDecisionFlow';
import { ArcadeBtn } from './ArcadeBtn';

type Props = {
  mode: Mode;
  canSpin: boolean;
  validCount: number;
  onSpin: () => void;
  onSpinAgain: () => void;
  onGutCheck: () => void;
  onTest: () => void;
  onReset: () => void;
};

export function Actions({
  mode,
  canSpin,
  validCount,
  onSpin,
  onSpinAgain,
  onGutCheck,
  onTest,
  onReset,
}: Props) {
  if (mode === 'idle' || mode === 'spinning') {
    const spinning = mode === 'spinning';
    const disabled = !canSpin && !spinning;
    return (
      <button
        type="button"
        class={`actions-spin ${disabled ? 'actions-spin--disabled' : ''} ${spinning ? 'actions-spin--spinning' : ''}`}
        onClick={onSpin}
        disabled={disabled || spinning}
      >
        {spinning ? 'SPINNING…' : 'SPIN'}
      </button>
    );
  }

  if (mode === 'revealed') {
    return (
      <div class="actions-stack">
        <ArcadeBtn variant="primary" onClick={onSpinAgain} disabled={!canSpin}>Spin again</ArcadeBtn>
        <div class="actions-row">
          {validCount === 2 && (
            <ArcadeBtn variant="ghost" onClick={onGutCheck}>Gut-check</ArcadeBtn>
          )}
          {validCount >= 3 && (
            <ArcadeBtn variant="ghost" onClick={onTest}>5-spin test</ArcadeBtn>
          )}
          <ArcadeBtn variant="dim" onClick={onReset}>Done</ArcadeBtn>
        </div>
      </div>
    );
  }

  if (mode === 'testing') {
    return (
      <div class="actions-stack">
        <ArcadeBtn variant="dim" onClick={onReset}>Reset</ArcadeBtn>
      </div>
    );
  }

  return (
    <div class="actions-stack">
      <ArcadeBtn variant="primary" onClick={onSpinAgain} disabled={!canSpin}>Spin again</ArcadeBtn>
      <div class="actions-row">
        <ArcadeBtn variant="ghost" onClick={onReset}>Reset</ArcadeBtn>
      </div>
    </div>
  );
}
