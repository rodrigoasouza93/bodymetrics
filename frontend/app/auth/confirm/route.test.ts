import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  request: vi.fn(),
  saveAuthSession: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server-client", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
  saveAuthSession: mocks.saveAuthSession,
}));

const createRequest = (url: string) => new NextRequest(url);

describe("auth confirm route", () => {
  beforeEach(() => {
    mocks.createServerSupabaseClient.mockReset();
    mocks.request.mockReset();
    mocks.saveAuthSession.mockReset();
    mocks.createServerSupabaseClient.mockReturnValue({
      request: mocks.request,
    });
  });

  it("verifies a Supabase token hash, saves the session and redirects", async () => {
    const authResponse = {
      access_token: "access-token",
      refresh_token: "refresh-token",
    };
    mocks.request.mockResolvedValue(authResponse);

    const response = await GET(
      createRequest(
        "http://localhost:3000/auth/confirm?token_hash=hash&type=email",
      ),
    );

    expect(mocks.request).toHaveBeenCalledWith("/auth/v1/verify", {
      body: { token_hash: "hash", type: "email" },
      method: "POST",
    });
    expect(mocks.saveAuthSession).toHaveBeenCalledWith(authResponse);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });

  it("redirects recovery links to the password reset page", async () => {
    mocks.request.mockResolvedValue({
      access_token: "access-token",
      refresh_token: "refresh-token",
    });

    const response = await GET(
      createRequest(
        "http://localhost:3000/auth/confirm?token_hash=hash&type=recovery",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/reset-password",
    );
  });

  it("rejects invalid confirmation links", async () => {
    const response = await GET(createRequest("http://localhost:3000/auth/confirm"));

    expect(mocks.request).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?auth=invalid-link",
    );
  });
});
