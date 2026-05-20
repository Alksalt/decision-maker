import { useState, useEffect, useRef } from 'preact/hooks';
import type { Persona } from '../personas';

export type PersonaChipProps = {
  persona: Persona;
  personas: Persona[];
  onChange: (id: string) => void;
};

const SHORT_NAME_BY_ID: Record<string, string> = {
  overthinker: 'Overthinker',
  sarcastic: 'Sarcastic',
  mystic: 'Oracle',
  zen: 'Zen',
};

function shortName(persona: Persona): string {
  const mapped = SHORT_NAME_BY_ID[persona.id];
  if (mapped) return mapped;
  const last = persona.name.trim().split(/\s+/).pop() ?? persona.name;
  return last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
}

export function PersonaChip({ persona, personas, onChange }: PersonaChipProps) {
  const [open, setOpen] = useState<boolean>(false);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => {
      firstItemRef.current?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div
      class="persona-chip-wrap"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        class="persona-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span
          class="persona-chip__circle"
          style={{ background: persona.color }}
        >
          <span class="persona-chip__emoji">{persona.emoji}</span>
        </span>
        <span class="persona-chip__name">{shortName(persona)}</span>
        <svg
          class="persona-chip__chevron"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open && (
        <>
          <div class="persona-popover__backdrop" onClick={close} />
          <div class="persona-popover" role="menu">
            {personas.map((p, i) => (
              <button
                key={p.id}
                ref={i === 0 ? firstItemRef : undefined}
                type="button"
                role="menuitem"
                class={`persona-popover__item ${p.id === persona.id ? 'persona-popover__item--active' : ''}`}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
              >
                <span class="persona-popover__item-emoji">{p.emoji}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
