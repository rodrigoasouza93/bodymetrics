import { generateExamInsights, PROFESSIONAL_EVALUATION_DISCLAIMER } from "@/src/features/insights/lib/exam-insights";
import {
  compareLatestExam,
  createExamTrendPoints,
  type ExamTrendPoint,
} from "../lib/comparison";
import type { BodyCompositionExam } from "../lib/exam-types";

interface ExamTrendsPanelProps {
  readonly exams: readonly BodyCompositionExam[];
}

const CHARTS = [
  { key: "weightKg", label: "Peso", unit: "kg" },
  {
    key: "skeletalMuscleMassKg",
    label: "Massa magra",
    unit: "kg",
  },
  { key: "bodyFatMassKg", label: "Massa de gordura", unit: "kg" },
  {
    key: "bodyFatPercentage",
    label: "Percentual de gordura",
    unit: "%",
  },
] as const;

export function ExamTrendsPanel({ exams }: ExamTrendsPanelProps) {
  const trendPoints = createExamTrendPoints(exams);
  const comparison = compareLatestExam(exams);
  const insights = generateExamInsights(comparison);

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Evolução
        </p>
        <h2 className="mt-2 text-2xl font-medium text-ink">
          Gráficos e comparação entre exames.
        </h2>
      </div>

      {trendPoints.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-surface-card p-6 text-sm leading-6 text-body">
          Confirme pelo menos um exame para visualizar gráficos.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {CHARTS.map((chart) => (
            <MetricChart
              chartKey={chart.key}
              label={chart.label}
              key={chart.key}
              points={trendPoints}
              unit={chart.unit}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-surface-card p-6">
        <h3 className="text-lg font-medium text-ink">Insights informativos</h3>
        {insights.length > 0 ? (
          <ul className="mt-4 grid gap-3">
            {insights.map((insight) => (
              <li className="text-sm leading-6 text-body" key={insight.text}>
                {insight.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-body">
            Confirme pelo menos dois exames com métricas comparáveis para gerar
            insights.
          </p>
        )}
        <p className="mt-4 border-t border-hairline pt-4 text-sm leading-6 text-muted">
          {PROFESSIONAL_EVALUATION_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

function MetricChart({
  chartKey,
  label,
  points,
  unit,
}: {
  readonly chartKey: keyof Pick<
    ExamTrendPoint,
    "bodyFatMassKg" | "bodyFatPercentage" | "skeletalMuscleMassKg" | "weightKg"
  >;
  readonly label: string;
  readonly points: readonly ExamTrendPoint[];
  readonly unit: string;
}) {
  const chartPoints = points
    .map((point) => ({
      date: point.date,
      value: point[chartKey],
    }))
    .filter(
      (point): point is { readonly date: string; readonly value: number } =>
        point.value !== null,
    );

  return (
    <article className="rounded-lg border border-hairline bg-surface-card p-5">
      <h3 className="text-lg font-medium text-ink">{label}</h3>
      {chartPoints.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Sem dados suficientes para esta métrica.
        </p>
      ) : (
        <>
          <svg
            aria-hidden="true"
            className="mt-4 h-40 w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 300 120"
          >
            <polyline
              fill="none"
              points={buildPolylinePoints(chartPoints)}
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </svg>
          <table className="mt-4 w-full text-left text-sm">
            <caption className="sr-only">
              Valores de {label} por exame
            </caption>
            <tbody>
              {chartPoints.map((point) => (
                <tr className="border-t border-hairline" key={point.date}>
                  <th className="py-2 font-medium text-body" scope="row">
                    {formatShortDate(point.date)}
                  </th>
                  <td className="py-2 text-right text-body-strong">
                    {point.value} {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </article>
  );
}

const buildPolylinePoints = (
  points: readonly { readonly value: number }[],
) => {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 150 : (index / (points.length - 1)) * 300;
      const y = 110 - ((point.value - min) / range) * 100;

      return `${x},${y}`;
    })
    .join(" ");
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
