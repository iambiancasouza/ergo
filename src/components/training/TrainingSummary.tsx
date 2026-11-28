import Link from "next/link";

import { primaryButton, secondaryButton } from "@/components/auth/authStyles";
import type { TrainingAnswer } from "@/types/training";

type TrainingSummaryProps = {
  topicName: string;
  exit: { href: string; label: string };
  answers: TrainingAnswer[];
  isRetrying: boolean;
  onRetry: () => void;
};

// Só aparece quando, no fim, alguma resposta não foi salva; com tudo salvo, o treino vai para /result.
export function TrainingSummary({ topicName, exit, answers, isRetrying, onRetry }: TrainingSummaryProps) {
  const correct = answers.filter((answer) => answer.isCorrect).length;

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-md flex-col justify-center gap-6 px-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <section className="glass flex flex-col items-center gap-2 rounded-3xl p-6 text-center">
        <p className="text-sm text-fg-muted">{topicName}</p>
        <h1 className="font-display text-2xl font-bold">Treino concluído</h1>
        <p className="text-fg-muted">
          Você acertou{" "}
          <span className="font-semibold text-fg">
            {correct} de {answers.length}
          </span>
        </p>
        <p role="status" className="text-sm text-danger">
          Algumas respostas não foram salvas. Confira sua conexão e tente de novo.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={onRetry} disabled={isRetrying} className={primaryButton}>
          {isRetrying ? "Salvando…" : "Tentar salvar de novo"}
        </button>
        <Link href={exit.href} className={secondaryButton}>
          {exit.label}
        </Link>
      </div>
    </main>
  );
}
