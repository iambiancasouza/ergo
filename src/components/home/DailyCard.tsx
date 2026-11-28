import Link from "next/link";

import { primaryButton } from "@/components/auth/authStyles";

type DailyCardProps = {
  questionCount: number;
  description: string;
  minutes: number;
};

export function DailyCard({ questionCount, description, minutes }: DailyCardProps) {
  return (
    <section className="glass flex flex-col gap-4 rounded-[28px] p-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">Treino do dia</p>
      <h2 className="font-display text-2xl leading-tight font-bold">
        {questionCount} {questionCount === 1 ? "questão" : "questões"} em ritmo de prova
      </h2>
      <p className="leading-relaxed text-fg-muted">{description}</p>
      <Link href="/training/daily" className={`${primaryButton} mt-2`}>
        Começar · ~{minutes} min
      </Link>
    </section>
  );
}
