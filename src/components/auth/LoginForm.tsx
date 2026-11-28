"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { signIn, type AuthFormState } from "@/app/actions/auth";
import { AuthField } from "@/components/auth/AuthField";
import { primaryButton } from "@/components/auth/authStyles";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(signIn, {});

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <AuthField
        name="email"
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <AuthField
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={`${primaryButton} mt-1`}>
        {isPending ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center text-sm text-fg-muted">
        Ainda não tem conta?{" "}
        <Link href="/auth/signUp" className="inline-flex min-h-11 items-center font-semibold text-accent">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

const errorMessages: Record<string, string> = {
  google: "Não foi possível entrar com o Google. Tente de novo.",
};

export function AuthErrorNotice() {
  const searchParams = useSearchParams();
  const message = errorMessages[searchParams.get("erro") ?? ""];
  if (!message) return null;

  return (
    <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
      {message}
    </p>
  );
}
