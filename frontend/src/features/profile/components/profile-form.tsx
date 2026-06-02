"use client";

import { useActionState } from "react";
import { Alert } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import type { ProfileFormState } from "../lib/profile-update";
import type { ProfileFormValues } from "../lib/profile-validation";

interface ProfileFormProps {
  readonly action: (
    previousState: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  readonly initialValues: ProfileFormValues;
}

const SEX_OPTIONS = [
  { label: "Selecione", value: "" },
  { label: "Feminino", value: "female" },
  { label: "Masculino", value: "male" },
  { label: "Outro", value: "other" },
  { label: "Prefiro não informar", value: "prefer_not_to_say" },
] as const;

const getInputClassName = (hasError: boolean) =>
  [
    "min-h-11 rounded-md border bg-canvas px-4 py-3 text-base text-ink shadow-sm transition placeholder:text-muted",
    hasError ? "border-error" : "border-hairline focus:border-primary-active",
  ].join(" ");

const getTextareaClassName = (hasError: boolean) =>
  [
    "min-h-32 resize-y rounded-md border bg-canvas px-4 py-3 text-base leading-7 text-ink shadow-sm transition placeholder:text-muted",
    hasError ? "border-error" : "border-hairline focus:border-primary-active",
  ].join(" ");

export function ProfileForm({ action, initialValues }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    values: initialValues,
  });
  const values = state.values ?? initialValues;
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-body-strong">
          <span>Nome completo</span>
          <input
            aria-describedby={
              fieldErrors.fullName ? "profile-full-name-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.fullName)}
            autoComplete="name"
            className={getInputClassName(Boolean(fieldErrors.fullName))}
            defaultValue={values.fullName}
            name="fullName"
            placeholder="Seu nome"
            type="text"
          />
          {fieldErrors.fullName ? (
            <span className="text-sm text-error" id="profile-full-name-error">
              {fieldErrors.fullName}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-medium text-body-strong">
          <span>Sexo</span>
          <select
            aria-describedby={fieldErrors.sex ? "profile-sex-error" : undefined}
            aria-invalid={Boolean(fieldErrors.sex)}
            className={getInputClassName(Boolean(fieldErrors.sex))}
            defaultValue={values.sex}
            name="sex"
          >
            {SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.sex ? (
            <span className="text-sm text-error" id="profile-sex-error">
              {fieldErrors.sex}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-medium text-body-strong">
          <span>Data de nascimento</span>
          <input
            aria-describedby={
              fieldErrors.birthDate ? "profile-birth-date-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.birthDate)}
            className={getInputClassName(Boolean(fieldErrors.birthDate))}
            defaultValue={values.birthDate}
            name="birthDate"
            type="date"
          />
          {fieldErrors.birthDate ? (
            <span className="text-sm text-error" id="profile-birth-date-error">
              {fieldErrors.birthDate}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-medium text-body-strong">
          <span>Altura em cm</span>
          <input
            aria-describedby={
              fieldErrors.heightCm ? "profile-height-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.heightCm)}
            className={getInputClassName(Boolean(fieldErrors.heightCm))}
            defaultValue={values.heightCm}
            inputMode="decimal"
            name="heightCm"
            placeholder="Ex.: 172"
            type="text"
          />
          {fieldErrors.heightCm ? (
            <span className="text-sm text-error" id="profile-height-error">
              {fieldErrors.heightCm}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-medium text-body-strong">
          <span>Peso de referência em kg</span>
          <input
            aria-describedby={
              fieldErrors.referenceWeightKg
                ? "profile-reference-weight-error"
                : undefined
            }
            aria-invalid={Boolean(fieldErrors.referenceWeightKg)}
            className={getInputClassName(Boolean(fieldErrors.referenceWeightKg))}
            defaultValue={values.referenceWeightKg}
            inputMode="decimal"
            name="referenceWeightKg"
            placeholder="Ex.: 73,5"
            type="text"
          />
          {fieldErrors.referenceWeightKg ? (
            <span
              className="text-sm text-error"
              id="profile-reference-weight-error"
            >
              {fieldErrors.referenceWeightKg}
            </span>
          ) : null}
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-body-strong">
        <span>Objetivo físico</span>
        <textarea
          aria-describedby={
            fieldErrors.fitnessGoal
              ? "profile-fitness-goal-error"
              : "profile-fitness-goal-help"
          }
          aria-invalid={Boolean(fieldErrors.fitnessGoal)}
          className={getTextareaClassName(Boolean(fieldErrors.fitnessGoal))}
          defaultValue={values.fitnessGoal}
          name="fitnessGoal"
          placeholder="Ex.: acompanhar recomposição corporal, manter peso ou ganhar massa muscular."
        />
        {fieldErrors.fitnessGoal ? (
          <span className="text-sm text-error" id="profile-fitness-goal-error">
            {fieldErrors.fitnessGoal}
          </span>
        ) : (
          <span
            className="text-sm leading-6 text-muted"
            id="profile-fitness-goal-help"
          >
            Use este campo apenas como contexto informativo para sua evolução.
          </span>
        )}
      </label>

      <div className="flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted">
          Seus dados ficam vinculados somente à sua conta autenticada.
        </p>
        <Button disabled={isPending} type="submit">
          {isPending ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>
    </form>
  );
}
