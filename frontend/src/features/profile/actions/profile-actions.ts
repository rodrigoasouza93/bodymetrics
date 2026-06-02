"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  getCurrentSession,
} from "@/src/lib/supabase/server-client";
import {
  updateProfileForUser,
  type ProfileFormState,
} from "../lib/profile-update";

export const updateProfile = async (
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> => {
  const session = await getCurrentSession();
  const state = await updateProfileForUser({
    accessToken: session?.accessToken,
    client: createServerSupabaseClient(),
    formData,
    user: session?.user ?? null,
  });

  if (state.success) {
    revalidatePath("/dashboard");
  }

  return state;
};
