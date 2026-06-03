import { generateExamInsights, PROFESSIONAL_EVALUATION_DISCLAIMER } from "@/src/features/insights/lib/exam-insights";
import {
  compareLatestExam,
  createExamTrendPoints,
  type ExamTrendPoint,
} from "../lib/comparison";
import type { BodyCompositionExam } from "../lib/exam-types";
import {
  buildMetricTrendChartModel,
  formatShortTrendDate,
  type MetricTrendChartModel,
} from "../lib/metric-trend-chart";

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
  const chartModel = buildMetricTrendChartModel({ points: chartPoints, unit });

  return (
    <article className="rounded-lg border border-hairline bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium text-ink">{label}</h3>
          {chartModel ? (
            <p className="mt-1 text-2xl font-medium text-body-strong">
              {chartModel.latestLabel}
            </p>
          ) : null}
        </div>
        {chartModel?.deltaLabel ? (
          <p className="rounded-md bg-canvas px-3 py-2 text-sm leading-5 text-body">
            {chartModel.deltaLabel}
          </p>
        ) : null}
      </div>

      {!chartModel ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Sem dados suficientes para esta métrica.
        </p>
      ) : (
        <MetricTrendChart ariaLabel={`Evolução de ${label}`} model={chartModel} />
      )}
    </article>
  );
}

function MetricTrendChart({
  ariaLabel,
  model,
}: {
  readonly ariaLabel: string;
  readonly model: MetricTrendChartModel;
}) {
  const { layout } = model;

  return (
    <div className="mt-5">
      <svg
        aria-label={ariaLabel}
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
      >
        {model.ticks.map((tick) => (
          <g key={tick.label}>
            <line
              stroke="var(--hairline)"
              strokeDasharray="4 4"
              x1={layout.xOffset}
              x2={layout.xOffset + layout.plotWidth}
              y1={tick.y}
              y2={tick.y}
            />
            <text
              fill="var(--muted)"
              fontSize="11"
              textAnchor="end"
              x={layout.xOffset - 8}
              y={tick.y + 4}
            >
              {tick.label}
            </text>
          </g>
        ))}

        {model.trendPoints.length > 1 ? (
          <polyline
            fill="none"
            points={model.linePoints}
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        ) : null}

        {model.trendPoints.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              fill="var(--canvas)"
              r="5"
              stroke="var(--primary-active)"
              strokeWidth="2"
            />
            <text
              fill="var(--body-strong)"
              fontSize="11"
              fontWeight="500"
              textAnchor="middle"
              x={point.x}
              y={point.y - 10}
            >
              {point.label}
            </text>
            <text
              fill="var(--muted)"
              fontSize="11"
              textAnchor="middle"
              x={point.x}
              y={layout.yOffset + layout.plotHeight + 18}
            >
              {formatShortTrendDate(point.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
