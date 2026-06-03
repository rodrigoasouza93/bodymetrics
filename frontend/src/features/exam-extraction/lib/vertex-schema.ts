import "server-only";

export const VERTEX_EXAM_EXTRACTION_PROMPT = [
  "Extract structured body composition data from this bioimpedance exam.",
  "Return only JSON matching the provided schema.",
  "Use null when a field is absent or unreadable.",
  "For each field, provide value, rawValue and confidence from 0 to 1.",
  "Do not include diagnosis, prescription, diet, training or clinical advice.",
].join(" ");

const extractedNumberFieldSchema = {
  properties: {
    confidence: { nullable: true, type: "number" },
    rawValue: { nullable: true, type: "string" },
    value: { nullable: true, type: "number" },
  },
  required: ["value", "rawValue", "confidence"],
  type: "object",
} as const;

const extractedStringFieldSchema = {
  properties: {
    confidence: { nullable: true, type: "number" },
    rawValue: { nullable: true, type: "string" },
    value: { nullable: true, type: "string" },
  },
  required: ["value", "rawValue", "confidence"],
  type: "object",
} as const;

export const VERTEX_EXAM_RESPONSE_SCHEMA = {
  properties: {
    fields: {
      properties: {
        basalMetabolicRateKcal: extractedNumberFieldSchema,
        bmi: extractedNumberFieldSchema,
        bodyFatMassKg: extractedNumberFieldSchema,
        bodyFatPercentage: extractedNumberFieldSchema,
        examPerformedAt: extractedStringFieldSchema,
        fatControlKg: extractedNumberFieldSchema,
        fatFreeMassKg: extractedNumberFieldSchema,
        idealWeightKg: extractedNumberFieldSchema,
        inbodyScore: extractedNumberFieldSchema,
        mineralsKg: extractedNumberFieldSchema,
        muscleControlKg: extractedNumberFieldSchema,
        obesityDegreePercentage: extractedNumberFieldSchema,
        proteinKg: extractedNumberFieldSchema,
        skeletalMuscleMassKg: extractedNumberFieldSchema,
        totalBodyWaterL: extractedNumberFieldSchema,
        visceralFatLevel: extractedNumberFieldSchema,
        waistHipRatio: extractedNumberFieldSchema,
        weightControlKg: extractedNumberFieldSchema,
        weightKg: extractedNumberFieldSchema,
      },
      type: "object",
    },
    segmentalAnalyses: {
      items: {
        properties: {
          fatMassKg: extractedNumberFieldSchema,
          fatMassPercentage: extractedNumberFieldSchema,
          leanMassKg: extractedNumberFieldSchema,
          leanMassPercentage: extractedNumberFieldSchema,
          segment: {
            enum: ["left_arm", "right_arm", "trunk", "left_leg", "right_leg"],
            type: "string",
          },
        },
        required: [
          "segment",
          "leanMassKg",
          "leanMassPercentage",
          "fatMassKg",
          "fatMassPercentage",
        ],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["fields", "segmentalAnalyses"],
  type: "object",
} as const;
