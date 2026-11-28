import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrainingSession } from "@/components/training/TrainingSession";
import { TrainingSkeleton } from "@/components/training/TrainingSkeleton";
import { getDailyTraining } from "@/services/daily.service";
import { getProfile } from "@/services/profile.service";

export const metadata: Metadata = { title: "Treino do dia" };

export default function DailyTrainingPage() {
  return (
    // As questões dependem das respostas da pessoa (sessão): com cacheComponents, precisa de Suspense.
    <Suspense fallback={<TrainingSkeleton />}>
      <DailyLoader />
    </Suspense>
  );
}

async function DailyLoader() {
  const profile = await getProfile();
  const { questions } = await getDailyTraining(profile.timezone);

  if (questions.length === 0) notFound();

  return (
    <TrainingSession
      title="Treino do dia"
      target={{ kind: "daily" }}
      questions={questions}
      targetSeconds={profile.targetSeconds}
    />
  );
}
