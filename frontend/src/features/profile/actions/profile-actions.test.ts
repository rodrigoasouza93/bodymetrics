import { describe, expect, it } from "vitest";
import type { SupabaseRequestOptions, SupabaseUser } from "@/src/lib/supabase/types";
import { updateProfileForUser } from "../lib/profile-update.ts";

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
};

const user: SupabaseUser = {
  email: "user@example.com",
  id: "user-1",
};

describe("updateProfileForUser", () => {
  it("rejects unauthenticated updates", async () => {
    const requestedPaths: string[] = [];

    const state = await updateProfileForUser({
      client: {
        request: async <ResponseBody>(path: string) => {
          requestedPaths.push(path);
          return [] as ResponseBody;
        },
      },
      formData: createFormData({}),
      user: null,
    });

    expect(state.error).toBe("Entre na conta novamente para editar seu perfil.");
    expect(requestedPaths).toEqual([]);
  });

  it("saves a valid authenticated profile through the repository", async () => {
    const requests: Array<{
      readonly body: unknown;
      readonly options?: SupabaseRequestOptions;
      readonly path: string;
    }> = [];

    const state = await updateProfileForUser({
      client: {
        request: async <ResponseBody>(
          path: string,
          options?: SupabaseRequestOptions,
        ) => {
          requests.push({ body: options?.body, options, path });
          return [
            {
              birth_date: "1991-03-12",
              created_at: "2026-06-02T12:00:00Z",
              fitness_goal: "Manter evolução",
              full_name: "User Example",
              height_cm: 180,
              id: user.id,
              reference_weight_kg: 80,
              sex: "male",
              updated_at: "2026-06-02T12:00:00Z",
            },
          ] as ResponseBody;
        },
      },
      formData: createFormData({
        birthDate: "1991-03-12",
        fitnessGoal: "Manter evolução",
        fullName: "User Example",
        heightCm: "180",
        referenceWeightKg: "80",
        sex: "male",
      }),
      user,
    });

    expect(state.success).toBe("Perfil atualizado com sucesso.");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.options?.method).toBe("POST");
    expect(requests[0]?.body).toEqual({
      birth_date: "1991-03-12",
      fitness_goal: "Manter evolução",
      full_name: "User Example",
      height_cm: 180,
      id: user.id,
      reference_weight_kg: 80,
      sex: "male",
    });
  });

  it("returns validation errors without persisting invalid data", async () => {
    const requestedPaths: string[] = [];

    const state = await updateProfileForUser({
      client: {
        request: async <ResponseBody>(path: string) => {
          requestedPaths.push(path);
          return [] as ResponseBody;
        },
      },
      formData: createFormData({ heightCm: "900" }),
      user,
    });

    expect(state.error).toBe("Revise os campos destacados antes de salvar.");
    expect(state.fieldErrors?.heightCm).toBe(
      "Informe uma altura entre 30 cm e 300 cm.",
    );
    expect(requestedPaths).toEqual([]);
  });

  it("returns a safe message when persistence fails", async () => {
    const state = await updateProfileForUser({
      client: {
        request: async () => {
          throw new Error("PostgREST leaked policy details");
        },
      },
      formData: createFormData({
        fullName: "User Example",
      }),
      user,
    });

    expect(state.error).toBe(
      "Não foi possível salvar o perfil. Tente novamente em instantes.",
    );
  });
});
