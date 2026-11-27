import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthCard, AuthDivider } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthErrorNotice, LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-md flex-col justify-center px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <AuthCard title="Entrar" subtitle="Que bom ter você de volta.">
        {/* Lê a URL (?erro=…): com cacheComponents, isso exige Suspense. */}
        <Suspense fallback={null}>
          <AuthErrorNotice />
        </Suspense>

        <GoogleButton label="Entrar com Google" />
        <AuthDivider />
        <LoginForm />
      </AuthCard>
    </main>
  );
}
