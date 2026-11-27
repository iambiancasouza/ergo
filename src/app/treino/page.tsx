import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Treinar" };

export default function TreinoPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pt-14 pb-8 md:px-8 xl:pt-12">
      <PageHeader title="Treinar" description="Escolha um tema para treinar." />
    </main>
  );
}
