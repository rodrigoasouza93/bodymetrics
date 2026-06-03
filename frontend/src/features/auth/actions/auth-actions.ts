"use server";

import { redirect } from "next/navigation";
import {
  clearAuthSession,
  createServerSupabaseClient,
  saveAuthSession,
} from "@/src/lib/supabase/server-client";
import type { SupabaseAuthResponse } from "@/src/lib/supabase/types";
import { validateCredentials } from "../lib/auth-validation";

export interface AuthFormState {
  readonly error?: string;
  readonly success?: string;
}

interface SignUpRedirectState {
  readonly redirectToDashboard: true;
}

const getRequiredString = (formData: FormData, fieldName: string) => {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const signInWithEmail = async (
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const client = createServerSupabaseClient();
    const response = await client.request<SupabaseAuthResponse>(
      "/auth/v1/token?grant_type=password",
      {
        body: { email, password },
        method: "POST",
      },
    );

    await saveAuthSession(response);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível entrar na conta.",
    };
  }

  redirect("/dashboard");
};

export const signUpWithEmail = async (
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const signUpState = await createSignUpAuthSession({ email, password });

  if ("redirectToDashboard" in signUpState) {
    redirect("/dashboard");
  }

  return signUpState;
};

const createSignUpAuthSession = async ({
  email,
  password,
}: {
  readonly email: string;
  readonly password: string;
}): Promise<AuthFormState | SignUpRedirectState> => {
  try {
    const client = createServerSupabaseClient();
    const response = await client.request<SupabaseAuthResponse>(
      "/auth/v1/signup",
      {
        body: { email, password },
        method: "POST",
      },
    );

    if (response.access_token && response.refresh_token) {
      await saveAuthSession(response);
      return { redirectToDashboard: true };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta.",
    };
  }

  return {
    success:
      "Cadastro criado. Confira seu email se o projeto exigir confirmação antes do login.",
  };
};

export const signOut = async () => {
  await clearAuthSession();
  redirect("/login");
};
