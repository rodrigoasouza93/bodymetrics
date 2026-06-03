"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Alert } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/text-field";
import type { AuthFormState } from "../actions/auth-actions";

interface PasswordResetFormProps {
  readonly action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  readonly mode: "request" | "update";
}

const initialState: AuthFormState = {};

export function PasswordResetForm({ action, mode }: PasswordResetFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "update" || !window.location.hash) {
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return;
    }

    const saveRecoverySession = async () => {
      const response = await fetch("/auth/reset-password/session", {
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        setSessionError("O link de recuperação é inválido ou expirou.");
        return;
      }

      window.location.replace("/auth/reset-password");
    };

    void saveRecoverySession();
  }, [mode]);

  const isUpdateMode = mode === "update";

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <h1 className="text-4xl font-normal leading-tight tracking-normal text-ink">
          {isUpdateMode ? "Definir nova senha" : "Recuperar senha"}
        </h1>
        <p className="max-w-md text-base leading-7 text-body">
          {isUpdateMode
            ? "Escolha uma nova senha para continuar acessando seu histórico com segurança."
            : "Informe seu email para receber o link de recuperação configurado no Supabase."}
        </p>
      </div>

      {sessionError ? <Alert tone="error">{sessionError}</Alert> : null}
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      {isUpdateMode ? (
        <TextField
          autoComplete="new-password"
          label="Nova senha"
          name="password"
          placeholder="No mínimo 6 caracteres"
          type="password"
        />
      ) : (
        <TextField
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="voce@email.com"
          type="email"
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button disabled={isPending} type="submit">
          {getButtonLabel({ isPending, isUpdateMode })}
        </Button>
        <Link
          className="min-h-11 inline-flex items-center text-sm font-medium text-primary hover:text-primary-active"
          href="/login"
        >
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}

const getButtonLabel = ({
  isPending,
  isUpdateMode,
}: {
  readonly isPending: boolean;
  readonly isUpdateMode: boolean;
}) => {
  if (isPending) {
    return "Processando...";
  }

  return isUpdateMode ? "Salvar nova senha" : "Enviar link";
};
