"use client";

import { useState } from "react";

import { optionLetters } from "@/components/training/OptionList";
import { formatDuration } from "@/lib/formatDuration";
import type { ResultAttempt } from "@/services/results.service";

function answerLabel(options: string[], index: number) {
  return `${optionLetters[index]}) ${options[index]}`;
}

// Selecionada: a mesma cor, mais viva (borda cheia, contorno e halo mais forte).
const tileStyles = {
  correct: {
    base: "border-success/50 bg-surface-success shadow-[0_6px_18px_rgb(127_209_168/0.1)]",
    selected:
      "border-success bg-surface-success shadow-[0_0_0_1px_var(--color-success),0_8px_26px_rgb(127_209_168/0.4)]",
  },
  wrong: {
    base: "border-danger/50 bg-surface-danger shadow-[0_6px_18px_rgb(240_169_122/0.1)]",
    selected:
      "border-danger bg-surface-danger shadow-[0_0_0_1px_var(--color-danger),0_8px_26px_rgb(240_169_122/0.4)]",
  },
};

export function ResultQuestionGrid({ attempts }: { attempts: ResultAttempt[] }) {
  // Nada aberto de início: os detalhes só aparecem quando a pessoa toca numa questão.
  const [selected, setSelected] = useState<number | null>(null);
  const attempt = selected === null ? null : attempts[selected];

  return (
    <section className="glass flex flex-col gap-4 rounded-[28px] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold">Questão por questão</h2>

      <ul className="grid grid-cols-5 gap-2">
        {attempts.map((item, index) => {
          const isSelected = index === selected;
          const styles = tileStyles[item.isCorrect ? "correct" : "wrong"];
          return (
            <li key={item.questionId}>
              <button
                type="button"
                onClick={() => setSelected(isSelected ? null : index)}
                aria-pressed={isSelected}
                aria-label={`Questão ${index + 1}, ${item.isCorrect ? "acertou" : "errou"}, ${formatDuration(item.timeMs)}`}
                className={`flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-2xl border transition-[border-color,box-shadow] duration-150 ${isSelected ? styles.selected : styles.base}`}
              >
                <span className="font-display text-lg leading-none font-semibold">{index + 1}</span>
                <span className="text-xs text-fg-muted tabular-nums">{formatDuration(item.timeMs)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="flex flex-col gap-2 text-sm leading-relaxed">
        {attempt === null || selected === null ? (
          <p className="text-fg-subtle">Clique na questão para ver mais detalhes.</p>
        ) : (
          <>
            <p className="text-fg-muted">
              Questão {selected + 1}
              {attempt.topicName ? ` · ${attempt.topicName}` : ""} ·{" "}
              <span className={attempt.isCorrect ? "text-success" : "text-danger"}>
                {attempt.isCorrect ? "acertou" : "errou"} em {formatDuration(attempt.timeMs)}
              </span>
            </p>
            <div className="flex flex-col gap-2 border-t border-white/8 pt-3">
              <p className="font-semibold text-fg">{attempt.prompt}</p>
              <p>
                <span className="text-fg-subtle">Sua resposta: </span>
                <span className={attempt.isCorrect ? "text-success" : "text-danger"}>
                  {answerLabel(attempt.options, attempt.chosenIndex)}
                </span>
              </p>
              {attempt.isCorrect ? null : (
                <p>
                  <span className="text-fg-subtle">Resposta certa: </span>
                  <span className="text-success">{answerLabel(attempt.options, attempt.correctIndex)}</span>
                </p>
              )}
              <p className="whitespace-pre-line text-fg-subtle">{attempt.explanation}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
