import type { CSSProperties } from "react";

import { formatDuration } from "@/lib/formatDuration";
import { resultHeadline } from "@/lib/resultHeadline";
import type { SessionStats } from "@/lib/sessionResult";

type ResultSummaryProps = {
  description: string;
  stats: SessionStats;
  targetSeconds: number;
};

const ringRadius = 64;
const ringLength = 2 * Math.PI * ringRadius;

function ScoreRing({ correct, total, percent }: Pick<SessionStats, "correct" | "total" | "percent">) {
  const offset = ringLength * (1 - percent / 100);

  return (
    <div className="relative size-44">
      {/* Giro pelo atributo do SVG: um transform de CSS criava uma camada que aparecia como um quadrado. */}
      <svg viewBox="0 0 160 160" className="size-full" aria-hidden="true">
        <defs>
          <linearGradient id="result-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "#e2d9fb" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent)" }} />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={ringRadius} fill="none" strokeWidth="12" className="stroke-white/10" />
        {percent > 0 ? (
          <circle
            cx="80"
            cy="80"
            r={ringRadius}
            transform="rotate(-90 80 80)"
            fill="none"
            stroke="url(#result-ring-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={ringLength}
            strokeDashoffset={offset}
            className="result-ring-fill"
            style={{ "--ring-from": ringLength } as CSSProperties}
          />
        ) : null}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-4xl font-bold tracking-tight">
          {correct}
          <span className="text-fg-subtle">/{total}</span>
        </p>
        <p className="text-sm text-fg-muted">acertos</p>
      </div>
    </div>
  );
}

export function ResultSummary({ description, stats, targetSeconds }: ResultSummaryProps) {
  const isAverageOverTarget = stats.averageMs > targetSeconds * 1000;

  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <ScoreRing correct={stats.correct} total={stats.total} percent={stats.percent} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold">{resultHeadline(stats.percent)}</h1>
        <p className="leading-relaxed text-fg-muted">{description}</p>
      </div>

      <dl className="grid w-full grid-cols-2 gap-3 text-left">
        <div className="glass flex flex-col gap-1 rounded-3xl px-5 py-4">
          <dt className="text-sm text-fg-muted">média por questão · meta {formatDuration(targetSeconds * 1000)}</dt>
          <dd className="order-first font-display text-2xl font-bold tabular-nums">
            <span className={isAverageOverTarget ? "text-danger" : "text-fg"}>{formatDuration(stats.averageMs)}</span>
          </dd>
        </div>
        <div className="glass flex flex-col gap-1 rounded-3xl px-5 py-4">
          <dt className="text-sm text-fg-muted">tempo total</dt>
          <dd className="order-first font-display text-2xl font-bold tabular-nums">{formatDuration(stats.totalMs)}</dd>
        </div>
      </dl>
    </section>
  );
}
