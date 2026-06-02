import { describe, expect, it } from "vitest";
import { validateCredentials } from "./auth-validation.ts";

describe("validateCredentials", () => {
  it("returns an error when email or password is missing", () => {
    expect(validateCredentials("", "")).toBe("Informe email e senha.");
  });

  it("returns an error when email is invalid", () => {
    expect(validateCredentials("invalid", "secret1")).toBe("Informe um email válido.");
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
