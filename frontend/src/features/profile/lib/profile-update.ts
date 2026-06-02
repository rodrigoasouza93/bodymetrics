import type { SupabaseUser } from "@/src/lib/supabase/types";
import {
  saveProfileByUserId,
  type ProfileRepositoryOptions,
} from "../data/profile-repository.ts";
import {
  validateProfileForm,
  type ProfileFieldName,
  type ProfileFormValues,
} from "./profile-validation.ts";

export interface ProfileFormState {
  readonly error?: string;
  readonly fieldErrors?: Partial<Record<ProfileFieldName, string>>;
  readonly success?: string;
  readonly values?: ProfileFormValues;
}

export interface UpdateProfileOptions {
  readonly accessToken?: string;
  readonly client: ProfileRepositoryOptions["client"];
  readonly formData: FormData;
  readonly user: SupabaseUser | null;
}

export const updateProfileForUser = async ({
  accessToken,
  client,
  formData,
  user,
}: UpdateProfileOptions): Promise<ProfileFormState> => {
  if (!user) {
    return {
      error: "Entre na conta novamente para editar seu perfil.",
    };
  }

  const validation = validateProfileForm(formData);

  if (!validation.profile) {
    return {
      error: "Revise os campos destacados antes de salvar.",
      fieldErrors: validation.errors,
      values: validation.values,
    };
  }

  try {
    await saveProfileByUserId({
      accessToken,
      client,
      profile: validation.profile,
      userId: user.id,
    });

    return {
      success: "Perfil atualizado com sucesso.",
      values: validation.values,
    };
  } catch {
    return {
      error: "Não foi possível salvar o perfil. Tente novamente em instantes.",
      values: validation.values,
    };
  }
};
