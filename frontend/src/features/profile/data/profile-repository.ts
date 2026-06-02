import type { ProfileRow } from "@/src/types/database";
import type { SupabaseRequestOptions } from "@/src/lib/supabase/types";
import type { ProfileInput } from "../lib/profile-validation.ts";

interface SupabaseRequestClient {
  readonly request: <ResponseBody>(
    path: string,
    options?: SupabaseRequestOptions,
  ) => Promise<ResponseBody>;
}

interface ProfileRecord {
  readonly birth_date: string | null;
  readonly fitness_goal: string | null;
  readonly full_name: string | null;
  readonly height_cm: number | null;
  readonly id: string;
  readonly reference_weight_kg: number | null;
  readonly sex: ProfileRow["sex"];
}

export interface ProfileRepositoryOptions {
  readonly accessToken?: string;
  readonly client: SupabaseRequestClient;
}

const PROFILE_SELECT =
  "id,full_name,sex,birth_date,height_cm,reference_weight_kg,fitness_goal,created_at,updated_at";

export const getProfileByUserId = async ({
  accessToken,
  client,
  userId,
}: ProfileRepositoryOptions & {
  readonly userId: string;
}) => {
  const profiles = await client.request<readonly ProfileRow[]>(
    `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=${PROFILE_SELECT}&limit=1`,
    { accessToken },
  );

  return profiles[0] ?? null;
};

export const saveProfileByUserId = async ({
  accessToken,
  client,
  profile,
  userId,
}: ProfileRepositoryOptions & {
  readonly profile: ProfileInput;
  readonly userId: string;
}) => {
  const body: ProfileRecord = {
    birth_date: profile.birthDate,
    fitness_goal: profile.fitnessGoal,
    full_name: profile.fullName,
    height_cm: profile.heightCm,
    id: userId,
    reference_weight_kg: profile.referenceWeightKg,
    sex: profile.sex,
  };

  const savedProfiles = await client.request<readonly ProfileRow[]>(
    `/rest/v1/profiles?on_conflict=id&select=${PROFILE_SELECT}`,
    {
      accessToken,
      body,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      method: "POST",
    },
  );

  const savedProfile = savedProfiles[0];

  if (!savedProfile) {
    throw new Error("Não foi possível salvar o perfil.");
  }

  return savedProfile;
};
