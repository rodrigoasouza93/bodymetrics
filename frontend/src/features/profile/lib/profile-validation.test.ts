import { describe, expect, it } from "vitest";
import { validateProfileForm } from "./profile-validation.ts";

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
};

describe("validateProfileForm", () => {
  it("normalizes optional profile values", () => {
    const result = validateProfileForm(
      createFormData({
        birthDate: "1990-04-10",
        fitnessGoal: "Ganhar massa magra",
        fullName: "  User Example  ",
        heightCm: "172,5",
        referenceWeightKg: "73.25",
        sex: "male",
      }),
    );

    expect(result.errors).toEqual({});
    expect(result.profile).toEqual({
      birthDate: "1990-04-10",
      fitnessGoal: "Ganhar massa magra",
      fullName: "User Example",
      heightCm: 172.5,
      referenceWeightKg: 73.25,
      sex: "male",
    });
  });

  it("returns field errors for invalid physical values", () => {
    const result = validateProfileForm(
      createFormData({
        birthDate: "2999-01-01",
        fitnessGoal: "",
        fullName: "",
        heightCm: "10",
        referenceWeightKg: "invalid",
        sex: "invalid",
      }),
    );

    expect(result.profile).toBeNull();
    expect(result.errors.birthDate).toBe(
      "Informe uma data de nascimento válida, sem data futura.",
    );
    expect(result.errors.heightCm).toBe("Informe uma altura entre 30 cm e 300 cm.");
    expect(result.errors.referenceWeightKg).toBe(
      "Informe um peso entre 1 kg e 500 kg.",
    );
    expect(result.errors.sex).toBe("Selecione uma opção de sexo válida.");
  });

  it("rejects impossible calendar dates", () => {
    const result = validateProfileForm(
      createFormData({
        birthDate: "2025-02-31",
      }),
    );

    expect(result.profile).toBeNull();
    expect(result.errors.birthDate).toBe(
      "Informe uma data de nascimento válida, sem data futura.",
    );
  });

  it("keeps empty optional fields as null values", () => {
    const result = validateProfileForm(createFormData({}));

    expect(result.errors).toEqual({});
    expect(result.profile).toEqual({
      birthDate: null,
      fitnessGoal: null,
      fullName: null,
      heightCm: null,
      referenceWeightKg: null,
      sex: null,
    });
  });
});
