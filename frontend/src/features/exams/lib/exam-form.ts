import type { Json } from "@/src/types/database";
import type { BodyCompositionExam, BodyCompositionExamInput } from "./exam-types";

export type ExamFormFieldName = Exclude<
  keyof BodyCompositionExamInput,
  "segmentalAnalyses"
>;

export interface ExamFormField {
  readonly label: string;
  readonly name: ExamFormFieldName;
  readonly unit: string;
}

export type ExamFormValues = Record<ExamFormFieldName, string>;

export const EXAM_FORM_FIELDS = [
  { label: "Data do exame", name: "examPerformedAt", unit: "" },
  { label: "Peso", name: "weightKg", unit: "kg" },
  {
    label: "Massa muscular esquelética",
    name: "skeletalMuscleMassKg",
    unit: "kg",
  },
  { label: "Massa de gordura", name: "bodyFatMassKg", unit: "kg" },
  {
    label: "Percentual de gordura corporal",
    name: "bodyFatPercentage",
    unit: "%",
  },
  { label: "IMC", name: "bmi", unit: "" },
  { label: "Pontuação InBody", name: "inbodyScore", unit: "" },
  { label: "Água corporal total", name: "totalBodyWaterL", unit: "L" },
  { label: "Proteína", name: "proteinKg", unit: "kg" },
  { label: "Minerais", name: "mineralsKg", unit: "kg" },
  { label: "Massa livre de gordura", name: "fatFreeMassKg", unit: "kg" },
  {
    label: "Taxa metabólica basal",
    name: "basalMetabolicRateKcal",
    unit: "kcal",
  },
  { label: "Relação cintura-quadril", name: "waistHipRatio", unit: "" },
  { label: "Gordura visceral", name: "visceralFatLevel", unit: "" },
  { label: "Grau de obesidade", name: "obesityDegreePercentage", unit: "%" },
  { label: "Peso ideal", name: "idealWeightKg", unit: "kg" },
  { label: "Controle de peso", name: "weightControlKg", unit: "kg" },
  { label: "Controle de gordura", name: "fatControlKg", unit: "kg" },
  { label: "Controle de músculo", name: "muscleControlKg", unit: "kg" },
] as const satisfies readonly ExamFormField[];

export const createEmptyExamFormValues = (): ExamFormValues =>
  Object.fromEntries(EXAM_FORM_FIELDS.map((field) => [field.name, ""])) as ExamFormValues;

export const getExamFormValuesFromExam = (
  exam: BodyCompositionExam,
): ExamFormValues =>
  Object.fromEntries(
    EXAM_FORM_FIELDS.map((field) => [
      field.name,
      formatNullableExamValue(exam[field.name]),
    ]),
  ) as ExamFormValues;

export const getExamFormValuesFromPayload = (payload: Json): ExamFormValues => {
  const values = createEmptyExamFormValues();

  if (!isRecord(payload)) {
    return values;
  }

  const fields = payload.fields;

  if (!isRecord(fields)) {
    return values;
  }

  EXAM_FORM_FIELDS.forEach((field) => {
    const extractedField = fields[field.name];

    if (isRecord(extractedField)) {
      values[field.name] = formatNullableExamValue(
        readStringOrNumber(extractedField.value),
      );
    }
  });

  return values;
};

export const readExamInputFromFormData = (
  formData: FormData,
): BodyCompositionExamInput => ({
  basalMetabolicRateKcal: readInteger(formData, "basalMetabolicRateKcal"),
  bmi: readDecimal(formData, "bmi"),
  bodyFatMassKg: readDecimal(formData, "bodyFatMassKg"),
  bodyFatPercentage: readDecimal(formData, "bodyFatPercentage"),
  examPerformedAt: readDateTime(formData, "examPerformedAt"),
  fatControlKg: readDecimal(formData, "fatControlKg"),
  fatFreeMassKg: readDecimal(formData, "fatFreeMassKg"),
  idealWeightKg: readDecimal(formData, "idealWeightKg"),
  inbodyScore: readInteger(formData, "inbodyScore"),
  mineralsKg: readDecimal(formData, "mineralsKg"),
  muscleControlKg: readDecimal(formData, "muscleControlKg"),
  obesityDegreePercentage: readDecimal(formData, "obesityDegreePercentage"),
  proteinKg: readDecimal(formData, "proteinKg"),
  segmentalAnalyses: [],
  skeletalMuscleMassKg: readDecimal(formData, "skeletalMuscleMassKg"),
  totalBodyWaterL: readDecimal(formData, "totalBodyWaterL"),
  visceralFatLevel: readInteger(formData, "visceralFatLevel"),
  waistHipRatio: readDecimal(formData, "waistHipRatio"),
  weightControlKg: readDecimal(formData, "weightControlKg"),
  weightKg: readDecimal(formData, "weightKg"),
});

export const readReviewedPayloadFromFormData = (formData: FormData): Json => {
  const payload = formData.get("reviewedPayload");

  if (typeof payload !== "string" || !payload) {
    return {};
  }

  return JSON.parse(payload) as Json;
};

export const readRequiredString = (formData: FormData, name: string) => {
  const value = formData.get(name);

  if (typeof value !== "string" || !value) {
    throw new Error("Dados do formulário incompletos.");
  }

  return value;
};

const readDecimal = (formData: FormData, name: ExamFormFieldName) => {
  const value = formData.get(name);

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const numberValue = Number(value.replace(",", "."));

  return Number.isFinite(numberValue) ? Math.round(numberValue * 100) / 100 : null;
};

const readInteger = (formData: FormData, name: ExamFormFieldName) => {
  const numberValue = readDecimal(formData, name);

  return numberValue === null ? null : Math.round(numberValue);
};

const readDateTime = (formData: FormData, name: ExamFormFieldName) => {
  const value = formData.get(name);

  if (typeof value !== "string" || !value) {
    return null;
  }

  return value.includes("T") ? value : `${value}T00:00:00.000Z`;
};

const formatNullableExamValue = (value: number | string | null) => {
  if (value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return String(value).replace(".", ",");
};

const readStringOrNumber = (value: Json | undefined) => {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return null;
};

const isRecord = (value: Json | undefined): value is Record<string, Json> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
