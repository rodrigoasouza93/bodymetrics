// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthFormState } from "../actions/auth-actions";
import { AuthForm } from "./auth-form";

const renderAuthForm = (
  action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>,
  initialState?: AuthFormState,
) =>
  render(
    <AuthForm
      action={action}
      alternateHref="/sign-up"
      alternateLabel="Criar conta"
      buttonLabel="Entrar"
      initialState={initialState}
      passwordAutoComplete="current-password"
      passwordHelpHref="/auth/reset-password"
      passwordHelpLabel="Esqueci minha senha"
      title="Entrar"
    />,
  );

describe("AuthForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders credentials fields and the alternate auth link", () => {
    renderAuthForm(async () => ({}));

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeVisible();
    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(
      screen.getByRole("link", { name: "Esqueci minha senha" }),
    ).toHaveAttribute("href", "/auth/reset-password");
  });

  it("renders initial success feedback", () => {
    renderAuthForm(async () => ({}), {
      success: "Senha alterada com sucesso. Entre novamente para continuar.",
    });

    expect(
      screen.getByText(
        "Senha alterada com sucesso. Entre novamente para continuar.",
      ),
    ).toBeVisible();
  });

  it("shows action errors after submit", async () => {
    renderAuthForm(async () => ({
      error: "Informe um email válido.",
    }));

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Informe um email válido.",
    );
  });

  it("disables the submit button while the action is pending", async () => {
    let resolveAction: (state: AuthFormState) => void = () => undefined;
    const action = async () =>
      new Promise<AuthFormState>((resolve) => {
        resolveAction = resolve;
      });

    renderAuthForm(action);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Processando..." }),
      ).toBeDisabled();
    });

    resolveAction({ success: "Tudo certo." });

    expect(await screen.findByText("Tudo certo.")).toBeVisible();
  });
});
