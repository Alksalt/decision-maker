type Props = {
  prompt: string;
  onRelieved: () => void;
  onBummed: () => void;
};

export function GutCheck({ prompt, onRelieved, onBummed }: Props) {
  return (
    <div class="gut-check">
      <div class="gut-check__prompt">{prompt}</div>
      <div class="gut-check__row">
        <button type="button" class="arcade-btn arcade-btn--ghost" onClick={onRelieved}>
          Relieved 😌
        </button>
        <button type="button" class="arcade-btn arcade-btn--ghost" onClick={onBummed}>
          Bummed 😩
        </button>
      </div>
    </div>
  );
}
