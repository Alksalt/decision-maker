import type { Persona } from '../personas';

type Props = {
  eyebrow: string;
  doubt: string;
  persona: Persona;
};

export function Doubt({ eyebrow, doubt, persona }: Props) {
  return (
    <div>
      <div class="reveal-eyebrow">{eyebrow}</div>
      <div class="doubt-card">
        <span class="doubt-card__emoji">{persona.emoji}</span>
        <span class="doubt-card__text">{doubt}</span>
      </div>
    </div>
  );
}
