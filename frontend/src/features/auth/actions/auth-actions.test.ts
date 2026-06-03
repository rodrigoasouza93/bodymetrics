import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearAuthSession: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  getCurrentSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
  request: vi.fn(),
  saveAuthSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/src/lib/supabase/server-client", () => ({
  clearAuthSession: mocks.clearAuthSession,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
  getCurrentSession: mocks.getCurrentSession,
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
    mocks.getCurrentSession.mockReset();
    mocks.headers.mockReset();
    mocks.redirect.mockReset();
    mocks.request.mockReset();
    mocks.saveAuthSession.mockReset();
    mocks.createServerSupabaseClient.mockReturnValue({
      request: mocks.request,
    });
    mocks.headers.mockResolvedValue(
      new Headers({
        host: "localhost:3000",
        "x-forwarded-proto": "http",
      }),
    );
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

  it("requests a password reset email with the public redirect URL", async () => {
    const { requestPasswordReset } = await import("./auth-actions.ts");

    const result = await requestPasswordReset(
      {},
      createFormData({ email: "user@example.com" }),
    );

    expect(mocks.request).toHaveBeenCalledWith(
      "/auth/v1/recover?redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Freset-password",
      {
        body: { email: "user@example.com" },
        method: "POST",
      },
    );
    expect(result).toEqual({
      success:
        "Enviamos as instruções para o email informado, caso ele esteja cadastrado.",
    });
  });

  it("updates the password, clears the recovery session and redirects to login", async () => {
    mocks.getCurrentSession.mockResolvedValue({
      accessToken: "access-token",
      user: { email: "user@example.com", id: "user-id" },
    });

    const { updatePassword } = await import("./auth-actions.ts");

    await updatePassword(
      {},
      createFormData({ password: "new-secret" }),
    );

    expect(mocks.request).toHaveBeenCalledWith("/auth/v1/user", {
      accessToken: "access-token",
      body: { password: "new-secret" },
      method: "PUT",
    });
    expect(mocks.clearAuthSession).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/login?password=updated");
  });

  it("rejects password updates without a recovery session", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);

    const { updatePassword } = await import("./auth-actions.ts");

    const result = await updatePassword(
      {},
      createFormData({ password: "new-secret" }),
    );

    expect(result).toEqual({
      error:
        "Abra novamente o link de recuperação enviado por email antes de trocar a senha.",
    });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("clears the session when signing out", async () => {
    const { signOut } = await import("./auth-actions.ts");

    await signOut();

    expect(mocks.clearAuthSession).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
