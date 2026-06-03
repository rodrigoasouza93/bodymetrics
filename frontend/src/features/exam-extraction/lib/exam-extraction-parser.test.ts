import { describe, expect, it } from "vitest";
import { parseProviderExtractionPayload } from "./exam-extraction-parser.ts";

describe("provider extraction parser", () => {
  it("parses structured JSON into extracted exam fields", () => {
    const result = parseProviderExtractionPayload({
      fields: {
        bodyFatMassKg: {
          confidence: 0.9,
          rawValue: "18,4 kg",
          value: "18,4 kg",
        },
        bodyFatPercentage: {
          confidence: 0.8,
          rawValue: "22,5%",
          value: "22,5%",
        },
        examPerformedAt: {
          confidence: 0.7,
          rawValue: "02/06/2026",
          value: "02/06/2026",
        },
        inbodyScore: {
          confidence: 0.6,
          rawValue: "82",
          value: "82",
        },
        weightKg: {
          confidence: 0.9,
          rawValue: "78,2 kg",
          value: "78,2 kg",
        },
      },
      segmentalAnalyses: [
        {
          fatMassKg: { confidence: 0.8, rawValue: "1,2", value: "1,2" },
          fatMassPercentage: {
            confidence: 0.8,
            rawValue: "80%",
            value: "80%",
          },
          leanMassKg: { confidence: 0.8, rawValue: "3,4", value: "3,4" },
          leanMassPercentage: {
            confidence: 0.8,
            rawValue: "102%",
            value: "102%",
          },
          segment: "left_arm",
        },
      ],
    });

    expect(result.fields.weightKg.value).toBe(78.2);
    expect(result.fields.bodyFatMassKg.value).toBe(18.4);
    expect(result.fields.bodyFatPercentage.value).toBe(22.5);
    expect(result.fields.examPerformedAt.value).toBe("2026-06-02T00:00:00.000Z");
    expect(result.fields.segmentalAnalyses.value).toEqual([
      {
        fatMassKg: 1.2,
        fatMassPercentage: 80,
        leanMassKg: 3.4,
        leanMassPercentage: 102,
        segment: "left_arm",
      },
    ]);
    expect(result.overallConfidence).toBeGreaterThan(0);
  });

  it("fills missing required fields with null values and warnings", () => {
    const result = parseProviderExtractionPayload({
      fields: {
        weightKg: {
          confidence: 0.9,
          rawValue: "78 kg",
          value: 78,
        },
      },
      segmentalAnalyses: [],
    });

    expect(result.fields.weightKg.value).toBe(78);
    expect(result.fields.bmi.value).toBeNull();
    expect(result.fieldIssues.some((issue) => issue.field === "bmi")).toBe(true);
  });

  it("parses InBody exam date and time from the provider payload", () => {
    const result = parseProviderExtractionPayload({
      fields: {
        examPerformedAt: {
          confidence: 0.95,
          rawValue: "20.05.2026. 15:51",
          value: "20.05.2026. 15:51",
        },
        weightKg: {
          confidence: 0.9,
          rawValue: "78 kg",
          value: 78,
        },
      },
      segmentalAnalyses: [],
    });

    expect(result.fields.examPerformedAt.value).toBe("2026-05-20T15:51:00.000Z");
    expect(result.fields.examPerformedAt.rawValue).toBe("20.05.2026. 15:51");
    expect(
      result.fieldIssues.some((issue) => issue.field === "examPerformedAt"),
    ).toBe(false);
  });

  it("does not dilute overall confidence with null fields reported as zero confidence", () => {
    const result = parseProviderExtractionPayload({
      fields: {
        bmi: {
          confidence: 0,
          rawValue: null,
          value: null,
        },
        weightKg: {
          confidence: 0.9,
          rawValue: "78 kg",
          value: 78,
        },
      },
      segmentalAnalyses: [],
    });

    expect(result.overallConfidence).toBe(0.9);
  });
});
