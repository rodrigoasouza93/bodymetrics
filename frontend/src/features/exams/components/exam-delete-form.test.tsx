// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExamDeleteButton } from "./exam-delete-form";

const mocks = vi.hoisted(() => ({
  deleteExam: vi.fn(),
}));

vi.mock("../actions/exam-actions", () => ({
  deleteExam: mocks.deleteExam,
}));

describe("ExamDeleteButton", () => {
  beforeEach(() => {
    mocks.deleteExam.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not delete when confirmation is declined", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<ExamDeleteButton examDateLabel="03 de jun. de 2026" examId="exam-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir exame" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "Excluir o exame de 03 de jun. de 2026? Esta ação não pode ser desfeita.",
    );
    expect(mocks.deleteExam).not.toHaveBeenCalled();
  });

  it("deletes the selected exam after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mocks.deleteExam.mockResolvedValue(undefined);

    render(<ExamDeleteButton examDateLabel="03 de jun. de 2026" examId="exam-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir exame" }));

    await waitFor(() => {
      expect(mocks.deleteExam).toHaveBeenCalledOnce();
    });
    const formData = mocks.deleteExam.mock.calls[0]?.[0] as FormData;

    expect(formData.get("examId")).toBe("exam-1");
  });
});
