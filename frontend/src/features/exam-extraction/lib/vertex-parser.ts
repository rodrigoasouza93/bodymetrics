import type { Json } from "@/src/types/database";
import type {
  BodyCompositionExamInput,
  SegmentalAnalysisInput,
} from "@/src/features/exams/lib/exam-types";
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

interface VertexGenerateContentResponse {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly {
        readonly text?: string;
      }[];
    };
  }[];
}

interface ProviderField {
  readonly confidence?: number | null;
  readonly rawValue?: string | null;
  readonly value?: number | string | null;
}

interface ProviderSegmentalAnalysis {
  readonly fatMassKg?: ProviderField;
  readonly fatMassPercentage?: ProviderField;
  readonly leanMassKg?: ProviderField;
  readonly leanMassPercentage?: ProviderField;
  readonly segment?: string;
}

interface ProviderExtractionPayload {
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

export const parseVertexExamExtractionResponse = (
  response: VertexGenerateContentResponse,
): ExtractExamResult => {
  const responseText = getVertexResponseText(response);
  const payload = JSON.parse(responseText) as ProviderExtractionPayload;
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
  const fieldIssues = getExtractionFieldIssues(completeFields);

  return {
    fieldIssues,
    fields: completeFields,
    overallConfidence: calculateOverallConfidence(completeFields),
    rawProviderPayload: payload as Json,
  };
};

const getVertexResponseText = (response: VertexGenerateContentResponse) => {
  const text = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Vertex AI não retornou texto estruturado.");
  }

  return text;
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

  if (
    field === "bodyFatPercentage" ||
    field === "obesityDegreePercentage"
  ) {
    return normalizePercentage(value);
  }

  return normalizeDecimalNumber(value);
};

const parseSegmentalAnalyses = (
  analyses: readonly ProviderSegmentalAnalysis[] | undefined,
): readonly SegmentalAnalysisInput[] =>
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
  const confidences = Object.values(fields)
    .map((field) => field.confidence)
    .filter((confidence): confidence is number => confidence !== null);

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
  const confidences = (analyses ?? [])
    .flatMap((analysis) => [
      analysis.fatMassKg?.confidence,
      analysis.fatMassPercentage?.confidence,
      analysis.leanMassKg?.confidence,
      analysis.leanMassPercentage?.confidence,
    ])
    .filter((confidence): confidence is number => typeof confidence === "number");

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
): segment is SegmentalAnalysisInput["segment"] =>
  segment === "left_arm" ||
  segment === "right_arm" ||
  segment === "trunk" ||
  segment === "left_leg" ||
  segment === "right_leg";
