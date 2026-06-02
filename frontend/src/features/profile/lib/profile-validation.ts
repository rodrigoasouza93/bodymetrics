import type { ProfileRow, ProfileSex } from "@/src/types/database";

export type ProfileFieldName =
  | "birthDate"
  | "fitnessGoal"
  | "fullName"
  | "heightCm"
  | "referenceWeightKg"
  | "sex";

export interface ProfileFormValues {
  readonly birthDate: string;
  readonly fitnessGoal: string;
  readonly fullName: string;
  readonly heightCm: string;
  readonly referenceWeightKg: string;
  readonly sex: string;
}

export interface ProfileInput {
  readonly birthDate: string | null;
  readonly fitnessGoal: string | null;
  readonly fullName: string | null;
  readonly heightCm: number | null;
  readonly referenceWeightKg: number | null;
  readonly sex: ProfileSex | null;
}

export interface ProfileValidationResult {
  readonly errors: Partial<Record<ProfileFieldName, string>>;
  readonly profile: ProfileInput | null;
  readonly values: ProfileFormValues;
}

export const PROFILE_SEX_OPTIONS = [
  "female",
  "male",
  "other",
  "prefer_not_to_say",
] as const satisfies readonly ProfileSex[];

const MAX_FULL_NAME_LENGTH = 120;
const MAX_FITNESS_GOAL_LENGTH = 500;

const getOptionalString = (formData: FormData, fieldName: string) => {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const parseOptionalNumber = (value: string) => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.replace(",", ".");
  const numberValue = Number(normalizedValue);

  if (!Number.isFinite(numberValue)) {
    return Number.NaN;
  }

  return Math.round(numberValue * 100) / 100;
};

const isProfileSex = (value: string): value is ProfileSex =>
  PROFILE_SEX_OPTIONS.includes(value as ProfileSex);

const getTodayUtcTime = () => {
  const today = new Date();

  return Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
};

const isPastOrToday = (dateValue: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return (
    parsedDate.getUTCFullYear() === Number(year) &&
    parsedDate.getUTCMonth() + 1 === Number(month) &&
    parsedDate.getUTCDate() === Number(day) &&
    parsedDate.getTime() <= getTodayUtcTime()
  );
};

export const getProfileFormValues = (formData: FormData): ProfileFormValues => ({
  birthDate: getOptionalString(formData, "birthDate"),
  fitnessGoal: getOptionalString(formData, "fitnessGoal"),
  fullName: getOptionalString(formData, "fullName"),
  heightCm: getOptionalString(formData, "heightCm"),
  referenceWeightKg: getOptionalString(formData, "referenceWeightKg"),
  sex: getOptionalString(formData, "sex"),
});

export const getProfileFormValuesFromRow = (
  profile: ProfileRow | null,
): ProfileFormValues => ({
  birthDate: profile?.birth_date ?? "",
  fitnessGoal: profile?.fitness_goal ?? "",
  fullName: profile?.full_name ?? "",
  heightCm: profile?.height_cm ? String(profile.height_cm) : "",
  referenceWeightKg: profile?.reference_weight_kg
    ? String(profile.reference_weight_kg)
    : "",
  sex: profile?.sex ?? "",
});

export const validateProfileForm = (
  formData: FormData,
): ProfileValidationResult => {
  const values = getProfileFormValues(formData);
  const errors: Partial<Record<ProfileFieldName, string>> = {};
  const heightCm = parseOptionalNumber(values.heightCm);
  const referenceWeightKg = parseOptionalNumber(values.referenceWeightKg);

  if (values.fullName.length > MAX_FULL_NAME_LENGTH) {
    errors.fullName = "Use um nome com até 120 caracteres.";
  }

  if (values.sex && !isProfileSex(values.sex)) {
    errors.sex = "Selecione uma opção de sexo válida.";
  }

  if (values.birthDate && !isPastOrToday(values.birthDate)) {
    errors.birthDate = "Informe uma data de nascimento válida, sem data futura.";
  }

  if (
    heightCm !== null &&
    (Number.isNaN(heightCm) || heightCm < 30 || heightCm > 300)
  ) {
    errors.heightCm = "Informe uma altura entre 30 cm e 300 cm.";
  }

  if (
    referenceWeightKg !== null &&
    (Number.isNaN(referenceWeightKg) ||
      referenceWeightKg < 1 ||
      referenceWeightKg > 500)
  ) {
    errors.referenceWeightKg = "Informe um peso entre 1 kg e 500 kg.";
  }

  if (values.fitnessGoal.length > MAX_FITNESS_GOAL_LENGTH) {
    errors.fitnessGoal = "Descreva o objetivo em até 500 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, profile: null, values };
  }

  return {
    errors,
    profile: {
      birthDate: values.birthDate || null,
      fitnessGoal: values.fitnessGoal || null,
      fullName: values.fullName || null,
      heightCm,
      referenceWeightKg,
      sex: values.sex && isProfileSex(values.sex) ? values.sex : null,
    },
    values,
  };
};
