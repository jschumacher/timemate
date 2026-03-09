import { useEffect, useRef, useState } from "react";

interface RollingTextProps {
  text: string;
  className?: string;
}

/**
 * Animates each character with a vertical slide transition (odometer style).
 * Digits roll up/down based on direction; letters crossfade.
 */
export function RollingText({ text, className = "" }: RollingTextProps) {
  const prevTextRef = useRef(text);
  const [chars, setChars] = useState(() =>
    text.split("").map((ch, i) => ({ ch, key: `${i}-${ch}`, direction: 0 as -1 | 0 | 1 }))
  );

  useEffect(() => {
    const prev = prevTextRef.current;
    prevTextRef.current = text;

    const newChars = text.split("").map((ch, i) => {
      const prevCh = prev[i];
      let direction: -1 | 0 | 1 = 0;
      if (prevCh !== ch) {
        // For digits, determine direction based on value
        const prevNum = prevCh ? parseInt(prevCh) : NaN;
        const newNum = parseInt(ch);
        if (!isNaN(prevNum) && !isNaN(newNum)) {
          direction = newNum > prevNum ? 1 : -1;
        } else {
          direction = 1;
        }
      }
      return { ch, key: `${i}-${ch}-${Date.now()}`, direction };
    });
    setChars(newChars);
  }, [text]);

  return (
    <span className={`inline-flex ${className}`}>
      {chars.map((c) => (
        <RollingChar key={c.key} ch={c.ch} direction={c.direction} />
      ))}
    </span>
  );
}

function RollingChar({ ch, direction }: { ch: string; direction: -1 | 0 | 1 }) {
  return (
    <span
      className="inline-block overflow-hidden relative"
      style={{ lineHeight: "1.2" }}
    >
      <span
        className={direction !== 0 ? "rolling-char" : ""}
        style={{
          display: "inline-block",
          ["--roll-from" as string]: direction === 1 ? "0.8em" : direction === -1 ? "-0.8em" : "0",
        }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    </span>
  );
}
