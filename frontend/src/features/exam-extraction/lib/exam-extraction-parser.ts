import type { Json } from "@/src/types/database";
import type { BodyCompositionExamInput } from "@/src/features/exams/lib/exam-types";
import {
  createExtractedField,
  getExtractionFieldIssues,
  type ExtractedExamFields,
  type ExtractExamResult,
} from "./extraction-types";
import {
  normalizeDecimalNumber,
  normalizeExamDate,
  normalizeIntegerNumber,
  normalizePercentage,
} from "./normalizers";

export interface ProviderField {
  readonly confidence?: number | null;
  readonly rawValue?: string | null;
  readonly value?: number | string | null;
}

export interface ProviderSegmentalAnalysis {
  readonly fatMassKg?: ProviderField;
  readonly fatMassPercentage?: ProviderField;
  readonly leanMassKg?: ProviderField;
  readonly leanMassPercentage?: ProviderField;
  readonly segment?: string;
}

export interface ProviderExtractionPayload {
  readonly fields?: Partial<Record<keyof BodyCompositionExamInput, ProviderField>>;
  readonly segmentalAnalyses?: readonly ProviderSegmentalAnalysis[];
}

const REQUIRED_FIELD_KEYS = [
  "basalMetabolicRateKcal",
  "bmi",
  "bodyFatMassKg",
  "bodyFatPercentage",
  "examPerformedAt",
  "fatControlKg",
  "fatFreeMassKg",
  "idealWeightKg",
  "inbodyScore",
  "mineralsKg",
  "muscleControlKg",
  "obesityDegreePercentage",
  "proteinKg",
  "skeletalMuscleMassKg",
  "totalBodyWaterL",
  "visceralFatLevel",
  "waistHipRatio",
  "weightControlKg",
  "weightKg",
] as const satisfies readonly (keyof Omit<
  BodyCompositionExamInput,
  "segmentalAnalyses"
>)[];

export const parseProviderExtractionPayload = (
  payload: ProviderExtractionPayload,
): ExtractExamResult => {
  const fields = createFieldsFromProviderPayload(payload);
  const segmentalAnalyses = parseSegmentalAnalyses(payload.segmentalAnalyses);
  const completeFields: ExtractedExamFields = {
    ...fields,
    segmentalAnalyses: createExtractedField({
      confidence: calculateSegmentalConfidence(payload.segmentalAnalyses),
      rawValue: JSON.stringify(payload.segmentalAnalyses ?? []),
      value: segmentalAnalyses,
    }),
  };

  return {
    fieldIssues: getExtractionFieldIssues(completeFields),
    fields: completeFields,
    overallConfidence: calculateOverallConfidence(completeFields),
    rawProviderPayload: payload as Json,
  };
};

const createFieldsFromProviderPayload = (
  payload: ProviderExtractionPayload,
) =>
  Object.fromEntries(
    REQUIRED_FIELD_KEYS.map((field) => [
      field,
      createExtractedField({
        confidence: normalizeConfidence(payload.fields?.[field]?.confidence),
        rawValue: payload.fields?.[field]?.rawValue ?? null,
        value: normalizeFieldValue(field, payload.fields?.[field]?.value ?? null),
      }),
    ]),
  ) as Omit<ExtractedExamFields, "segmentalAnalyses">;

const normalizeFieldValue = (
  field: (typeof REQUIRED_FIELD_KEYS)[number],
  value: number | string | null,
) => {
  if (field === "examPerformedAt") {
    return normalizeExamDate(typeof value === "string" ? value : null);
  }

  if (
    field === "basalMetabolicRateKcal" ||
    field === "inbodyScore" ||
    field === "visceralFatLevel"
  ) {
    return normalizeIntegerNumber(value);
  }

  if (field === "bodyFatPercentage" || field === "obesityDegreePercentage") {
    return normalizePercentage(value);
  }

  return normalizeDecimalNumber(value);
};

const parseSegmentalAnalyses = (
  analyses: readonly ProviderSegmentalAnalysis[] | undefined,
) =>
  (analyses ?? []).flatMap((analysis) => {
    if (!isExamSegment(analysis.segment)) {
      return [];
    }

    return [
      {
        fatMassKg: normalizeDecimalNumber(analysis.fatMassKg?.value ?? null),
        fatMassPercentage: normalizePercentage(
          analysis.fatMassPercentage?.value ?? null,
        ),
        leanMassKg: normalizeDecimalNumber(analysis.leanMassKg?.value ?? null),
        leanMassPercentage: normalizePercentage(
          analysis.leanMassPercentage?.value ?? null,
        ),
        segment: analysis.segment,
      },
    ];
  });

const calculateOverallConfidence = (fields: ExtractedExamFields) => {
  const confidences = Object.entries(fields).flatMap(([fieldName, field]) => {
    if (field.value === null) {
      return [];
    }

    if (fieldName === "segmentalAnalyses") {
      const analyses = field.value;

      if (
        analyses.length === 0 ||
        !analyses.some(
          (analysis) =>
            analysis.fatMassKg !== null ||
            analysis.fatMassPercentage !== null ||
            analysis.leanMassKg !== null ||
            analysis.leanMassPercentage !== null,
        )
      ) {
        return [];
      }
    }

    return field.confidence === null ? [] : [field.confidence];
  });

  if (confidences.length === 0) {
    return 0;
  }

  return roundConfidence(
    confidences.reduce((sum, confidence) => sum + confidence, 0) /
      confidences.length,
  );
};

const calculateSegmentalConfidence = (
  analyses: readonly ProviderSegmentalAnalysis[] | undefined,
) => {
  const confidences = (analyses ?? []).flatMap((analysis) =>
    [
      { confidence: analysis.fatMassKg?.confidence, value: analysis.fatMassKg?.value },
      {
        confidence: analysis.fatMassPercentage?.confidence,
        value: analysis.fatMassPercentage?.value,
      },
      { confidence: analysis.leanMassKg?.confidence, value: analysis.leanMassKg?.value },
      {
        confidence: analysis.leanMassPercentage?.confidence,
        value: analysis.leanMassPercentage?.value,
      },
    ]
      .filter(
        (entry): entry is { confidence: number; value: number | string } =>
          typeof entry.confidence === "number" && entry.value != null,
      )
      .map((entry) => entry.confidence),
  );

  if (confidences.length === 0) {
    return null;
  }

  return roundConfidence(
    confidences.reduce((sum, confidence) => sum + confidence, 0) /
      confidences.length,
  );
};

const normalizeConfidence = (confidence: number | null | undefined) => {
  if (typeof confidence !== "number" || !Number.isFinite(confidence)) {
    return null;
  }

  return Math.min(1, Math.max(0, roundConfidence(confidence)));
};

const roundConfidence = (confidence: number) =>
  Math.round(confidence * 100) / 100;

const isExamSegment = (
  segment: string | undefined,
): segment is import("@/src/features/exams/lib/exam-types").SegmentalAnalysisInput["segment"] =>
  segment === "left_arm" ||
  segment === "right_arm" ||
  segment === "trunk" ||
  segment === "left_leg" ||
  segment === "right_leg";
