"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  checkEmail?: string;
};

const loginSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  password: z.string().min(1, { error: "Informe a senha." }),
});

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Informe seu nome." })
    .max(80, { error: "Use até 80 caracteres." }),
  email: z.email({ error: "Informe um e-mail válido." }),
  password: z.string().min(8, { error: "A senha precisa de pelo menos 8 caracteres." }),
  timezone: z.string().max(64).optional(),
});

function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
    case "user_already_exists":
      return "Já existe uma conta com esse e-mail.";
    case "weak_password":
      return "Essa senha é fraca demais. Tente uma mais longa.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
    default:
      return "Não foi possível continuar agora. Tente de novo.";
  }
}

function fieldErrorsFrom(error: z.ZodError): AuthFormState["fieldErrors"] {
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "name" || field === "email" || field === "password") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: authErrorMessage(error.code) };

  redirect("/");
}

export async function signUp(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    timezone: formData.get("timezone") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const { name, email, password, timezone } = parsed.data;

  // O link de confirmação volta para o endereço de onde a pessoa veio.
  const origin = (await headers()).get("origin") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lidos pelo gatilho handle_new_user, que cria o perfil.
      data: { display_name: name, timezone },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { error: authErrorMessage(error.code) };

  // Sessão pronta = confirmação de e-mail desligada no Supabase.
  if (data.session) redirect("/");

  return { checkEmail: email };
}

export async function signInWithGoogle() {
  const origin = (await headers()).get("origin") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) redirect("/auth/login?erro=google");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
