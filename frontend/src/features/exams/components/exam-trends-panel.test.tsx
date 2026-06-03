// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BodyCompositionExam } from "../lib/exam-types";
import { ExamTrendsPanel } from "./exam-trends-panel";

const createExam = (
  overrides: Partial<BodyCompositionExam>,
): BodyCompositionExam => ({
  basalMetabolicRateKcal: null,
  bmi: null,
  bodyFatMassKg: null,
  bodyFatPercentage: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  examPerformedAt: null,
  fatControlKg: null,
  fatFreeMassKg: null,
  id: "exam",
  idealWeightKg: null,
  inbodyScore: null,
  mineralsKg: null,
  muscleControlKg: null,
  obesityDegreePercentage: null,
  proteinKg: null,
  reviewedPayload: null,
  segmentalAnalyses: [],
  skeletalMuscleMassKg: null,
  totalBodyWaterL: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  uploadId: "upload",
  userId: "user",
  visceralFatLevel: null,
  waistHipRatio: null,
  weightControlKg: null,
  weightKg: null,
  ...overrides,
});

describe("ExamTrendsPanel", () => {
  it("renders chart table alternatives and informational insights", () => {
    render(
      <ExamTrendsPanel
        exams={[
          createExam({
            bodyFatMassKg: 20,
            bodyFatPercentage: 25,
            id: "previous",
            weightKg: 80,
          }),
          createExam({
            bodyFatMassKg: 18,
            bodyFatPercentage: 22,
            createdAt: "2026-02-01T00:00:00.000Z",
            id: "current",
            weightKg: 78,
          }),
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Evolução de Peso" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Peso" })).toBeTruthy();
    expect(
      screen.getByText("Seu peso reduziu 2 kg (2,5%) em relação ao exame anterior."),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Estes insights são informativos e não substituem avaliação médica, nutricional ou profissional.",
      ),
    ).toBeTruthy();
  });
});
