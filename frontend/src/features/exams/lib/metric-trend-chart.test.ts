import { describe, expect, it } from "vitest";
import {
  buildMetricTrendChartModel,
  computePaddedDomain,
  formatMetricValue,
} from "./metric-trend-chart.ts";

describe("metric trend chart", () => {
  it("pads flat values so the line does not stretch edge to edge", () => {
    const domain = computePaddedDomain([75.9, 75.9]);

    expect(domain.max - domain.min).toBeGreaterThan(1);
  });

  it("builds readable labels and delta text", () => {
    const model = buildMetricTrendChartModel({
      points: [
        { date: "2026-05-19T00:00:00.000Z", value: 34.2 },
        { date: "2026-06-01T00:00:00.000Z", value: 35.2 },
      ],
      unit: "kg",
    });

    expect(model?.latestLabel).toBe("35,2 kg");
    expect(model?.deltaLabel).toBe("+1 kg vs. exame anterior");
    expect(model?.ticks).toHaveLength(3);
    expect(model?.trendPoints).toHaveLength(2);
  });

  it("formats metric values in pt-BR", () => {
    expect(formatMetricValue(20.8, "%")).toBe("20,8 %");
  });
});
