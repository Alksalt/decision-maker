type Props = { text: string };

export function Outcome({ text }: Props) {
  return <div class="outcome-card">{text}</div>;
}
