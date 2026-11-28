import type { Ref } from "react";

type ExplanationPanelProps = {
  isCorrect: boolean;
  correctLetter: string;
  explanation: string;
  ref?: Ref<HTMLElement>;
};

export function ExplanationPanel({ isCorrect, correctLetter, explanation, ref }: ExplanationPanelProps) {
  return (
    <section ref={ref} className="glass flex scroll-mb-28 flex-col gap-2 rounded-3xl p-5">
      <p className={`font-display font-semibold ${isCorrect ? "text-success" : "text-danger"}`}>
        {isCorrect ? "Acertou!" : `Não foi dessa vez. Resposta certa: ${correctLetter}`}
      </p>
      <p className="leading-relaxed whitespace-pre-line text-fg-muted">{explanation}</p>
    </section>
  );
}
