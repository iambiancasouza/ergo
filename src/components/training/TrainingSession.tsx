"use client";

import { QuestionStep } from "@/components/training/QuestionStep";
import { TrainingSummary } from "@/components/training/TrainingSummary";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import type { SessionTarget, TrainingQuestion } from "@/types/training";

type TrainingSessionProps = {
  title: string;
  target: SessionTarget;
  questions: TrainingQuestion[];
  targetSeconds: number;
  /** O treino por tema começou no Início (pela roleta), e não na lista de temas. */
  startedAtHome?: boolean;
};

// Sair volta para onde o treino começou: a lista de temas, ou o Início (treino do dia, revisão e roleta).
function exitFor(target: SessionTarget, startedAtHome: boolean) {
  return target.kind === "topic" && !startedAtHome
    ? { href: "/training", label: "Voltar aos temas" }
    : { href: "/", label: "Voltar ao início" };
}

export function TrainingSession({ title, target, questions, targetSeconds, startedAtHome = false }: TrainingSessionProps) {
  const session = useTrainingSession(questions, target);
  const exit = exitFor(target, startedAtHome);

  if (session.isFinished) {
    return (
      <TrainingSummary
        topicName={title}
        exit={exit}
        answers={session.answers}
        isRetrying={session.isFinishing}
        onRetry={session.retryFinish}
      />
    );
  }

  return (
    // A key recria o passo a cada questão (e a cada recomeço): cronômetro, escolha e confirmação começam do zero.
    <QuestionStep
      key={`${session.run}-${session.question.id}`}
      title={title}
      exitHref={exit.href}
      question={session.question}
      position={session.position}
      total={session.total}
      isLast={session.isLast}
      targetSeconds={targetSeconds}
      saveFailed={session.saveFailed}
      isFinishing={session.isFinishing}
      onAnswer={session.recordAnswer}
      onNext={session.next}
    />
  );
}
