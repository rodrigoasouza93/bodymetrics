import type { BodyCompositionExam, ExamMetricKey } from "./exam-types";

export interface ExamTrendPoint {
  readonly bodyFatMassKg: number | null;
  readonly bodyFatPercentage: number | null;
  readonly date: string;
  readonly examId: string;
  readonly skeletalMuscleMassKg: number | null;
  readonly weightKg: number | null;
}

export interface MetricDelta {
  readonly absolute: number;
  readonly current: number;
  readonly metric: ExamMetricKey;
  readonly percent: number | null;
  readonly previous: number;
}

export interface ExamComparison {
  readonly currentExamId: string;
  readonly deltas: readonly MetricDelta[];
  readonly previousExamId: string;
}

const COMPARED_METRICS = [
  "weightKg",
  "skeletalMuscleMassKg",
  "bodyFatMassKg",
  "bodyFatPercentage",
  "bmi",
  "fatFreeMassKg",
] as const satisfies readonly ExamMetricKey[];

export const createExamTrendPoints = (
  exams: readonly BodyCompositionExam[],
): readonly ExamTrendPoint[] =>
  [...exams].sort(compareExamsAscending).map((exam) => ({
    bodyFatMassKg: exam.bodyFatMassKg,
    bodyFatPercentage: exam.bodyFatPercentage,
    date: exam.examPerformedAt ?? exam.createdAt,
    examId: exam.id,
    skeletalMuscleMassKg: exam.skeletalMuscleMassKg,
    weightKg: exam.weightKg,
  }));

export const compareLatestExam = (
  exams: readonly BodyCompositionExam[],
): ExamComparison | null => {
  const orderedExams = [...exams].sort(compareExamsAscending);
  const currentExam = orderedExams.at(-1);
  const previousExam = orderedExams.at(-2);

  if (!currentExam || !previousExam) {
    return null;
  }

  return compareExams({ currentExam, previousExam });
};

export const compareExams = ({
  currentExam,
  previousExam,
}: {
  readonly currentExam: BodyCompositionExam;
  readonly previousExam: BodyCompositionExam;
}): ExamComparison => ({
  currentExamId: currentExam.id,
  deltas: COMPARED_METRICS.flatMap((metric) =>
    createMetricDelta({
      current: currentExam[metric],
      metric,
      previous: previousExam[metric],
    }),
  ),
  previousExamId: previousExam.id,
});

const createMetricDelta = ({
  current,
  metric,
  previous,
}: {
  readonly current: number | null;
  readonly metric: ExamMetricKey;
  readonly previous: number | null;
}): readonly MetricDelta[] => {
  if (current === null || previous === null) {
    return [];
  }

  const absolute = roundDelta(current - previous);

  return [
    {
      absolute,
      current,
      metric,
      percent: previous === 0 ? null : roundDelta((absolute / previous) * 100),
      previous,
    },
  ];
};

const compareExamsAscending = (
  leftExam: BodyCompositionExam,
  rightExam: BodyCompositionExam,
) => getExamTime(leftExam) - getExamTime(rightExam);

const getExamTime = (exam: BodyCompositionExam) =>
  new Date(exam.examPerformedAt ?? exam.createdAt).getTime();

const roundDelta = (value: number) => Math.round(value * 100) / 100;
