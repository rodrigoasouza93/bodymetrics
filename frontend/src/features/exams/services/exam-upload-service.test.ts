import { describe, expect, it, vi } from "vitest";
import type { ExamUploadRow } from "@/src/types/database";
import type { CurrentSupabaseSession } from "@/src/lib/supabase/server-client";
import type { SupabaseRequestOptions } from "@/src/lib/supabase/types";
import type { ExamExtractionService } from "@/src/features/exam-extraction/lib/extraction-types";
import { createMockExamExtractionService } from "@/src/features/exam-extraction/lib/mock-extraction-service";
import {
  handleGetExamUpload,
  handlePostExamUpload,
  type ExamUploadServiceDependencies,
} from "./exam-upload-service.ts";

const session: CurrentSupabaseSession = {
  accessToken: "access-token",
  user: {
    email: "user@example.com",
    id: "user-1",
  },
};

const uploadRow: ExamUploadRow = {
  created_at: "2026-06-02T12:00:00.000Z",
  error_message: null,
  extracted_payload: null,
  file_size_bytes: 4,
  id: "upload-1",
  mime_type: "image/jpeg",
  original_filename: "bio.jpeg",
  overall_confidence: null,
  provider: null,
  provider_model: null,
  status: "processing",
  storage_path: "user-1/upload-1/bio.jpeg",
  updated_at: "2026-06-02T12:00:00.000Z",
  user_id: "user-1",
};

interface RequestRecord {
  readonly body: unknown;
  readonly options?: SupabaseRequestOptions;
  readonly path: string;
}

const createUploadRequest = (file: File) => {
  const formData = new FormData();
  formData.set("file", file);

  return new Request("http://localhost/api/exam-uploads", {
    body: formData,
    method: "POST",
  });
};

const createDependencies = ({
  extractionService = createMockExamExtractionService(),
  rows = [],
}: {
  readonly extractionService?: ExamExtractionService;
  readonly rows?: readonly ExamUploadRow[];
} = {}) => {
  const requests: RequestRecord[] = [];
  const uploadFileToStorage = vi.fn<ExamUploadServiceDependencies["uploadFileToStorage"]>();
  const requestClient: ExamUploadServiceDependencies["requestClient"] = {
    request: async <ResponseBody>(
      path: string,
      options?: SupabaseRequestOptions,
    ) => {
      requests.push({ body: options?.body, options, path });

      if (options?.method === "PATCH") {
        const body = options.body as { readonly status: ExamUploadRow["status"] };
        return [
          {
            ...uploadRow,
            error_message:
              body.status === "failed"
                ? "Não foi possível extrair os dados do exame."
                : null,
            extracted_payload:
              body.status === "needs_review" ? { fixture: true } : null,
            overall_confidence:
              body.status === "needs_review" ? 0.92 : null,
            status: body.status,
          },
        ] as ResponseBody;
      }

      if (path.startsWith("/rest/v1/exam_uploads?id=eq.upload-1")) {
        return rows as ResponseBody;
      }

      return [uploadRow] as ResponseBody;
    },
  };

  return {
    dependencies: {
      createUploadId: () => "upload-1",
      extractionService,
      requestClient,
      uploadFileToStorage,
    } satisfies ExamUploadServiceDependencies,
    requests,
    uploadFileToStorage,
  };
};

describe("exam upload service", () => {
  it("rejects unauthenticated uploads", async () => {
    const { dependencies, uploadFileToStorage } = createDependencies();

    const response = await handlePostExamUpload({
      dependencies,
      request: createUploadRequest(
        new File(["test"], "bio.jpeg", { type: "image/jpeg" }),
      ),
      session: null,
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Entre na conta novamente para enviar exames.",
    });
    expect(uploadFileToStorage).not.toHaveBeenCalled();
  });

  it("rejects unsupported MIME types before persistence", async () => {
    const { dependencies, requests } = createDependencies();

    const response = await handlePostExamUpload({
      dependencies,
      request: createUploadRequest(
        new File(["test"], "bio.txt", { type: "text/plain" }),
      ),
      session,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Envie uma imagem JPEG, PNG ou um PDF.",
    });
    expect(requests).toEqual([]);
  });

  it("stores a valid upload and returns extracted payload for review", async () => {
    const { dependencies, requests, uploadFileToStorage } = createDependencies();

    const response = await handlePostExamUpload({
      dependencies,
      request: createUploadRequest(
        new File(["test"], "bio.jpeg", { type: "image/jpeg" }),
      ),
      session,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      overallConfidence: 0.92,
      status: "needs_review",
      uploadId: "upload-1",
    });
    expect(uploadFileToStorage).toHaveBeenCalledWith({
      accessToken: "access-token",
      body: expect.any(Buffer),
      mimeType: "image/jpeg",
      storagePath: "user-1/upload-1/bio.jpeg",
    });
    expect(requests.map((request) => request.options?.method)).toEqual([
      "POST",
      "PATCH",
    ]);
  });

  it("returns a safe failed status when extraction fails", async () => {
    const extractionService: ExamExtractionService = {
      extractExam: async () => {
        throw new Error("provider details");
      },
    };
    const { dependencies } = createDependencies({ extractionService });

    const response = await handlePostExamUpload({
      dependencies,
      request: createUploadRequest(
        new File(["test"], "bio.jpeg", { type: "image/jpeg" }),
      ),
      session,
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Não foi possível extrair os dados do exame.",
      status: "failed",
      uploadId: "upload-1",
    });
  });

  it("returns an unprocessable response when confidence is too low", async () => {
    const extractionService: ExamExtractionService = {
      extractExam: async () => {
        const result = await createMockExamExtractionService().extractExam({
          fileBuffer: Buffer.from("test"),
          mimeType: "image/jpeg",
          originalFilename: "bio.jpeg",
        });

        return {
          ...result,
          overallConfidence: 0.2,
        };
      },
    };
    const { dependencies } = createDependencies({ extractionService });

    const response = await handlePostExamUpload({
      dependencies,
      request: createUploadRequest(
        new File(["test"], "bio.jpeg", { type: "image/jpeg" }),
      ),
      session,
    });

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      status: "failed",
      uploadId: "upload-1",
    });
  });

  it("returns an upload only when it belongs to the authenticated user", async () => {
    const { dependencies } = createDependencies({
      rows: [{ ...uploadRow, status: "needs_review" }],
    });

    const response = await handleGetExamUpload({
      dependencies,
      session,
      uploadId: "upload-1",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "needs_review",
      uploadId: "upload-1",
    });
  });

  it("returns not found for missing uploads", async () => {
    const { dependencies } = createDependencies({ rows: [] });

    const response = await handleGetExamUpload({
      dependencies,
      session,
      uploadId: "upload-1",
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Upload não encontrado." });
  });
});
