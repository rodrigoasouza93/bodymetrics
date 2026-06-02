// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfileForm } from "./profile-form";
import type { ProfileFormState } from "../lib/profile-update";

const initialValues = {
  birthDate: "1990-04-10",
  fitnessGoal: "Acompanhar evolução",
  fullName: "User Example",
  heightCm: "172",
  referenceWeightKg: "73",
  sex: "male",
};

const createResolvedAction =
  (state: ProfileFormState) =>
  async (): Promise<ProfileFormState> =>
    state;

const createDeferredAction = () => {
  let resolveAction: (state: ProfileFormState) => void = () => undefined;
  const promise = new Promise<ProfileFormState>((resolve) => {
    resolveAction = resolve;
  });

  return {
    action: async () => promise,
    resolveAction,
  };
};

describe("ProfileForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders initial values and accessible labels", () => {
    render(
      <ProfileForm
        action={createResolvedAction({ success: "Perfil atualizado com sucesso." })}
        initialValues={initialValues}
      />,
    );

    expect(screen.getByLabelText("Nome completo")).toHaveValue("User Example");
    expect(screen.getByLabelText("Sexo")).toHaveValue("male");
    expect(screen.getByLabelText("Data de nascimento")).toHaveValue("1990-04-10");
    expect(screen.getByLabelText("Altura em cm")).toHaveValue("172");
    expect(screen.getByLabelText("Peso de referência em kg")).toHaveValue("73");
    expect(
      screen.getByPlaceholderText(
        "Ex.: acompanhar recomposição corporal, manter peso ou ganhar massa muscular.",
      ),
    ).toHaveValue(
      "Acompanhar evolução",
    );
  });

  it("shows field errors with aria metadata after submit", async () => {
    render(
      <ProfileForm
        action={createResolvedAction({
          error: "Revise os campos destacados antes de salvar.",
          fieldErrors: {
            heightCm: "Informe uma altura entre 30 cm e 300 cm.",
          },
          values: {
            ...initialValues,
            heightCm: "900",
          },
        })}
        initialValues={initialValues}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));

    const heightField = await screen.findByLabelText("Altura em cm");

    expect(heightField).toHaveAttribute("aria-invalid", "true");
    expect(heightField).toHaveAttribute("aria-describedby", "profile-height-error");
    expect(
      screen.getByText("Informe uma altura entre 30 cm e 300 cm."),
    ).toBeVisible();
  });

  it("disables the submit button while saving", async () => {
    const deferred = createDeferredAction();

    render(<ProfileForm action={deferred.action} initialValues={initialValues} />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
    });

    deferred.resolveAction({
      success: "Perfil atualizado com sucesso.",
      values: initialValues,
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Salvar perfil" })).toBeEnabled();
    });
  });
});
