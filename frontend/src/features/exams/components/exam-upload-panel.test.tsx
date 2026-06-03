// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExamUploadPanel } from "./exam-upload-panel";

const mocks = vi.hoisted(() => ({
  cancelExamUpload: vi.fn(),
  confirmExamUpload: vi.fn(),
}));

vi.mock("../actions/exam-actions", () => ({
  cancelExamUpload: mocks.cancelExamUpload,
  confirmExamUpload: mocks.confirmExamUpload,
}));

const createUploadResponse = ({
  ok = true,
  result,
}: {
  readonly ok?: boolean;
  readonly result: Readonly<Record<string, unknown>>;
}) =>
  ({
    json: async () => result,
    ok,
  }) as Response;

const uploadFile = async (fileName = "bioimpedancia.pdf") => {
  render(<ExamUploadPanel />);

  fireEvent.change(screen.getByLabelText("Arquivo do exame"), {
    target: {
      files: [new File(["fixture"], fileName, { type: "application/pdf" })],
    },
  });

  await waitFor(() => {
    expect(screen.getByText(fileName)).toBeVisible();
  });

  fireEvent.click(screen.getByRole("button", { name: "Enviar exame" }));
};

describe("ExamUploadPanel", () => {
  beforeEach(() => {
    mocks.cancelExamUpload.mockReset();
    mocks.confirmExamUpload.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the initial upload state", () => {
    render(<ExamUploadPanel />);

    expect(
      screen.getByRole("heading", {
        name: "Envie uma imagem ou PDF de bioimpedância.",
      }),
    ).toBeVisible();
    expect(screen.getByText("Formatos aceitos: JPEG, PNG e PDF.")).toBeVisible();
    expect(screen.getByLabelText("Arquivo do exame")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,application/pdf",
    );
  });

  it("shows the selected file name before upload", async () => {
    render(<ExamUploadPanel />);

    fireEvent.change(screen.getByLabelText("Arquivo do exame"), {
      target: {
        files: [new File(["fixture"], "exame.png", { type: "image/png" })],
      },
    });

    expect(await screen.findByText("exame.png")).toBeVisible();
  });

  it("shows an upload error returned by the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createUploadResponse({
        ok: false,
        result: {
          error: "Envie uma imagem JPEG, PNG ou um PDF.",
        },
      }),
    );

    await uploadFile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Envie uma imagem JPEG, PNG ou um PDF.",
    );
  });

  it("renders review fields after a successful upload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createUploadResponse({
        result: {
          extractedFields: {
            examPerformedAt: { value: "2026-06-03" },
            weightKg: { value: 78.5 },
          },
          extractedPayload: { provider: "mock" },
          fieldIssues: [
            {
              field: "weightKg",
              message: "Confira o peso extraído.",
            },
          ],
          uploadId: "upload-1",
        },
      }),
    );

    await uploadFile("bio.jpeg");

    expect(
      await screen.findByRole("heading", {
        name: "Confira os dados antes de salvar no histórico.",
      }),
    ).toBeVisible();
    expect(screen.getByDisplayValue("2026-06-03")).toHaveAttribute(
      "name",
      "examPerformedAt",
    );
    expect(screen.getByDisplayValue("78,5")).toHaveAttribute("name", "weightKg");
    expect(screen.getByText("Confira o peso extraído.")).toBeVisible();
    expect(screen.getByDisplayValue(JSON.stringify({ provider: "mock" }))).toHaveAttribute(
      "name",
      "reviewedPayload",
    );
  });

  it("confirms a reviewed upload and resets the panel", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createUploadResponse({
        result: {
          extractedFields: {
            weightKg: { value: 78.5 },
          },
          extractedPayload: { provider: "mock" },
          uploadId: "upload-1",
        },
      }),
    );
    mocks.confirmExamUpload.mockResolvedValue(undefined);

    await uploadFile();
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar e salvar" }));

    await waitFor(() => {
      expect(mocks.confirmExamUpload).toHaveBeenCalledOnce();
    });
    const formData = mocks.confirmExamUpload.mock.calls[0]?.[0] as FormData;

    expect(formData.get("uploadId")).toBe("upload-1");
    expect(formData.get("weightKg")).toBe("78,5");
    await waitFor(() => {
      expect(screen.getByText("Formatos aceitos: JPEG, PNG e PDF.")).toBeVisible();
    });
  });

  it("keeps review visible and shows an error when cancellation fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createUploadResponse({
        result: {
          extractedFields: {},
          uploadId: "upload-1",
        },
      }),
    );
    mocks.cancelExamUpload.mockRejectedValue(new Error("Cancel failed"));

    await uploadFile();
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar cadastro" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível cancelar o cadastro.",
    );
    expect(
      screen.getByRole("heading", {
        name: "Confira os dados antes de salvar no histórico.",
      }),
    ).toBeVisible();
  });
});
