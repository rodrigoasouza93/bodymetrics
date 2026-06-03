import { describe, expect, it } from "vitest";
import type { ExamComparison } from "@/src/features/exams/lib/comparison";
import {
  generateExamInsights,
  PROFESSIONAL_EVALUATION_DISCLAIMER,
} from "./exam-insights.ts";

describe("exam insights", () => {
  it("generates informational insights with the professional disclaimer", () => {
    const comparison: ExamComparison = {
      currentExamId: "current",
      deltas: [
        {
          absolute: -2,
          current: 78,
          metric: "weightKg",
          percent: -2.5,
          previous: 80,
        },
        {
          absolute: 1.2,
          current: 33.2,
          metric: "skeletalMuscleMassKg",
          percent: 3.75,
          previous: 32,
        },
      ],
      previousExamId: "previous",
    };

    const insights = generateExamInsights(comparison);

    expect(insights).toEqual([
      {
        disclaimer: PROFESSIONAL_EVALUATION_DISCLAIMER,
        metric: "weightKg",
        text: "Seu peso reduziu 2 kg (2,5%) em relação ao exame anterior.",
      },
      {
        disclaimer: PROFESSIONAL_EVALUATION_DISCLAIMER,
        metric: "skeletalMuscleMassKg",
        text: "Sua massa muscular esquelética aumentou 1,2 kg (3,75%) em relação ao exame anterior.",
      },
    ]);
  });

  it("does not generate guidance when comparison is unavailable or unchanged", () => {
    expect(generateExamInsights(null)).toEqual([]);
    expect(
      generateExamInsights({
        currentExamId: "current",
        deltas: [
          {
            absolute: 0,
            current: 80,
            metric: "weightKg",
            percent: 0,
            previous: 80,
          },
        ],
        previousExamId: "previous",
      }),
    ).toEqual([]);
  });
});
