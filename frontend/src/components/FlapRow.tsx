import { FlapDigit } from "./FlapDigit";

interface FlapRowProps {
  value: string;
  minWidth?: number;
}

export function FlapRow({ value, minWidth = 3 }: FlapRowProps) {
  const padded = value.padStart(minWidth, "0").split("");
  return (
    <span className="flap-row">
      {padded.map((char, i) => (
        <FlapDigit key={i} char={char} />
      ))}
    </span>
  );
}
