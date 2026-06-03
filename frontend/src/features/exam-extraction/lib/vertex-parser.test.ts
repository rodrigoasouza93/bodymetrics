import { describe, expect, it } from "vitest";
import { parseVertexExamExtractionResponse } from "./vertex-parser.ts";

const createProviderResponse = (text: string) => ({
  candidates: [
    {
      content: {
        parts: [{ text }],
      },
    },
  ],
});

describe("Vertex extraction parser", () => {
  it("parses structured JSON into extracted exam fields", () => {
    const result = parseVertexExamExtractionResponse(
      createProviderResponse(
        JSON.stringify({
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
              confidence: 0.95,
              rawValue: "20.05.2026. 15:51",
              value: "20.05.2026. 15:51",
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
        }),
      ),
    );

    expect(result.fields.weightKg.value).toBe(78.2);
    expect(result.fields.bodyFatMassKg.value).toBe(18.4);
    expect(result.fields.bodyFatPercentage.value).toBe(22.5);
    expect(result.fields.examPerformedAt.value).toBe(
      "2026-05-20T15:51:00.000Z",
    );
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

  it("throws when Vertex returns no structured text", () => {
    expect(() =>
      parseVertexExamExtractionResponse({ candidates: [] }),
    ).toThrow("Vertex AI não retornou texto estruturado.");
  });
});
