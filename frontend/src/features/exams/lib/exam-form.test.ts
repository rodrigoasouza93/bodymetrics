import { describe, expect, it } from "vitest";
import {
  getExamFormValuesFromPayload,
  readExamInputFromFormData,
} from "./exam-form.ts";

describe("exam form mapping", () => {
  it("maps extracted payload values to editable form values", () => {
    const values = getExamFormValuesFromPayload({
      fields: {
        bodyFatPercentage: { value: 22.5 },
        examPerformedAt: { value: "2026-06-02T00:00:00.000Z" },
        weightKg: { value: 78.2 },
      },
    });

    expect(values.weightKg).toBe("78,2");
    expect(values.bodyFatPercentage).toBe("22,5");
    expect(values.examPerformedAt).toBe("2026-06-02");
  });

  it("reads confirmed exam input from form data", () => {
    const formData = new FormData();
    formData.set("examPerformedAt", "2026-06-02");
    formData.set("weightKg", "78,2");
    formData.set("bodyFatPercentage", "22,5");
    formData.set("inbodyScore", "82");

    const exam = readExamInputFromFormData(formData);

    expect(exam.examPerformedAt).toBe("2026-06-02T00:00:00.000Z");
    expect(exam.weightKg).toBe(78.2);
    expect(exam.bodyFatPercentage).toBe(22.5);
    expect(exam.inbodyScore).toBe(82);
  });
});
