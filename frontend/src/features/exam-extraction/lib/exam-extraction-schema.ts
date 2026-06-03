import "server-only";

export const EXAM_EXTRACTION_PROMPT = [
  "Extract structured body composition data from this bioimpedance exam.",
  "Return only JSON matching the provided schema.",
  "Use null when a field is absent or unreadable.",
  "For each field, provide value, rawValue and confidence from 0 to 1.",
  "For examPerformedAt, read the exam date and time from the report header",
  "(e.g. InBody labels 'Data / Hora' or 'Data/Hora').",
  "Copy the exact header text into rawValue (e.g. '20.05.2026. 15:51').",
  "Put the same text in value when it includes date and time.",
  "Do not include diagnosis, prescription, diet, training or clinical advice.",
].join(" ");

const extractedNumberFieldSchema = {
  additionalProperties: false,
  properties: {
    confidence: { type: "number" },
    rawValue: { anyOf: [{ type: "string" }, { type: "null" }] },
    value: { anyOf: [{ type: "number" }, { type: "null" }] },
  },
  required: ["value", "rawValue", "confidence"],
  type: "object",
} as const;

const extractedStringFieldSchema = {
  additionalProperties: false,
  properties: {
    confidence: { type: "number" },
    rawValue: { anyOf: [{ type: "string" }, { type: "null" }] },
    value: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["value", "rawValue", "confidence"],
  type: "object",
} as const;

export const EXAM_EXTRACTION_RESPONSE_SCHEMA = {
  additionalProperties: false,
  properties: {
    fields: {
      additionalProperties: false,
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
      required: [
        "basalMetabolicRateKcal",
        "bmi",
        "bodyFatMassKg",
        "bodyFatPercentage",
        "examPerformedAt",
        "fatControlKg",
        "fatFreeMassKg",
        "idealWeightKg",
        "inbodyScore",
        "mineralsKg",
        "muscleControlKg",
        "obesityDegreePercentage",
        "proteinKg",
        "skeletalMuscleMassKg",
        "totalBodyWaterL",
        "visceralFatLevel",
        "waistHipRatio",
        "weightControlKg",
        "weightKg",
      ],
      type: "object",
    },
    segmentalAnalyses: {
      items: {
        additionalProperties: false,
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
