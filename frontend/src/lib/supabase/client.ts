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
        ...getSchemaHeaders(path, options.method ?? "GET"),
        apikey: apiKey,
        Authorization: `Bearer ${options.accessToken ?? apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payloadText = await response.text();
    const payload = parseResponsePayload<ResponseBody>(payloadText);

    if (!response.ok) {
      const message =
        payload.error_description ??
        payload.msg ??
        payload.error ??
        payload.message ??
        payload.details ??
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

const parseResponsePayload = <ResponseBody>(payloadText: string) => {
  if (!payloadText) {
    return {} as ResponseBody & SupabaseAuthResponse;
  }

  try {
    return JSON.parse(payloadText) as ResponseBody & SupabaseAuthResponse;
  } catch {
    return {} as ResponseBody & SupabaseAuthResponse;
  }
};

const getSchemaHeaders = (path: string, method: string) => {
  if (!path.startsWith("/rest/v1/")) {
    return {};
  }

  const headers: Record<string, string> = {
    "Accept-Profile": "public",
  };

  if (method !== "GET") {
    headers["Content-Profile"] = "public";
  }

  return headers;
};
