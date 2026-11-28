import { Suspense } from "react";

import { DailyCard } from "@/components/home/DailyCard";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { TopicWheel } from "@/components/home/TopicWheel";
import { describeDailyPlan } from "@/lib/dailyDescription";
import { formatLongDate } from "@/lib/dayKey";
import { getDailyTraining } from "@/services/daily.service";
import { getProfile } from "@/services/profile.service";
import { getTopics } from "@/services/topics.service";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pt-6 pb-8 md:px-8 xl:pt-8">
      {/* Nome, data e treino do dia dependem da pessoa (sessão): com cacheComponents, precisa de Suspense. */}
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

async function HomeContent() {
  const profile = await getProfile();
  const [{ questions, plan, weakestTopicName }, topics] = await Promise.all([
    getDailyTraining(profile.timezone),
    getTopics(),
  ]);
  const firstName = profile.displayName?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-fg-muted">{formatLongDate(new Date(), profile.timezone)}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{firstName ? `Olá, ${firstName}` : "Olá!"}</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {questions.length > 0 ? (
          <DailyCard
            questionCount={questions.length}
            description={describeDailyPlan({ ...plan, weakestTopicName })}
            minutes={Math.max(1, Math.round((questions.length * profile.targetSeconds) / 60))}
          />
        ) : null}
        {topics.length > 0 ? <TopicWheel topics={topics} /> : null}
      </div>
    </div>
  );
}
