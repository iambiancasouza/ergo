import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrainingSession } from "@/components/training/TrainingSession";
import { TrainingSkeleton } from "@/components/training/TrainingSkeleton";
import { getTargetSeconds } from "@/services/profile.service";
import { getReviewTraining } from "@/services/questions.service";

export const metadata: Metadata = { title: "Revisão dos erros" };

export default function ReviewTrainingPage({ params }: PageProps<"/training/review/[id]">) {
  return (
    // O id da sessão revisada vem da URL: com cacheComponents, precisa de Suspense.
    <Suspense fallback={<TrainingSkeleton />}>
      <ReviewLoader params={params} />
    </Suspense>
  );
}

async function ReviewLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [questions, targetSeconds] = await Promise.all([getReviewTraining(id), getTargetSeconds()]);

  if (questions.length === 0) notFound();

  return (
    <TrainingSession
      title="Revisão dos erros"
      target={{ kind: "review" }}
      questions={questions}
      targetSeconds={targetSeconds}
    />
  );
}
