import type { CSSProperties } from "react";

// [topo %, esquerda %, tamanho px, atraso s, duração s]. Fixos, sem sorteio: o HTML do servidor e o do navegador são iguais.
const sparkles: [number, number, number, number, number][] = [
  [6, 14, 2, 0, 4.2],
  [11, 78, 3, 1.6, 5.1],
  [17, 44, 2, 3.1, 4.6],
  [23, 92, 2, 0.8, 5.8],
  [28, 7, 3, 2.4, 4.9],
  [34, 61, 2, 4.0, 5.4],
  [41, 27, 2, 1.1, 4.4],
  [47, 85, 3, 3.6, 6.0],
  [52, 50, 2, 0.4, 5.2],
  [58, 12, 2, 2.9, 4.7],
  [63, 71, 3, 1.9, 5.6],
  [69, 36, 2, 4.4, 4.3],
  [74, 95, 2, 0.2, 5.0],
  [79, 20, 3, 3.3, 5.9],
  [84, 58, 2, 1.4, 4.5],
  [89, 4, 2, 2.7, 5.3],
  [93, 80, 3, 0.9, 4.8],
  [97, 41, 2, 3.9, 5.5],
];

export function Sparkles() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {sparkles.map(([top, left, size, delay, duration]) => (
        <span
          key={`${top}-${left}`}
          className="sparkle"
          style={
            {
              top: `${top}%`,
              left: `${left}%`,
              width: size,
              height: size,
              "--sparkle-delay": `${delay}s`,
              "--sparkle-duration": `${duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
