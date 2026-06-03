// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "./dashboard-shell";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathname,
}));

vi.mock("@/src/features/auth/actions/auth-actions", () => ({
  signOut: mocks.signOut,
}));

describe("DashboardShell", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mocks.signOut.mockReset();
    mocks.usePathname.mockReset();
    mocks.usePathname.mockReturnValue("/dashboard/exames");
  });

  it("renders navigation, user email and active section state", () => {
    render(
      <DashboardShell userEmail="user@example.com">
        <p>Dashboard content</p>
      </DashboardShell>,
    );

    expect(screen.getByText("user@example.com")).toBeVisible();
    expect(screen.getByText("Dashboard content")).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Seções do painel" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Exames" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("wires the sign out action to the form", () => {
    render(
      <DashboardShell userEmail="user@example.com">
        <p>Dashboard content</p>
      </DashboardShell>,
    );

    expect(document.querySelector("form")?.getAttribute("action")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sair" })).toBeVisible();
  });
});
