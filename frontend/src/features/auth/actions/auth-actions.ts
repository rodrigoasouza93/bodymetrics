"use server";

import { redirect } from "next/navigation";
import {
  clearAuthSession,
  createServerSupabaseClient,
  getCurrentSession,
  saveAuthSession,
} from "@/src/lib/supabase/server-client";
import type { SupabaseAuthResponse } from "@/src/lib/supabase/types";
import { getPublicAuthRedirectUrl } from "../lib/auth-redirect-url";
import {
  validateCredentials,
  validateEmail,
  validatePassword,
} from "../lib/auth-validation";

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

export const requestPasswordReset = async (
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  const email = getRequiredString(formData, "email");
  const validationError = validateEmail(email);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const client = createServerSupabaseClient();
    const redirectUrl = await getPublicAuthRedirectUrl("/auth/reset-password");

    await client.request(
      `/auth/v1/recover?redirect_to=${encodeURIComponent(redirectUrl)}`,
      {
        body: { email },
        method: "POST",
      },
    );
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o email de recuperação.",
    };
  }

  return {
    success:
      "Enviamos as instruções para o email informado, caso ele esteja cadastrado.",
  };
};

export const updatePassword = async (
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  const password = getRequiredString(formData, "password");
  const validationError = validatePassword(password);

  if (validationError) {
    return { error: validationError };
  }

  const session = await getCurrentSession();

  if (!session) {
    return {
      error:
        "Abra novamente o link de recuperação enviado por email antes de trocar a senha.",
    };
  }

  try {
    const client = createServerSupabaseClient();

    await client.request("/auth/v1/user", {
      accessToken: session.accessToken,
      body: { password },
      method: "PUT",
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.",
    };
  }

  await clearAuthSession();
  redirect("/login?password=updated");
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
