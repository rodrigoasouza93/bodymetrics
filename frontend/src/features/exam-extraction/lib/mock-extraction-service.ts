import type { Json } from "@/src/types/database";
import type { BodyCompositionExamInput } from "@/src/features/exams/lib/exam-types";
import {
  createExtractedField,
  getExtractionFieldIssues,
  type ExamExtractionService,
  type ExtractedExamFields,
} from "./extraction-types";

const BASE_FIXTURE: BodyCompositionExamInput = {
  basalMetabolicRateKcal: 1680,
  bmi: 24.1,
  bodyFatMassKg: 18,
  bodyFatPercentage: 22.5,
  examPerformedAt: "2026-02-01T00:00:00.000Z",
  fatControlKg: -2,
  fatFreeMassKg: 60,
  idealWeightKg: 76,
  inbodyScore: 82,
  mineralsKg: 3.2,
  muscleControlKg: 1,
  obesityDegreePercentage: 105,
  proteinKg: 11,
  segmentalAnalyses: [
    {
      fatMassKg: 1.2,
      fatMassPercentage: 80,
      leanMassKg: 3.4,
      leanMassPercentage: 102,
      segment: "left_arm",
    },
  ],
  skeletalMuscleMassKg: 33,
  totalBodyWaterL: 44,
  visceralFatLevel: 7,
  waistHipRatio: 0.82,
  weightControlKg: -1,
  weightKg: 78,
};

export const createMockExamExtractionService = (): ExamExtractionService => ({
  extractExam: async (input) => {
    if (input.originalFilename.includes("fail")) {
      throw new Error("Mock extraction failed.");
    }

    const confidence = input.originalFilename.includes("low-confidence")
      ? 0.45
      : 0.92;
    const fields = createExtractedExamFields({
      confidence,
      fixture: BASE_FIXTURE,
    });

    return {
      fieldIssues: getExtractionFieldIssues(fields),
      fields,
      overallConfidence: confidence,
      rawProviderPayload: {
        fixture: "mock-exam-extraction",
        mimeType: input.mimeType,
      },
    };
  },
});

const createExtractedExamFields = ({
  confidence,
  fixture,
}: {
  readonly confidence: number;
  readonly fixture: BodyCompositionExamInput;
}): ExtractedExamFields =>
  Object.fromEntries(
    Object.entries(fixture).map(([field, value]) => [
      field,
      createExtractedField({
        confidence,
        rawValue: value === null ? null : JSON.stringify(value),
        value,
      }),
    ]),
  ) as ExtractedExamFields;

export const serializeExtractionPayload = ({
  fieldIssues,
  fields,
  overallConfidence,
  rawProviderPayload,
}: Awaited<ReturnType<ExamExtractionService["extractExam"]>>): Json => {
  const payload = {
    fieldIssues,
    fields,
    overallConfidence,
    rawProviderPayload,
  };

  return JSON.parse(JSON.stringify(payload)) as Json;
};
