import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="relative flex flex-col gap-5 rounded-[28px] border border-white/14 bg-surface p-5 shadow-[0_20px_50px_rgb(0_0_0/0.45),0_8px_28px_rgb(184_166_240/0.12),inset_0_1px_0_rgb(255_255_255/0.2)] sm:p-6">
      <Link
        href="/auth"
        aria-label="Voltar para as boas-vindas"
        className="absolute top-4 left-4 flex size-11 items-center justify-center rounded-full border border-white/12 bg-surface text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] sm:top-5 sm:left-5"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      </Link>

      <header className="flex flex-col items-center gap-2 px-12 pt-1.5 text-center">
        <h1 className="text-2xl leading-tight font-bold tracking-tight">{title}</h1>
        <p className="text-fg-muted">{subtitle}</p>
      </header>

      {children}
    </section>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label="ou com e-mail">
      <span className="h-px flex-1 bg-white/12" />
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
        ou com e-mail
      </span>
      <span className="h-px flex-1 bg-white/12" />
    </div>
  );
}
