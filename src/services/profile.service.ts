import { createClient } from "@/lib/supabase/server";

// Os mesmos padrões do banco (profiles.timezone e profiles.target_seconds).
const defaults = { timezone: "America/Sao_Paulo", targetSeconds: 90 };

type Profile = {
  displayName: string | null;
  timezone: string;
  targetSeconds: number;
};

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  // O RLS só devolve a linha da própria pessoa.
  const { data, error } = await supabase.from("profiles").select("display_name, timezone, target_seconds").maybeSingle();

  if (error) throw new Error(`Não foi possível carregar o perfil: ${error.message}`);
  return {
    displayName: data?.display_name ?? null,
    timezone: data?.timezone ?? defaults.timezone,
    targetSeconds: data?.target_seconds ?? defaults.targetSeconds,
  };
}

export async function getTargetSeconds(): Promise<number> {
  return (await getProfile()).targetSeconds;
}
