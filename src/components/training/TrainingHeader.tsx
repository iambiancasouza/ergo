import Link from "next/link";

import { formatDuration } from "@/lib/formatDuration";

type TrainingHeaderProps = {
  title: string;
  exitHref: string;
  position: number;
  total: number;
  elapsedMs: number;
  targetSeconds: number;
};

export function TrainingHeader({ title, exitHref, position, total, elapsedMs, targetSeconds }: TrainingHeaderProps) {
  const isOverTarget = elapsedMs > targetSeconds * 1000;

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={exitHref}
          aria-label="Sair do treino"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-surface text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>

        {/* flex-1 + min-w-0: o meio ocupa o espaço entre o × e o cronômetro, e o título longo corta com "…". */}
        <div className="flex min-w-0 flex-1 flex-col text-center">
          <p className="truncate text-sm text-fg-muted">{title}</p>
          <p className="truncate font-display font-semibold">
            Questão {position} de {total}
          </p>
        </div>

        <p className="w-24 shrink-0 text-right text-sm tabular-nums">
          <span className={isOverTarget ? "font-semibold text-danger" : "font-semibold text-fg"}>
            {formatDuration(elapsedMs)}
          </span>
          <span className="text-fg-subtle"> / {formatDuration(targetSeconds * 1000)}</span>
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Progresso do treino"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={position}
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${(position / total) * 100}%` }}
        />
      </div>
    </header>
  );
}
