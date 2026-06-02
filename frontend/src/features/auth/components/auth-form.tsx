"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/text-field";
import type { AuthFormState } from "../actions/auth-actions";

interface AuthFormProps {
  readonly action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  readonly alternateHref: string;
  readonly alternateLabel: string;
  readonly buttonLabel: string;
  readonly passwordAutoComplete: "current-password" | "new-password";
  readonly title: string;
}

const initialState: AuthFormState = {};

export function AuthForm({
  action,
  alternateHref,
  alternateLabel,
  buttonLabel,
  passwordAutoComplete,
  title,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <h1 className="text-4xl font-normal leading-tight tracking-normal text-ink">
          {title}
        </h1>
        <p className="max-w-md text-base leading-7 text-body">
          Acesse seu histórico privado de exames, revise dados extraídos e
          acompanhe sua evolução física com clareza.
        </p>
      </div>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <TextField
        autoComplete="email"
        label="Email"
        name="email"
        placeholder="voce@email.com"
        type="email"
      />
      <TextField
        autoComplete={passwordAutoComplete}
        label="Senha"
        name="password"
        placeholder="No mínimo 6 caracteres"
        type="password"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button disabled={isPending} type="submit">
          {isPending ? "Processando..." : buttonLabel}
        </Button>
        <Link
          className="min-h-11 inline-flex items-center text-sm font-medium text-primary hover:text-primary-active"
          href={alternateHref}
        >
          {alternateLabel}
        </Link>
      </div>
    </form>
  );
}
