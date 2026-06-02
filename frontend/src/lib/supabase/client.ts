import { getMissingSupabaseConfigMessage, getSupabaseConfig } from "./config";
import type { SupabaseAuthResponse, SupabaseRequestOptions } from "./types";

type BrowserSupabaseRequestOptions = Omit<
  SupabaseRequestOptions,
  "accessToken" | "serviceRole"
>;

export const createSupabaseRequestClient = () => {
  const config = getSupabaseConfig();

  const request = async <ResponseBody>(
    path: string,
    options: SupabaseRequestOptions = {},
  ): Promise<ResponseBody> => {
    if (!config) {
      throw new Error(getMissingSupabaseConfigMessage());
    }

    if (options.serviceRole && !config.serviceRoleKey) {
      throw new Error(
        "Configure SUPABASE_SERVICE_ROLE_KEY para operações admin.",
      );
    }

    const apiKey = options.serviceRole ? config.serviceRoleKey : config.anonKey;

    if (!apiKey) {
      throw new Error("Configuração Supabase inválida.");
    }

    const response = await fetch(`${config.url}${path}`, {
      method: options.method ?? "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${options.accessToken ?? apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = (await response.json().catch(() => ({}))) as ResponseBody &
      SupabaseAuthResponse;

    if (!response.ok) {
      const message =
        payload.error_description ??
        payload.msg ??
        payload.error ??
        "Não foi possível concluir a solicitação.";
      throw new Error(message);
    }

    return payload;
  };

  return { request };
};

export const createBrowserSupabaseClient = () => {
  const client = createSupabaseRequestClient();

  return {
    request: <ResponseBody>(
      path: string,
      options: BrowserSupabaseRequestOptions = {},
    ) => client.request<ResponseBody>(path, options),
  };
};
