// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BodyCompositionExam } from "../lib/exam-types";
import { ExamHistoryPanel } from "./exam-history-panel";

vi.mock("../actions/exam-actions", () => ({
  updateExam: vi.fn(),
}));

vi.mock("./exam-delete-form", () => ({
  ExamDeleteButton: ({ examId }: { readonly examId: string }) => (
    <button type="button">Excluir {examId}</button>
  ),
}));

const exam: BodyCompositionExam = {
  basalMetabolicRateKcal: 1680,
  bmi: 24.1,
  bodyFatMassKg: 18,
  bodyFatPercentage: 22.5,
  createdAt: "2026-06-02T00:00:00.000Z",
  examPerformedAt: "2026-06-02T00:00:00.000Z",
  fatControlKg: -2,
  fatFreeMassKg: 60,
  id: "exam-1",
  idealWeightKg: 76,
  inbodyScore: 82,
  mineralsKg: 3.2,
  muscleControlKg: 1,
  obesityDegreePercentage: 105,
  proteinKg: 11,
  reviewedPayload: { source: "review" },
  segmentalAnalyses: [],
  skeletalMuscleMassKg: 33,
  totalBodyWaterL: 44,
  updatedAt: "2026-06-02T00:00:00.000Z",
  uploadId: "upload-1",
  userId: "user-1",
  visceralFatLevel: 7,
  waistHipRatio: 0.82,
  weightControlKg: -1,
  weightKg: 78,
};

describe("ExamHistoryPanel", () => {
  it("renders an empty history state", () => {
    render(<ExamHistoryPanel exams={[]} />);

    expect(screen.getByText("Nenhum exame confirmado ainda.")).toBeVisible();
    expect(screen.getByText(/Envie um exame/)).toBeVisible();
  });

  it("renders confirmed exam details and edit form fields", () => {
    render(<ExamHistoryPanel exams={[exam]} />);

    expect(screen.getByText("Exames confirmados em ordem cronológica.")).toBeVisible();
    expect(screen.getByText(/Peso 78 kg/)).toBeVisible();
    expect(screen.getByText(/Gordura 22.5 %/)).toBeVisible();
    fireEvent.click(screen.getByText("Ver detalhe e editar"));

    expect(screen.getByDisplayValue("78")).toHaveAttribute("name", "weightKg");
    expect(screen.getByDisplayValue(JSON.stringify({ source: "review" }))).toHaveAttribute(
      "name",
      "reviewedPayload",
    );
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toHaveAttribute(
      "form",
      "exam-edit-exam-1",
    );
    expect(screen.getByRole("button", { name: "Excluir exam-1" })).toBeVisible();
  });
});
