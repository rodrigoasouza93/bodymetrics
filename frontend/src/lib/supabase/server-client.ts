import { cookies } from "next/headers";
import { refreshSupabaseAuthSession } from "./auth-session";
import { createSupabaseRequestClient } from "./client";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  getAuthCookieOptions,
} from "./cookies";
import type {
  SupabaseAuthResponse,
  SupabaseRequestOptions,
  SupabaseUser,
} from "./types";

export interface CurrentSupabaseSession {
  readonly accessToken: string;
  readonly user: SupabaseUser;
}

export const createServerSupabaseClient = createSupabaseRequestClient;

export const createAdminSupabaseClient = () => {
  const client = createSupabaseRequestClient();

  return {
    request: <ResponseBody>(
      path: string,
      options: Omit<SupabaseRequestOptions, "serviceRole"> = {},
    ) =>
      client.request<ResponseBody>(path, {
        ...options,
        serviceRole: true,
      }),
  };
};

export const hasAuthSession = async () => {
  const cookieStore = await cookies();

  return Boolean(cookieStore.get(AUTH_ACCESS_COOKIE)?.value);
};

export const getCurrentSession =
  async (): Promise<CurrentSupabaseSession | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (!accessToken && refreshToken) {
    return getCurrentSessionAfterRefresh(refreshToken);
  }

  try {
    const client = createServerSupabaseClient();
    const response = await client.request<SupabaseUser>("/auth/v1/user", {
      accessToken,
    });

    return accessToken ? { accessToken, user: response } : null;
  } catch {
    if (refreshToken) {
      return getCurrentSessionAfterRefresh(refreshToken);
    }

    return null;
  }
};

export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  const session = await getCurrentSession();

  return session?.user ?? null;
};

const getCurrentSessionAfterRefresh = async (
  refreshToken: string,
): Promise<CurrentSupabaseSession | null> => {
  try {
    const authResponse = await refreshSupabaseAuthSession(refreshToken);
    await saveAuthSession(authResponse);

    if (!authResponse.access_token) {
      return null;
    }

    const client = createServerSupabaseClient();
    const user = await client.request<SupabaseUser>("/auth/v1/user", {
      accessToken: authResponse.access_token,
    });

    return { accessToken: authResponse.access_token, user };
  } catch {
    await clearAuthSession();

    return null;
  }
};

export const saveAuthSession = async (authResponse: SupabaseAuthResponse) => {
  if (!authResponse.access_token || !authResponse.refresh_token) {
    throw new Error("A resposta de autenticação não retornou uma sessão válida.");
  }

  const cookieStore = await cookies();
  const cookieOptions = getAuthCookieOptions();

  cookieStore.set(AUTH_ACCESS_COOKIE, authResponse.access_token, cookieOptions);
  cookieStore.set(
    AUTH_REFRESH_COOKIE,
    authResponse.refresh_token,
    cookieOptions,
  );
};

export const clearAuthSession = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_ACCESS_COOKIE);
  cookieStore.delete(AUTH_REFRESH_COOKIE);
};
