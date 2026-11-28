import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { primaryButton, secondaryButton } from "@/components/auth/authStyles";
import { ResultQuestionGrid } from "@/components/result/ResultQuestionGrid";
import { ResultSkeleton } from "@/components/result/ResultSkeleton";
import { ResultSummary } from "@/components/result/ResultSummary";
import { summarizeAttempts } from "@/lib/sessionResult";
import { getTargetSeconds } from "@/services/profile.service";
import { getSessionResult } from "@/services/results.service";

export const metadata: Metadata = { title: "Resultado" };

export default function ResultPage({ params }: PageProps<"/result/[id]">) {
  return (
    // O id da URL e a sessão só existem na requisição: com cacheComponents, precisa de Suspense.
    <Suspense fallback={<ResultSkeleton />}>
      <ResultLoader params={params} />
    </Suspense>
  );
}

async function ResultLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, targetSeconds] = await Promise.all([getSessionResult(id), getTargetSeconds()]);

  if (!result || result.attempts.length === 0) notFound();

  const stats = summarizeAttempts(result.attempts);
  const wrongCount = stats.total - stats.correct;

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-5 pt-8 pb-[calc(3rem+env(safe-area-inset-bottom))] md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-8 md:px-8 xl:pt-10">
      <div className="md:col-start-1 md:row-start-1">
        <ResultSummary
          description={describeResult(result.kind, result.topic?.name ?? null, stats.correct, stats.total)}
          stats={stats}
          targetSeconds={targetSeconds}
        />
      </div>

      <div className="flex flex-col gap-6 md:col-start-2 md:row-span-2 md:row-start-1">
        <ResultQuestionGrid attempts={result.attempts} />
      </div>

      {/* No celular os botões vêm por último; no tablet ficam abaixo do resumo. */}
      <div className="flex flex-col gap-3 md:col-start-1 md:row-start-2 md:self-start">
        {wrongCount > 0 ? (
          <Link href={`/training/review/${id}`} className={primaryButton}>
            {wrongCount === 1 ? "Revisar o erro agora" : `Revisar os ${wrongCount} erros agora`}
          </Link>
        ) : null}
        <Link href="/" className={wrongCount > 0 ? secondaryButton : primaryButton}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

function describeResult(kind: string, topicName: string | null, correct: number, total: number) {
  const questions = total === 1 ? "questão" : "questões";
  if (kind === "review") return `Você acertou ${correct} de ${total} ${questions} que tinha errado.`;
  if (kind === "daily") return `Você acertou ${correct} de ${total} ${questions} do treino do dia.`;
  if (topicName) return `Você acertou ${correct} de ${total} ${questions} de ${topicName.toLocaleLowerCase("pt-BR")}.`;
  return `Você acertou ${correct} de ${total} ${questions}.`;
}
