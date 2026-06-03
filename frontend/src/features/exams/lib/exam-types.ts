import type {
  BodyCompositionExamRow,
  ExamSegment,
  ExamSegmentalAnalysisRow,
  Json,
} from "@/src/types/database";

export type ExamMetricKey =
  | "bmi"
  | "bodyFatMassKg"
  | "bodyFatPercentage"
  | "fatFreeMassKg"
  | "skeletalMuscleMassKg"
  | "weightKg";

export interface BodyCompositionExamInput {
  readonly basalMetabolicRateKcal: number | null;
  readonly bmi: number | null;
  readonly bodyFatMassKg: number | null;
  readonly bodyFatPercentage: number | null;
  readonly examPerformedAt: string | null;
  readonly fatControlKg: number | null;
  readonly fatFreeMassKg: number | null;
  readonly idealWeightKg: number | null;
  readonly inbodyScore: number | null;
  readonly mineralsKg: number | null;
  readonly muscleControlKg: number | null;
  readonly obesityDegreePercentage: number | null;
  readonly proteinKg: number | null;
  readonly segmentalAnalyses: readonly SegmentalAnalysisInput[];
  readonly skeletalMuscleMassKg: number | null;
  readonly totalBodyWaterL: number | null;
  readonly visceralFatLevel: number | null;
  readonly waistHipRatio: number | null;
  readonly weightControlKg: number | null;
  readonly weightKg: number | null;
}

export interface SegmentalAnalysisInput {
  readonly fatMassKg: number | null;
  readonly fatMassPercentage: number | null;
  readonly leanMassKg: number | null;
  readonly leanMassPercentage: number | null;
  readonly segment: ExamSegment;
}

export interface BodyCompositionExam extends BodyCompositionExamInput {
  readonly createdAt: string;
  readonly id: string;
  readonly reviewedPayload: Json | null;
  readonly updatedAt: string;
  readonly uploadId: string;
  readonly userId: string;
}

export interface ConfirmExamInput {
  readonly exam: BodyCompositionExamInput;
  readonly reviewedPayload: Json;
  readonly uploadId: string;
  readonly userId: string;
}

export interface UpdateExamInput {
  readonly exam: BodyCompositionExamInput;
  readonly examId: string;
  readonly reviewedPayload: Json;
  readonly userId: string;
}

export interface DeleteExamInput {
  readonly examId: string;
  readonly userId: string;
}

export interface ExamRepository {
  createConfirmedExam(input: ConfirmExamInput): Promise<BodyCompositionExam>;
  deleteConfirmedExam(input: DeleteExamInput): Promise<void>;
  getExamById(input: {
    readonly examId: string;
    readonly userId: string;
  }): Promise<BodyCompositionExam | null>;
  listConfirmedExams(userId: string): Promise<readonly BodyCompositionExam[]>;
  updateConfirmedExam(input: UpdateExamInput): Promise<BodyCompositionExam>;
}

export const mapExamRowToDomain = ({
  row,
  segmentalAnalyses,
}: {
  readonly row: BodyCompositionExamRow;
  readonly segmentalAnalyses: readonly ExamSegmentalAnalysisRow[];
}): BodyCompositionExam => ({
  basalMetabolicRateKcal: row.basal_metabolic_rate_kcal,
  bmi: row.bmi,
  bodyFatMassKg: row.body_fat_mass_kg,
  bodyFatPercentage: row.body_fat_percentage,
  createdAt: row.created_at,
  examPerformedAt: row.exam_performed_at,
  fatControlKg: row.fat_control_kg,
  fatFreeMassKg: row.fat_free_mass_kg,
  id: row.id,
  idealWeightKg: row.ideal_weight_kg,
  inbodyScore: row.inbody_score,
  mineralsKg: row.minerals_kg,
  muscleControlKg: row.muscle_control_kg,
  obesityDegreePercentage: row.obesity_degree_percentage,
  proteinKg: row.protein_kg,
  reviewedPayload: row.reviewed_payload,
  segmentalAnalyses: segmentalAnalyses.map(mapSegmentalRowToInput),
  skeletalMuscleMassKg: row.skeletal_muscle_mass_kg,
  totalBodyWaterL: row.total_body_water_l,
  updatedAt: row.updated_at,
  uploadId: row.upload_id,
  userId: row.user_id,
  visceralFatLevel: row.visceral_fat_level,
  waistHipRatio: row.waist_hip_ratio,
  weightControlKg: row.weight_control_kg,
  weightKg: row.weight_kg,
});

export const mapExamInputToRowPayload = ({
  exam,
  reviewedPayload,
  uploadId,
  userId,
}: ConfirmExamInput) => ({
  ...mapExamInputToUpdatePayload({ exam, reviewedPayload, userId }),
  upload_id: uploadId,
});

export const mapExamInputToUpdatePayload = ({
  exam,
  reviewedPayload,
  userId,
}: {
  readonly exam: BodyCompositionExamInput;
  readonly reviewedPayload: Json;
  readonly userId: string;
}) => ({
  basal_metabolic_rate_kcal: exam.basalMetabolicRateKcal,
  bmi: exam.bmi,
  body_fat_mass_kg: exam.bodyFatMassKg,
  body_fat_percentage: exam.bodyFatPercentage,
  exam_performed_at: exam.examPerformedAt,
  fat_control_kg: exam.fatControlKg,
  fat_free_mass_kg: exam.fatFreeMassKg,
  ideal_weight_kg: exam.idealWeightKg,
  inbody_score: exam.inbodyScore,
  minerals_kg: exam.mineralsKg,
  muscle_control_kg: exam.muscleControlKg,
  obesity_degree_percentage: exam.obesityDegreePercentage,
  protein_kg: exam.proteinKg,
  reviewed_payload: reviewedPayload,
  skeletal_muscle_mass_kg: exam.skeletalMuscleMassKg,
  total_body_water_l: exam.totalBodyWaterL,
  user_id: userId,
  visceral_fat_level: exam.visceralFatLevel,
  waist_hip_ratio: exam.waistHipRatio,
  weight_control_kg: exam.weightControlKg,
  weight_kg: exam.weightKg,
});

export const mapSegmentalInputToRowPayload = ({
  examId,
  segmentalAnalysis,
}: {
  readonly examId: string;
  readonly segmentalAnalysis: SegmentalAnalysisInput;
}) => ({
  exam_id: examId,
  fat_mass_kg: segmentalAnalysis.fatMassKg,
  fat_mass_percentage: segmentalAnalysis.fatMassPercentage,
  lean_mass_kg: segmentalAnalysis.leanMassKg,
  lean_mass_percentage: segmentalAnalysis.leanMassPercentage,
  segment: segmentalAnalysis.segment,
});

const mapSegmentalRowToInput = (
  row: ExamSegmentalAnalysisRow,
): SegmentalAnalysisInput => ({
  fatMassKg: row.fat_mass_kg,
  fatMassPercentage: row.fat_mass_percentage,
  leanMassKg: row.lean_mass_kg,
  leanMassPercentage: row.lean_mass_percentage,
  segment: row.segment,
});
