import { describe, expect, it } from "vitest";
import {
  validateCredentials,
  validateEmail,
  validatePassword,
} from "./auth-validation.ts";

describe("validateCredentials", () => {
  it("returns an error when email or password is missing", () => {
    expect(validateCredentials("", "")).toBe("Informe email e senha.");
  });

  it("returns an error when email is invalid", () => {
    expect(validateCredentials("invalid", "secret1")).toBe(
      "Informe um email válido.",
    );
  });

  it("returns an error when password is too short", () => {
    expect(
      validateCredentials("user@example.com", "12345"),
    ).toBe("A senha precisa ter pelo menos 6 caracteres.");
  });

  it("accepts valid credentials", () => {
    expect(validateCredentials("user@example.com", "secret1")).toBeNull();
  });
});

describe("validateEmail", () => {
  it("validates email-only forms", () => {
    expect(validateEmail("")).toBe("Informe o email.");
    expect(validateEmail("invalid")).toBe("Informe um email válido.");
    expect(validateEmail("user@example.com")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("validates password-only forms", () => {
    expect(validatePassword("")).toBe("Informe a senha.");
    expect(validatePassword("12345")).toBe(
      "A senha precisa ter pelo menos 6 caracteres.",
    );
    expect(validatePassword("secret1")).toBeNull();
  });
});
