import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadExamFileToStorage } from "./exam-file-storage.ts";

describe("uploadExamFileToStorage", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co/");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects uploads when Supabase config is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    await expect(
      uploadExamFileToStorage({
        accessToken: "access-token",
        body: Buffer.from("fixture"),
        mimeType: "application/pdf",
        storagePath: "user-1/upload-1/exam.pdf",
      }),
    ).rejects.toThrow(
      "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para habilitar a autenticação.",
    );
  });

  it("uploads exam files to the encoded Supabase Storage object path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
    } as Response);

    await uploadExamFileToStorage({
      accessToken: "access-token",
      body: Buffer.from("fixture"),
      mimeType: "application/pdf",
      storagePath: "user 1/upload 1/exame final.pdf",
    });

    const [, options] = fetchMock.mock.calls[0] ?? [];

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/storage/v1/object/exam-files/user%201/upload%201/exame%20final.pdf",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/pdf",
          apikey: "publishable-key",
        },
        method: "POST",
      }),
    );
    expect(options?.body).toBeInstanceOf(Blob);
    await expect((options?.body as Blob).text()).resolves.toBe("fixture");
  });

  it("throws a safe error when Supabase Storage rejects the upload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    await expect(
      uploadExamFileToStorage({
        accessToken: "access-token",
        body: Buffer.from("fixture"),
        mimeType: "image/jpeg",
        storagePath: "user-1/upload-1/exam.jpeg",
      }),
    ).rejects.toThrow("Não foi possível armazenar o arquivo do exame.");
  });
});
