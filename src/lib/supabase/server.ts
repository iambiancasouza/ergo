import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";

import type { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();
  // O supabase-js lê Date.now() (validade da sessão): fora do prefetch, que o Next acusa como valor instável.
  await io();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components não gravam cookies; o proxy já renova a sessão.
          }
        },
      },
    },
  );
}
