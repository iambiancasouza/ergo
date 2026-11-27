"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signUp, type AuthFormState } from "@/app/actions/auth";
import { AuthField } from "@/components/auth/AuthField";
import { primaryButton } from "@/components/auth/authStyles";

// Fuso lido no envio, e não na renderização, para o HTML do servidor e o do navegador serem iguais.
function signUpWithTimezone(previous: AuthFormState, formData: FormData) {
  formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  return signUp(previous, formData);
}

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(signUpWithTimezone, {});

  if (state.checkEmail) {
    return (
      <div role="status" className="glass flex flex-col gap-2 rounded-3xl p-6 text-center">
        <p className="font-display text-lg font-semibold">Confira seu e-mail</p>
        <p className="text-fg-muted">
          Enviamos um link de confirmação para <span className="text-fg">{state.checkEmail}</span>. Abra o link
          para entrar no Ergo.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <AuthField
        name="name"
        label="Nome"
        type="text"
        autoComplete="name"
        required
        maxLength={80}
        error={state.fieldErrors?.name}
      />
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
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="Pelo menos 8 caracteres"
        error={state.fieldErrors?.password}
      />

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={`${primaryButton} mt-1`}>
        {isPending ? "Criando conta…" : "Criar conta"}
      </button>

      <p className="text-center text-sm text-fg-muted">
        Já tem uma conta?{" "}
        <Link href="/auth/login" className="inline-flex min-h-11 items-center font-semibold text-accent">
          Entrar
        </Link>
      </p>
    </form>
  );
}
