import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearAuthSession: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn(),
  request: vi.fn(),
  saveAuthSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/src/lib/supabase/server-client", () => ({
  clearAuthSession: mocks.clearAuthSession,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
  saveAuthSession: mocks.saveAuthSession,
}));

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
};

const createSessionResponse = () => ({
  access_token: "access-token",
  expires_in: 3600,
  refresh_token: "refresh-token",
  token_type: "bearer",
  user: {
    email: "user@example.com",
    id: "user-id",
  },
});

describe("auth actions", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.clearAuthSession.mockReset();
    mocks.createServerSupabaseClient.mockReset();
    mocks.redirect.mockReset();
    mocks.request.mockReset();
    mocks.saveAuthSession.mockReset();
    mocks.createServerSupabaseClient.mockReturnValue({
      request: mocks.request,
    });
  });

  it("signs in, saves the session and redirects to the dashboard", async () => {
    mocks.request.mockResolvedValue(createSessionResponse());

    const { signInWithEmail } = await import("./auth-actions.ts");

    await signInWithEmail(
      {},
      createFormData({
        email: "user@example.com",
        password: "secret1",
      }),
    );

    expect(mocks.request).toHaveBeenCalledWith(
      "/auth/v1/token?grant_type=password",
      {
        body: { email: "user@example.com", password: "secret1" },
        method: "POST",
      },
    );
    expect(mocks.saveAuthSession).toHaveBeenCalledWith(createSessionResponse());
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a validation error before calling Supabase", async () => {
    const { signInWithEmail } = await import("./auth-actions.ts");

    const result = await signInWithEmail(
      {},
      createFormData({ email: "invalid", password: "secret1" }),
    );

    expect(result).toEqual({ error: "Informe um email válido." });
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("signs up, saves the session and redirects outside the Supabase try block", async () => {
    mocks.request.mockResolvedValue(createSessionResponse());

    const { signUpWithEmail } = await import("./auth-actions.ts");

    await signUpWithEmail(
      {},
      createFormData({
        email: "user@example.com",
        password: "secret1",
      }),
    );

    expect(mocks.request).toHaveBeenCalledWith("/auth/v1/signup", {
      body: { email: "user@example.com", password: "secret1" },
      method: "POST",
    });
    expect(mocks.saveAuthSession).toHaveBeenCalledWith(createSessionResponse());
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns the confirmation message when sign-up does not create a session", async () => {
    mocks.request.mockResolvedValue({
      user: {
        email: "user@example.com",
        id: "user-id",
      },
    });

    const { signUpWithEmail } = await import("./auth-actions.ts");

    const result = await signUpWithEmail(
      {},
      createFormData({
        email: "user@example.com",
        password: "secret1",
      }),
    );

    expect(result).toEqual({
      success:
        "Cadastro criado. Confira seu email se o projeto exigir confirmação antes do login.",
    });
    expect(mocks.saveAuthSession).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("clears the session when signing out", async () => {
    const { signOut } = await import("./auth-actions.ts");

    await signOut();

    expect(mocks.clearAuthSession).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
