import type { Metadata } from "next";
import Link from "next/link";

import { primaryButton, secondaryButton } from "@/components/auth/authStyles";

export const metadata: Metadata = { title: "Boas-vindas" };

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-md flex-col px-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <svg width="80" height="80" viewBox="0 0 64 64" aria-hidden="true">
          <g fill="#B8A6F0">
            <circle cx="32" cy="16" r="8" />
            <circle cx="14" cy="46" r="8" />
            <circle cx="50" cy="46" r="8" />
          </g>
        </svg>
        <p className="mt-3 font-display text-3xl font-bold tracking-tight">Ergo</p>

        <h1 className="mt-14 text-[28px] leading-tight font-bold tracking-tight">Boas-vindas ao Ergo</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">
          Treine raciocínio lógico contra o relógio e revise o que errou no momento certo.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-10">
        <Link href="/auth/signUp" className={primaryButton}>
          Começar
        </Link>
        <Link href="/auth/login" className={secondaryButton}>
          Já tem uma conta? Entrar
        </Link>
      </div>
    </main>
  );
}
