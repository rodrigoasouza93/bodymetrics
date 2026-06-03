import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "./cookies.ts";
import type { SupabaseAuthResponse } from "./types.ts";

const {
  clearCookieValue,
  cookiesMock,
  deleteCookieMock,
  refreshSessionMock,
  requestMock,
  setCookieMock,
  setCookieValue,
} = vi.hoisted(() => {
  const cookieValues = new Map<string, string>();
  const setCookieMock = vi.fn((name: string, value: string) => {
    cookieValues.set(name, value);
  });
  const deleteCookieMock = vi.fn((name: string) => {
    cookieValues.delete(name);
  });

  return {
    clearCookieValue: (name: string) => {
      cookieValues.delete(name);
    },
    cookiesMock: vi.fn(async () => ({
      delete: deleteCookieMock,
      get: (name: string) => {
        const value = cookieValues.get(name);

        return value ? { value } : undefined;
      },
      set: setCookieMock,
    })),
    deleteCookieMock,
    refreshSessionMock: vi.fn(),
    requestMock: vi.fn(),
    setCookieMock,
    setCookieValue: (name: string, value: string) => {
      cookieValues.set(name, value);
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("./auth-session", () => ({
  refreshSupabaseAuthSession: refreshSessionMock,
}));

vi.mock("./client", () => ({
  createSupabaseRequestClient: () => ({
    request: requestMock,
  }),
}));

const user = {
  email: "user@example.com",
  id: "user-1",
};

describe("server Supabase client", () => {
  beforeEach(() => {
    clearCookieValue(AUTH_ACCESS_COOKIE);
    clearCookieValue(AUTH_REFRESH_COOKIE);
    cookiesMock.mockClear();
    deleteCookieMock.mockClear();
    refreshSessionMock.mockReset();
    requestMock.mockReset();
    setCookieMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an admin client that uses the service role option", async () => {
    requestMock.mockResolvedValue({ ok: true });
    const { createAdminSupabaseClient } = await import("./server-client.ts");
    const client = createAdminSupabaseClient();

    await client.request("/rest/v1/profiles", { method: "GET" });

    expect(requestMock).toHaveBeenCalledWith("/rest/v1/profiles", {
      method: "GET",
      serviceRole: true,
    });
  });

  it("detects an access token cookie", async () => {
    setCookieValue(AUTH_ACCESS_COOKIE, "access-token");
    const { hasAuthSession } = await import("./server-client.ts");

    await expect(hasAuthSession()).resolves.toBe(true);
  });

  it("returns null when auth cookies are missing", async () => {
    const { getCurrentSession } = await import("./server-client.ts");

    await expect(getCurrentSession()).resolves.toBeNull();
    expect(requestMock).not.toHaveBeenCalled();
    expect(refreshSessionMock).not.toHaveBeenCalled();
  });

  it("loads the current user with the access token", async () => {
    setCookieValue(AUTH_ACCESS_COOKIE, "access-token");
    requestMock.mockResolvedValue(user);
    const { getCurrentSession } = await import("./server-client.ts");

    await expect(getCurrentSession()).resolves.toEqual({
      accessToken: "access-token",
      user,
    });
    expect(requestMock).toHaveBeenCalledWith("/auth/v1/user", {
      accessToken: "access-token",
    });
  });

  it("refreshes the session when only the refresh token exists", async () => {
    setCookieValue(AUTH_REFRESH_COOKIE, "refresh-token");
    refreshSessionMock.mockResolvedValue({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
    } satisfies SupabaseAuthResponse);
    requestMock.mockResolvedValue(user);
    const { getCurrentSession } = await import("./server-client.ts");

    await expect(getCurrentSession()).resolves.toEqual({
      accessToken: "new-access-token",
      user,
    });
    expect(refreshSessionMock).toHaveBeenCalledWith("refresh-token");
    expect(setCookieMock).toHaveBeenCalledWith(
      AUTH_ACCESS_COOKIE,
      "new-access-token",
      expect.objectContaining({ httpOnly: true }),
    );
    expect(setCookieMock).toHaveBeenCalledWith(
      AUTH_REFRESH_COOKIE,
      "new-refresh-token",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("falls back to refresh when the access token no longer loads a user", async () => {
    setCookieValue(AUTH_ACCESS_COOKIE, "stale-access-token");
    setCookieValue(AUTH_REFRESH_COOKIE, "refresh-token");
    requestMock
      .mockRejectedValueOnce(new Error("JWT expired"))
      .mockResolvedValueOnce(user);
    refreshSessionMock.mockResolvedValue({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
    } satisfies SupabaseAuthResponse);
    const { getCurrentSession } = await import("./server-client.ts");

    await expect(getCurrentSession()).resolves.toEqual({
      accessToken: "new-access-token",
      user,
    });
  });

  it("clears auth cookies when refresh fails", async () => {
    setCookieValue(AUTH_REFRESH_COOKIE, "refresh-token");
    refreshSessionMock.mockRejectedValue(new Error("Refresh failed"));
    const { getCurrentSession } = await import("./server-client.ts");

    await expect(getCurrentSession()).resolves.toBeNull();
    expect(deleteCookieMock).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE);
    expect(deleteCookieMock).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE);
  });

  it("ignores cookie mutation errors from server component reads", async () => {
    setCookieValue(AUTH_REFRESH_COOKIE, "refresh-token");
    setCookieMock.mockImplementation(() => {
      throw new Error("Cookies can only be modified in a Server Action");
    });
    refreshSessionMock.mockResolvedValue({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
    } satisfies SupabaseAuthResponse);
    requestMock.mockResolvedValue(user);
    const { getCurrentSession } = await import("./server-client.ts");

    await expect(getCurrentSession()).resolves.toEqual({
      accessToken: "new-access-token",
      user,
    });
  });

  it("rejects invalid auth responses before saving cookies", async () => {
    const { saveAuthSession } = await import("./server-client.ts");

    await expect(saveAuthSession({ access_token: "token" })).rejects.toThrow(
      "A resposta de autenticação não retornou uma sessão válida.",
    );
    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("clears the current auth session cookies", async () => {
    const { clearAuthSession } = await import("./server-client.ts");

    await clearAuthSession();

    expect(deleteCookieMock).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE);
    expect(deleteCookieMock).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE);
  });
});
