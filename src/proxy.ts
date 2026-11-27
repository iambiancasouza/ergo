import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Precisa ficar em src/, no nível de app/, para o Next encontrar.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Fora: arquivos estáticos e do PWA, que não dependem de login.
  matcher: [
    "/((?!_next/static|_next/image|icons/|manifest.webmanifest|sw.js|offline.html|favicon.ico).*)",
  ],
};
