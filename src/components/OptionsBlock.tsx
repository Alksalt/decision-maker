import type { Option } from '../spin';

type Props = {
  options: Option[];
  disabled: boolean;
  onAddQuick: () => void;
  onAddTyped: () => void;
  onUpdate: (id: string, label: string) => void;
  onRemove: (id: string) => void;
};

export function OptionsBlock({
  options,
  disabled,
  onAddQuick,
  onAddTyped,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <div class={`options-block ${disabled ? 'options-disabled' : ''}`}>
      <div class="options-header">
        <span class="options-header__count">OPTIONS · {options.length}</span>
        <div class="options-add-row">
          <button
            type="button"
            class="options-add-btn"
            onClick={onAddQuick}
            disabled={disabled}
          >+ A</button>
          <button
            type="button"
            class="options-add-btn"
            onClick={onAddTyped}
            disabled={disabled}
          >+ Text</button>
        </div>
      </div>
      {options.length === 0 ? (
        <div class="options-empty">add at least 2 options to spin →</div>
      ) : (
        <div class="options-list">
          {options.map((opt, i) => (
            <div key={opt.id} class="option-row">
              <span class="option-row__index">{String(i + 1).padStart(2, '0')}</span>
              <input
                class="option-row__input"
                type="text"
                value={opt.label}
                placeholder="type…"
                disabled={disabled}
                onInput={(e) =>
                  onUpdate(opt.id, (e.currentTarget as HTMLInputElement).value)
                }
              />
              <button
                type="button"
                class="option-row__remove"
                aria-label={`Remove option ${i + 1}`}
                disabled={disabled}
                onClick={() => onRemove(opt.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
