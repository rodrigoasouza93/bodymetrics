import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseRequestClient } from "./client";

const originalEnv = {
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

describe("createSupabaseRequestClient", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL =
      originalEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      originalEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("surfaces the message returned by Supabase REST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () =>
          JSON.stringify({
            details: "Row-level security policy blocked the request.",
            message: "permission denied for table profiles",
          }),
      } as Response);

    const client = createSupabaseRequestClient();

    await expect(client.request("/rest/v1/profiles")).rejects.toThrow(
      "permission denied for table profiles",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/rest/v1/profiles",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Accept-Profile": "public",
          apikey: "test-key",
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("falls back to a generic message when the response is not json", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "<html>server error</html>",
    } as Response);

    const client = createSupabaseRequestClient();

    await expect(client.request("/rest/v1/profiles")).rejects.toThrow(
      "Não foi possível concluir a solicitação.",
    );
  });
});
