import { useEffect, useRef, useState } from "react";

import { primaryButton } from "@/components/auth/authStyles";
import { ExplanationPanel } from "@/components/training/ExplanationPanel";
import { OptionList, optionLetters } from "@/components/training/OptionList";
import { QuestionCard } from "@/components/training/QuestionCard";
import { TrainingHeader } from "@/components/training/TrainingHeader";
import { useTimer } from "@/hooks/useTimer";
import type { TrainingAnswer, TrainingQuestion } from "@/types/training";

type QuestionStepProps = {
  title: string;
  exitHref: string;
  question: TrainingQuestion;
  position: number;
  total: number;
  isLast: boolean;
  targetSeconds: number;
  saveFailed: boolean;
  isFinishing: boolean;
  onAnswer: (answer: TrainingAnswer) => void;
  onNext: () => void;
};

export function QuestionStep({
  title,
  exitHref,
  question,
  position,
  total,
  isLast,
  targetSeconds,
  saveFailed,
  isFinishing,
  onAnswer,
  onNext,
}: QuestionStepProps) {
  const { elapsedMs, stop } = useTimer();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const explanationRef = useRef<HTMLElement>(null);

  const isCorrect = selectedIndex === question.correctIndex;
  const correctLetter = optionLetters[question.correctIndex];

  // No celular a explicação aparece abaixo da dobra.
  useEffect(() => {
    if (isConfirmed) explanationRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isConfirmed]);

  function confirm() {
    if (selectedIndex === null) return;
    const timeMs = stop();
    setIsConfirmed(true);
    onAnswer({ questionId: question.id, chosenIndex: selectedIndex, isCorrect, timeMs });
  }

  function goNext() {
    // Na última, o botão mostra "Salvando…" até abrir o resultado: a tela fica onde está.
    if (!isLast) window.scrollTo({ top: 0 });
    onNext();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pt-4 pb-[calc(3rem+env(safe-area-inset-bottom))] md:px-8 xl:pt-8">
      <TrainingHeader
        title={title}
        exitHref={exitHref}
        position={position}
        total={total}
        elapsedMs={elapsedMs}
        targetSeconds={targetSeconds}
      />

      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <QuestionCard question={question} />

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg leading-snug font-semibold md:pt-1">{question.prompt}</h2>

          <OptionList
            options={question.options}
            selectedIndex={selectedIndex}
            correctIndex={question.correctIndex}
            isConfirmed={isConfirmed}
            onSelect={setSelectedIndex}
          />

          {isConfirmed ? (
            <ExplanationPanel
              ref={explanationRef}
              isCorrect={isCorrect}
              correctLetter={correctLetter}
              explanation={question.explanation}
            />
          ) : null}

          {saveFailed ? (
            <p role="status" className="text-sm text-danger">
              Uma resposta não foi salva. Vamos tentar de novo na próxima.
            </p>
          ) : null}

          <p aria-live="polite" className="sr-only">
            {isConfirmed ? (isCorrect ? "Acertou." : `Errou. A resposta certa é a ${correctLetter}.`) : ""}
          </p>

          {isConfirmed ? (
            <button type="button" onClick={goNext} disabled={isFinishing} className={primaryButton}>
              {isFinishing ? "Salvando…" : isLast ? "Ver resultado" : "Próxima"}
            </button>
          ) : (
            <button type="button" onClick={confirm} disabled={selectedIndex === null} className={primaryButton}>
              Confirmar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
