// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createEmptyExamFormValues } from "../lib/exam-form";
import { ExamReviewFields } from "./exam-review-fields";

describe("ExamReviewFields", () => {
  it("renders field issues as accessible descriptions", () => {
    render(
      <ExamReviewFields
        issues={[
          {
            code: "low_confidence",
            field: "weightKg",
            message: "Campo extraído com baixa confiança.",
            severity: "warning",
          },
        ]}
        values={{ ...createEmptyExamFormValues(), weightKg: "78,2" }}
      />,
    );

    const input = document.querySelector('[name="weightKg"]');

    expect(input?.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Campo extraído com baixa confiança.")).toBeTruthy();
  });
});
