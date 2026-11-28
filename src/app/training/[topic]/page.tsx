import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrainingSession } from "@/components/training/TrainingSession";
import { TrainingSkeleton } from "@/components/training/TrainingSkeleton";
import { getTargetSeconds } from "@/services/profile.service";
import { getTopicTraining } from "@/services/questions.service";

export const metadata: Metadata = { title: "Treino" };

export default function TrainingTopicPage({ params, searchParams }: PageProps<"/training/[topic]">) {
  return (
    // O tema da URL ([topic]) e a sessão só existem na requisição: com cacheComponents, precisa de Suspense.
    <Suspense fallback={<TrainingSkeleton />}>
      <TrainingLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}

type LoaderProps = {
  params: Promise<{ topic: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function TrainingLoader({ params, searchParams }: LoaderProps) {
  const [{ topic }, { from }] = await Promise.all([params, searchParams]);
  const [training, targetSeconds] = await Promise.all([getTopicTraining(topic), getTargetSeconds()]);

  if (!training || training.questions.length === 0) notFound();

  return (
    <TrainingSession
      title={training.topic.name}
      target={{ kind: "topic", topicId: training.topic.id }}
      questions={training.questions}
      targetSeconds={targetSeconds}
      // ?from=home vem da roleta do Início: o × volta para lá. Qualquer outro valor é ignorado.
      startedAtHome={from === "home"}
    />
  );
}
