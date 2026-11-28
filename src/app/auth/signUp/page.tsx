import type { Metadata } from "next";

import { AuthCard, AuthDivider } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-md flex-col justify-center px-4 pt-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <AuthCard title="Criar conta" subtitle="Leva menos de um minuto.">
        <GoogleButton label="Criar conta com Google" />
        <AuthDivider />
        <SignUpForm />
      </AuthCard>
    </main>
  );
}
