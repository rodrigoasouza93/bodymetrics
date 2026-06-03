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
import { PasswordResetForm } from "./password-reset-form";

const renderPasswordResetForm = ({
  action,
  mode,
}: {
  readonly action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  readonly mode: "request" | "update";
}) => render(<PasswordResetForm action={action} mode={mode} />);

describe("PasswordResetForm", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it("renders the email request state", () => {
    renderPasswordResetForm({
      action: async () => ({}),
      mode: "request",
    });

    expect(screen.getByRole("heading", { name: "Recuperar senha" })).toBeVisible();
    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(screen.getByRole("button", { name: "Enviar link" })).toBeVisible();
  });

  it("renders the password update state", () => {
    renderPasswordResetForm({
      action: async () => ({}),
      mode: "update",
    });

    expect(
      screen.getByRole("heading", { name: "Definir nova senha" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Nova senha")).toHaveAttribute(
      "name",
      "password",
    );
    expect(
      screen.getByRole("button", { name: "Salvar nova senha" }),
    ).toBeVisible();
  });

  it("shows action feedback after submit", async () => {
    renderPasswordResetForm({
      action: async () => ({ success: "Email enviado." }),
      mode: "request",
    });

    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByText("Email enviado.")).toBeVisible();
  });

  it("disables the submit button while the action is pending", async () => {
    let resolveAction: (state: AuthFormState) => void = () => undefined;
    const action = async () =>
      new Promise<AuthFormState>((resolve) => {
        resolveAction = resolve;
      });

    renderPasswordResetForm({ action, mode: "update" });

    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Processando..." }),
      ).toBeDisabled();
    });

    resolveAction({ success: "Senha atualizada." });

    expect(await screen.findByText("Senha atualizada.")).toBeVisible();
  });
});
