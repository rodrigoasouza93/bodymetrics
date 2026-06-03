import { describe, expect, it } from "vitest";
import { isProtectedRoute, shouldRequireAuthSession } from "./route-guards.ts";

describe("route guards", () => {
  it("marks dashboard routes as protected", () => {
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/dashboard/exames")).toBe(true);
    expect(isProtectedRoute("/dashboard/evolucao")).toBe(true);
    expect(isProtectedRoute("/dashboard/perfil")).toBe(true);
  });

  it("keeps auth routes public", () => {
    expect(isProtectedRoute("/login")).toBe(false);
    expect(isProtectedRoute("/sign-up")).toBe(false);
    expect(isProtectedRoute("/auth/confirm")).toBe(false);
    expect(isProtectedRoute("/auth/reset-password")).toBe(false);
  });

  it("requires auth for protected routes without an access token", () => {
    expect(
      shouldRequireAuthSession({
        hasAccessToken: false,
        pathname: "/dashboard",
      }),
    ).toBe(true);
  });

  it("allows protected routes when access token exists", () => {
    expect(
      shouldRequireAuthSession({
        hasAccessToken: true,
        pathname: "/dashboard",
      }),
    ).toBe(false);
  });
});
