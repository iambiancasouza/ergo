import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Placar" };

export default function ScoreboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pt-6 pb-8 md:px-8 xl:pt-8">
      <PageHeader title="Placar" description="Seus acertos por semana e por tema." />
    </main>
  );
}
