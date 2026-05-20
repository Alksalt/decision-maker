import type { ComponentChildren } from 'preact';

type Variant = 'primary' | 'ghost' | 'dim';

type Props = {
  children: ComponentChildren;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
};

export function ArcadeBtn({ children, onClick, variant = 'primary', disabled }: Props) {
  return (
    <button
      type="button"
      class={`arcade-btn arcade-btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
