import { useEffect, useRef, useState } from "react";

interface FlapDigitProps {
  char: string;
}

/**
 * Renders one character as a mechanical split-flap tile. When `char`
 * changes, the top half of the old tile flips down over the new value
 * — the signature moment for every tally update in the app.
 */
export function FlapDigit({ char }: FlapDigitProps) {
  const [displayChar, setDisplayChar] = useState(char);
  const [flipping, setFlipping] = useState(false);
  const prevChar = useRef(char);

  useEffect(() => {
    if (char !== prevChar.current) {
      setFlipping(true);
      const timeout = setTimeout(() => {
        setDisplayChar(char);
        setFlipping(false);
        prevChar.current = char;
      }, 260);
      return () => clearTimeout(timeout);
    }
  }, [char]);

  return (
    <span className={`flap-tile${flipping ? " flap-tile--flipping" : ""}`}>
      <span className="flap-half flap-half--top">
        <span className="flap-char">{flipping ? prevChar.current : displayChar}</span>
      </span>
      <span className="flap-half flap-half--bottom">
        <span className="flap-char">{displayChar}</span>
      </span>
      {flipping && (
        <span className="flap-flip-leaf">
          <span className="flap-char">{prevChar.current}</span>
        </span>
      )}
      <span className="flap-hinge" />
    </span>
  );
}
