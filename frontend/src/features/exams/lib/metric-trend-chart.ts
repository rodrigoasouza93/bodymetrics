export interface MetricTrendChartPoint {
  readonly date: string;
  readonly value: number;
}

export interface MetricTrendChartLayout {
  readonly height: number;
  readonly plotHeight: number;
  readonly plotWidth: number;
  readonly width: number;
  readonly xOffset: number;
  readonly yOffset: number;
}

export interface MetricTrendChartTick {
  readonly label: string;
  readonly y: number;
}

export interface MetricTrendChartPointPosition {
  readonly date: string;
  readonly label: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
}

export interface MetricTrendChartModel {
  readonly deltaLabel: string | null;
  readonly latestLabel: string;
  readonly layout: MetricTrendChartLayout;
  readonly linePoints: string;
  readonly ticks: readonly MetricTrendChartTick[];
  readonly trendPoints: readonly MetricTrendChartPointPosition[];
}

const CHART_LAYOUT: MetricTrendChartLayout = {
  height: 168,
  plotHeight: 96,
  plotWidth: 248,
  width: 320,
  xOffset: 52,
  yOffset: 20,
};

export const buildMetricTrendChartModel = ({
  points,
  unit,
}: {
  readonly points: readonly MetricTrendChartPoint[];
  readonly unit: string;
}): MetricTrendChartModel | null => {
  if (points.length === 0) {
    return null;
  }

  const domain = computePaddedDomain(points.map((point) => point.value));
  const ticks = buildYAxisTicks(domain);
  const trendPoints = points.map((point, index) => {
    const x = scaleX(index, points.length, CHART_LAYOUT);
    const y = scaleY(point.value, domain, CHART_LAYOUT);

    return {
      date: point.date,
      label: formatMetricValue(point.value, unit),
      value: point.value,
      x,
      y,
    };
  });
  const latestPoint = points.at(-1);
  const previousPoint = points.at(-2);

  return {
    deltaLabel:
      latestPoint && previousPoint
        ? formatMetricDelta({
            current: latestPoint.value,
            previous: previousPoint.value,
            unit,
          })
        : null,
    latestLabel: latestPoint
      ? formatMetricValue(latestPoint.value, unit)
      : "",
    layout: CHART_LAYOUT,
    linePoints: trendPoints.map((point) => `${point.x},${point.y}`).join(" "),
    ticks,
    trendPoints,
  };
};

export const computePaddedDomain = (values: readonly number[]) => {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spread = maxValue - minValue;
  const padding =
    spread === 0
      ? Math.max(Math.abs(minValue) * 0.08, 1)
      : Math.max(spread * 0.35, 0.5);

  return {
    max: maxValue + padding,
    min: minValue - padding,
  };
};

const buildYAxisTicks = (domain: { readonly max: number; readonly min: number }) => {
  const middle = (domain.min + domain.max) / 2;

  return [domain.max, middle, domain.min].map((value) => ({
    label: formatAxisValue(value),
    y: scaleY(value, domain, CHART_LAYOUT),
  }));
};

const scaleX = (
  index: number,
  totalPoints: number,
  layout: MetricTrendChartLayout,
) => {
  if (totalPoints === 1) {
    return layout.xOffset + layout.plotWidth / 2;
  }

  return layout.xOffset + (index / (totalPoints - 1)) * layout.plotWidth;
};

const scaleY = (
  value: number,
  domain: { readonly max: number; readonly min: number },
  layout: MetricTrendChartLayout,
) => {
  const range = domain.max - domain.min || 1;
  const normalized = (value - domain.min) / range;

  return layout.yOffset + layout.plotHeight - normalized * layout.plotHeight;
};

const formatAxisValue = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);

export const formatMetricValue = (value: number, unit: string) => {
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
};

const formatMetricDelta = ({
  current,
  previous,
  unit,
}: {
  readonly current: number;
  readonly previous: number;
  readonly unit: string;
}) => {
  const delta = Math.round((current - previous) * 10) / 10;

  if (delta === 0) {
    return "Estável em relação ao exame anterior";
  }

  const sign = delta > 0 ? "+" : "";
  const formattedDelta = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(delta) ? 0 : 1,
  }).format(delta);

  return `${sign}${formattedDelta}${unit ? ` ${unit}` : ""} vs. exame anterior`;
};

export const formatShortTrendDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
