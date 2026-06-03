import { describe, expect, it } from "vitest";
import {
  normalizeDecimalNumber,
  normalizeExamDate,
  normalizeIntegerNumber,
  normalizePercentage,
} from "./normalizers.ts";

describe("exam extraction normalizers", () => {
  it("normalizes decimal values with local units and separators", () => {
    expect(normalizeDecimalNumber("72,35 kg")).toBe(72.35);
    expect(normalizeDecimalNumber("1.234,56")).toBe(1234.56);
    expect(normalizeDecimalNumber("42.129")).toBe(42.13);
  });

  it("returns null for invalid numbers", () => {
    expect(normalizeDecimalNumber("kg")).toBeNull();
    expect(normalizeDecimalNumber(Number.NaN)).toBeNull();
  });

  it("normalizes integer and percentage values", () => {
    expect(normalizeIntegerNumber("1680,4 kcal")).toBe(1680);
    expect(normalizePercentage("104,5%")).toBe(104.5);
    expect(normalizePercentage("350%")).toBeNull();
  });

  it("normalizes ISO and Brazilian exam dates", () => {
    expect(normalizeExamDate("2026-06-02")).toBe("2026-06-02T00:00:00.000Z");
    expect(normalizeExamDate("02/06/2026")).toBe(
      "2026-06-02T00:00:00.000Z",
    );
    expect(normalizeExamDate("31/02/2026")).toBeNull();
  });
});
