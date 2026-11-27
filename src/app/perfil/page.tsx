import type { Metadata } from "next";

import { signOut } from "@/app/actions/auth";
import { secondaryButton } from "@/components/auth/authStyles";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Perfil" };

export default function PerfilPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pt-14 pb-8 md:px-8 xl:pt-12">
      <PageHeader title="Perfil" description="Sua meta de tempo por questão e sua conta." />

      <form action={signOut} className="max-w-sm">
        <button type="submit" className={secondaryButton}>
          Sair da conta
        </button>
      </form>
    </main>
  );
}
