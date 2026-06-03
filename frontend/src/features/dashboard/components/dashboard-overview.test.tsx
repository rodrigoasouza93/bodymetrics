// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { DashboardContext } from "../lib/load-dashboard-context";
import { DashboardOverview } from "./dashboard-overview";

const createContext = (
  overrides: Partial<DashboardContext> = {},
): DashboardContext => ({
  examCount: 0,
  exams: [],
  hasProfile: false,
  profile: null,
  profileValues: {
    birthDate: "",
    fitnessGoal: "",
    fullName: "",
    heightCm: "",
    referenceWeightKg: "",
    sex: "",
  },
  ...overrides,
});

describe("DashboardOverview", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty dashboard guidance", () => {
    render(<DashboardOverview context={createContext()} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Acompanhe sua composição corporal",
    );
    expect(screen.getByText("Nenhum exame confirmado")).toBeVisible();
    expect(screen.getByText("Aguardando primeiro exame")).toBeVisible();
    expect(screen.getByText("Perfil ainda vazio")).toBeVisible();
  });

  it("renders completed dashboard section states", () => {
    render(
      <DashboardOverview
        context={createContext({
          examCount: 2,
          hasProfile: true,
        })}
      />,
    );

    expect(screen.getByText("2 exames confirmados")).toBeVisible();
    expect(screen.getByText("Gráficos e comparações disponíveis")).toBeVisible();
    expect(screen.getByText("Perfil preenchido")).toBeVisible();
    expect(screen.getAllByRole("link", { name: /Exames/ })[0]).toHaveAttribute(
      "href",
      "/dashboard/exames",
    );
  });
});
