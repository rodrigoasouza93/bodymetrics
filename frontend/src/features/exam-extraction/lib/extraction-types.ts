import type { Json } from "@/src/types/database";
import type { BodyCompositionExamInput } from "@/src/features/exams/lib/exam-types";

export type FieldIssueSeverity = "error" | "warning";

export type FieldIssueCode =
  | "invalid_format"
  | "low_confidence"
  | "missing_required"
  | "out_of_range";

export type ExtractedExamFieldName =
  | keyof BodyCompositionExamInput
  | `segmentalAnalyses.${number}.${string}`;

export interface FieldIssue {
  readonly code: FieldIssueCode;
  readonly field: ExtractedExamFieldName;
  readonly message: string;
  readonly severity: FieldIssueSeverity;
}

export interface ExtractedField<TValue> {
  readonly confidence: number | null;
  readonly rawValue: string | null;
  readonly value: TValue | null;
}

export type ExtractedExamFields = {
  readonly [Key in keyof BodyCompositionExamInput]: ExtractedField<
    BodyCompositionExamInput[Key]
  >;
};

export interface ExtractExamInput {
  readonly fileBuffer: Buffer;
  readonly mimeType: "application/pdf" | "image/jpeg" | "image/png";
  readonly originalFilename: string;
  readonly storagePath?: string;
}

export interface ExtractExamResult {
  readonly fieldIssues: readonly FieldIssue[];
  readonly fields: ExtractedExamFields;
  readonly overallConfidence: number;
  readonly rawProviderPayload: Json;
}

export interface ExamExtractionService {
  extractExam(input: ExtractExamInput): Promise<ExtractExamResult>;
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export const createExtractedField = <TValue>({
  confidence = null,
  rawValue = null,
  value,
}: {
  readonly confidence?: number | null;
  readonly rawValue?: string | null;
  readonly value: TValue | null;
}): ExtractedField<TValue> => ({
  confidence,
  rawValue,
  value,
});

export const getExtractionFieldIssues = (
  fields: ExtractedExamFields,
): readonly FieldIssue[] =>
  Object.entries(fields).flatMap<FieldIssue>(([field, extractedField]) => {
    const issueField = field as ExtractedExamFieldName;

    if (extractedField.value === null) {
      return [
        {
          code: "missing_required",
          field: issueField,
          message: "Campo ausente na leitura do exame.",
          severity: "warning",
        } satisfies FieldIssue,
      ];
    }

    if (
      extractedField.confidence !== null &&
      extractedField.confidence < LOW_CONFIDENCE_THRESHOLD
    ) {
      return [
        {
          code: "low_confidence",
          field: issueField,
          message: "Campo extraído com baixa confiança.",
          severity: "warning",
        } satisfies FieldIssue,
      ];
    }

    return [];
  });
