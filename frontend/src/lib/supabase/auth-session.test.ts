import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { refreshSupabaseAuthSession } from "./auth-session.ts";

describe("refreshSupabaseAuthSession", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co/");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects refresh attempts when Supabase config is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    await expect(refreshSupabaseAuthSession("refresh-token")).rejects.toThrow(
      "Configuração Supabase ausente.",
    );
  });

  it("posts the refresh token to Supabase Auth", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      }),
      ok: true,
    } as Response);

    const response = await refreshSupabaseAuthSession("refresh-token");

    expect(response).toEqual({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/token?grant_type=refresh_token",
      {
        body: JSON.stringify({ refresh_token: "refresh-token" }),
        headers: {
          apikey: "publishable-key",
          Authorization: "Bearer publishable-key",
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("surfaces Supabase Auth error descriptions", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({
        error_description: "Refresh token has expired",
      }),
      ok: false,
    } as Response);

    await expect(refreshSupabaseAuthSession("expired-token")).rejects.toThrow(
      "Refresh token has expired",
    );
  });

  it("falls back to a safe error when Supabase returns invalid json", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => {
        throw new Error("Invalid JSON");
      },
      ok: false,
    } as unknown as Response);

    await expect(refreshSupabaseAuthSession("expired-token")).rejects.toThrow(
      "Não foi possível renovar a sessão.",
    );
  });
});
