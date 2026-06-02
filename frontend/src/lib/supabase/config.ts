export interface SupabaseConfig {
  readonly anonKey: string;
  readonly serviceRoleKey?: string;
  readonly url: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: url.replace(/\/$/, ""),
  };
};

export const getMissingSupabaseConfigMessage = () =>
  "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar a autenticação.";
