import type { ExamComparison, MetricDelta } from "@/src/features/exams/lib/comparison";
import type { ExamMetricKey } from "@/src/features/exams/lib/exam-types";

export const PROFESSIONAL_EVALUATION_DISCLAIMER =
  "Estes insights são informativos e não substituem avaliação médica, nutricional ou profissional.";

export interface ExamInsight {
  readonly disclaimer: typeof PROFESSIONAL_EVALUATION_DISCLAIMER;
  readonly metric: ExamMetricKey;
  readonly text: string;
}

const METRIC_SUBJECTS: Record<ExamMetricKey, string> = {
  bmi: "Seu IMC",
  bodyFatMassKg: "Sua massa de gordura",
  bodyFatPercentage: "Seu percentual de gordura corporal",
  fatFreeMassKg: "Sua massa livre de gordura",
  skeletalMuscleMassKg: "Sua massa muscular esquelética",
  weightKg: "Seu peso",
};

const METRIC_UNITS: Record<ExamMetricKey, string> = {
  bmi: "",
  bodyFatMassKg: " kg",
  bodyFatPercentage: " p.p.",
  fatFreeMassKg: " kg",
  skeletalMuscleMassKg: " kg",
  weightKg: " kg",
};

export const generateExamInsights = (
  comparison: ExamComparison | null,
): readonly ExamInsight[] => {
  if (!comparison) {
    return [];
  }

  return comparison.deltas
    .filter(hasMeaningfulDelta)
    .map(createInsightFromDelta);
};

const createInsightFromDelta = (delta: MetricDelta): ExamInsight => {
  const direction = getDeltaDirection(delta.absolute);
  const absoluteValue = Math.abs(delta.absolute);
  const percentText =
    delta.percent === null ? "" : ` (${formatNumber(Math.abs(delta.percent))}%)`;
  const unit = METRIC_UNITS[delta.metric];

  return {
    disclaimer: PROFESSIONAL_EVALUATION_DISCLAIMER,
    metric: delta.metric,
    text: `${METRIC_SUBJECTS[delta.metric]} ${direction} ${formatNumber(absoluteValue)}${unit}${percentText} em relação ao exame anterior.`,
  };
};

const getDeltaDirection = (absolute: number) => {
  if (absolute > 0) {
    return "aumentou";
  }

  return "reduziu";
};

const hasMeaningfulDelta = (delta: MetricDelta) => delta.absolute !== 0;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
