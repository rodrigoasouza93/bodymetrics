import { describe, expect, it } from "vitest";
import type { SupabaseRequestOptions } from "@/src/lib/supabase/types";
import type { ProfileRow } from "@/src/types/database";
import { getProfileByUserId, saveProfileByUserId } from "./profile-repository.ts";

const profileRow: ProfileRow = {
  birth_date: "1991-03-12",
  created_at: "2026-06-01T00:00:00.000Z",
  fitness_goal: "Manter evolução",
  full_name: "User Example",
  height_cm: 180,
  id: "user-1",
  reference_weight_kg: 80,
  sex: "male",
  updated_at: "2026-06-01T00:00:00.000Z",
};

const createClient = (rows: readonly ProfileRow[]) => {
  const requests: Array<{
    readonly body: unknown;
    readonly options?: SupabaseRequestOptions;
    readonly path: string;
  }> = [];

  return {
    client: {
      request: async <ResponseBody>(
        path: string,
        options?: SupabaseRequestOptions,
      ) => {
        requests.push({ body: options?.body, options, path });

        return rows as ResponseBody;
      },
    },
    requests,
  };
};

describe("profile repository", () => {
  it("loads a profile scoped to the encoded user id", async () => {
    const { client, requests } = createClient([profileRow]);

    const profile = await getProfileByUserId({
      accessToken: "access-token",
      client,
      userId: "user/1",
    });

    expect(profile).toEqual(profileRow);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.path).toBe(
      "/rest/v1/profiles?id=eq.user%2F1&select=id,full_name,sex,birth_date,height_cm,reference_weight_kg,fitness_goal,created_at,updated_at&limit=1",
    );
    expect(requests[0]?.options).toEqual({ accessToken: "access-token" });
  });

  it("returns null when no profile exists", async () => {
    const { client } = createClient([]);

    await expect(
      getProfileByUserId({
        client,
        userId: "user-1",
      }),
    ).resolves.toBeNull();
  });

  it("saves a profile with upsert headers and mapped column names", async () => {
    const { client, requests } = createClient([profileRow]);

    const savedProfile = await saveProfileByUserId({
      accessToken: "access-token",
      client,
      profile: {
        birthDate: "1991-03-12",
        fitnessGoal: "Manter evolução",
        fullName: "User Example",
        heightCm: 180,
        referenceWeightKg: 80,
        sex: "male",
      },
      userId: "user-1",
    });

    expect(savedProfile).toEqual(profileRow);
    expect(requests[0]?.path).toBe(
      "/rest/v1/profiles?on_conflict=id&select=id,full_name,sex,birth_date,height_cm,reference_weight_kg,fitness_goal,created_at,updated_at",
    );
    expect(requests[0]?.options).toMatchObject({
      accessToken: "access-token",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      method: "POST",
    });
    expect(requests[0]?.body).toEqual({
      birth_date: "1991-03-12",
      fitness_goal: "Manter evolução",
      full_name: "User Example",
      height_cm: 180,
      id: "user-1",
      reference_weight_kg: 80,
      sex: "male",
    });
  });

  it("throws when Supabase does not return a saved profile", async () => {
    const { client } = createClient([]);

    await expect(
      saveProfileByUserId({
        client,
        profile: {
          birthDate: null,
          fitnessGoal: null,
          fullName: null,
          heightCm: null,
          referenceWeightKg: null,
          sex: null,
        },
        userId: "user-1",
      }),
    ).rejects.toThrow("Não foi possível salvar o perfil.");
  });
});
