import { getSupabaseConfig } from "./config";
import type { SupabaseAuthResponse } from "./types";

export const refreshSupabaseAuthSession = async (
  refreshToken: string,
): Promise<SupabaseAuthResponse> => {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Configuração Supabase ausente.");
  }

  const response = await fetch(
    `${config.url}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as SupabaseAuthResponse;

  if (!response.ok) {
    throw new Error(
      payload.error_description ??
        payload.msg ??
        payload.error ??
        "Não foi possível renovar a sessão.",
    );
  }

  return payload;
};
