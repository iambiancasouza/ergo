import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { TopicList, TopicListSkeleton } from "@/components/training/TopicList";

export const metadata: Metadata = { title: "Treinar" };

export default function TrainingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pt-6 pb-8 md:px-8 xl:pt-8">
      <PageHeader title="Treinar" description="Escolha um tema para treinar." />
      {/* Lê a sessão (cookies): com cacheComponents, precisa de Suspense. */}
      <Suspense fallback={<TopicListSkeleton />}>
        <TopicList />
      </Suspense>
    </main>
  );
}
