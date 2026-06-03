import { describe, expect, it } from "vitest";
import { validateExamUploadFile } from "./upload-validation.ts";

describe("exam upload validation", () => {
  it("accepts supported exam files within the size limit", () => {
    const result = validateExamUploadFile({
      file: {
        name: "bio.jpeg",
        size: 1024,
        type: "image/jpeg",
      },
      maxFileSizeBytes: 2048,
    });

    expect(result).toEqual({ error: null, mimeType: "image/jpeg" });
  });

  it("rejects unsupported MIME types", () => {
    const result = validateExamUploadFile({
      file: {
        name: "bio.txt",
        size: 1024,
        type: "text/plain",
      },
    });

    expect(result.error).toBe("Envie uma imagem JPEG, PNG ou um PDF.");
    expect(result.mimeType).toBeNull();
  });

  it("rejects empty and oversized files", () => {
    expect(
      validateExamUploadFile({
        file: { name: "empty.pdf", size: 0, type: "application/pdf" },
      }).error,
    ).toBe("O arquivo enviado está vazio.");
    expect(
      validateExamUploadFile({
        file: { name: "large.pdf", size: 3000, type: "application/pdf" },
        maxFileSizeBytes: 2000,
      }).error,
    ).toBe("O arquivo excede o tamanho máximo permitido.");
  });
});
