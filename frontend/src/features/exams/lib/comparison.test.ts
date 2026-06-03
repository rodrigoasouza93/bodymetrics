import { describe, expect, it } from "vitest";
import {
  compareLatestExam,
  createExamTrendPoints,
} from "./comparison.ts";
import type { BodyCompositionExam } from "./exam-types";

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

describe("exam comparison", () => {
  it("calculates deltas between the latest and previous exams", () => {
    const comparison = compareLatestExam([
      createExam({
        bodyFatMassKg: 20,
        bodyFatPercentage: 25,
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "previous",
        skeletalMuscleMassKg: 32,
        weightKg: 80,
      }),
      createExam({
        bodyFatMassKg: 18,
        bodyFatPercentage: 22.5,
        createdAt: "2026-02-01T00:00:00.000Z",
        id: "current",
        skeletalMuscleMassKg: 33,
        weightKg: 78,
      }),
    ]);

    expect(comparison?.currentExamId).toBe("current");
    expect(comparison?.deltas).toEqual([
      {
        absolute: -2,
        current: 78,
        metric: "weightKg",
        percent: -2.5,
        previous: 80,
      },
      {
        absolute: 1,
        current: 33,
        metric: "skeletalMuscleMassKg",
        percent: 3.13,
        previous: 32,
      },
      {
        absolute: -2,
        current: 18,
        metric: "bodyFatMassKg",
        percent: -10,
        previous: 20,
      },
      {
        absolute: -2.5,
        current: 22.5,
        metric: "bodyFatPercentage",
        percent: -10,
        previous: 25,
      },
    ]);
  });

  it("ignores metrics that are missing in either exam", () => {
    const comparison = compareLatestExam([
      createExam({ id: "previous", weightKg: 80 }),
      createExam({ createdAt: "2026-02-01T00:00:00.000Z", id: "current" }),
    ]);

    expect(comparison?.deltas).toEqual([]);
  });

  it("returns chronological trend points with nullable metrics", () => {
    const trendPoints = createExamTrendPoints([
      createExam({
        createdAt: "2026-02-01T00:00:00.000Z",
        id: "second",
        weightKg: 78,
      }),
      createExam({
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "first",
        weightKg: null,
      }),
    ]);

    expect(trendPoints).toEqual([
      {
        bodyFatMassKg: null,
        bodyFatPercentage: null,
        date: "2026-01-01T00:00:00.000Z",
        examId: "first",
        skeletalMuscleMassKg: null,
        weightKg: null,
      },
      {
        bodyFatMassKg: null,
        bodyFatPercentage: null,
        date: "2026-02-01T00:00:00.000Z",
        examId: "second",
        skeletalMuscleMassKg: null,
        weightKg: 78,
      },
    ]);
  });
});
