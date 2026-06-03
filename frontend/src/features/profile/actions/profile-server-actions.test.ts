import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  getCurrentSession: vi.fn(),
  revalidatePath: vi.fn(),
  updateProfileForUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/src/lib/supabase/server-client", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
  getCurrentSession: mocks.getCurrentSession,
}));

vi.mock("../lib/profile-update", () => ({
  updateProfileForUser: mocks.updateProfileForUser,
}));

const client = { request: vi.fn() };
const session = {
  accessToken: "access-token",
  user: {
    email: "user@example.com",
    id: "user-1",
  },
};

describe("profile action", () => {
  beforeEach(() => {
    vi.resetModules();
    client.request.mockReset();
    mocks.createServerSupabaseClient.mockReset();
    mocks.getCurrentSession.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.updateProfileForUser.mockReset();
    mocks.createServerSupabaseClient.mockReturnValue(client);
  });

  it("updates the current user's profile and revalidates the dashboard", async () => {
    const formData = new FormData();
    mocks.getCurrentSession.mockResolvedValue(session);
    mocks.updateProfileForUser.mockResolvedValue({
      success: "Perfil atualizado com sucesso.",
    });
    const { updateProfile } = await import("./profile-actions.ts");

    const state = await updateProfile({}, formData);

    expect(state).toEqual({ success: "Perfil atualizado com sucesso." });
    expect(mocks.updateProfileForUser).toHaveBeenCalledWith({
      accessToken: "access-token",
      client,
      formData,
      user: session.user,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("passes an unauthenticated user through without revalidating", async () => {
    const formData = new FormData();
    mocks.getCurrentSession.mockResolvedValue(null);
    mocks.updateProfileForUser.mockResolvedValue({
      error: "Entre na conta novamente para editar seu perfil.",
    });
    const { updateProfile } = await import("./profile-actions.ts");

    const state = await updateProfile({}, formData);

    expect(state).toEqual({
      error: "Entre na conta novamente para editar seu perfil.",
    });
    expect(mocks.updateProfileForUser).toHaveBeenCalledWith({
      accessToken: undefined,
      client,
      formData,
      user: null,
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("does not revalidate when the update returns a validation error", async () => {
    mocks.getCurrentSession.mockResolvedValue(session);
    mocks.updateProfileForUser.mockResolvedValue({
      error: "Revise os campos destacados antes de salvar.",
    });
    const { updateProfile } = await import("./profile-actions.ts");

    await updateProfile({}, new FormData());

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
