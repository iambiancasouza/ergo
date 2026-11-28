import type { JSX } from "react";

// Símbolo de cada tema (pelo slug), desenhado numa área de 24×24 centrada em (0, 0).
// Tema sem símbolo cai num ponto de interrogação.

function Text({ children, size = 13 }: { children: string; size?: number }) {
  return (
    <text
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      fontWeight="700"
      className="fill-current font-display"
    >
      {children}
    </text>
  );
}

function Strokes({ d }: { d: string }) {
  return (
    <path
      d={d}
      transform="translate(-12 -12)"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

const icons: Record<string, () => JSX.Element> = {
  proposicoes: () => <Strokes d="M4 12h15M14 7l5 5-5 5" />,
  argumentacao: () => <Strokes d="M4 5h16v11H10l-5 4v-4H4z" />,
  verdadeMentira: () => <Strokes d="M2 12l3 3 5-6M14 8l7 7M21 8l-7 7" />,
  associacaoLogica: () => <Strokes d="M4 4h16v16H4zM9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" />,
  sequenciasNumericas: () => <Text>123</Text>,
  sequenciasLetras: () => <Text>ABC</Text>,
  sequenciasPalavras: () => <Text>a:b</Text>,
  sequenciasFiguras: () => <Strokes d="M1 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9 15l3-6 3 6zM17 9h6v6h-6z" />,
  fracoes: () => <Text size={18}>½</Text>,
  porcentagem: () => <Text size={18}>%</Text>,
  probabilidade: () => (
    <>
      <Strokes d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      {[
        [-4, -4],
        [0, 0],
        [4, 4],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" className="fill-current" />
      ))}
    </>
  ),
};

export function TopicIcon({ slug }: { slug: string }) {
  const Icon = icons[slug];
  return Icon ? <Icon /> : <Text size={16}>?</Text>;
}
