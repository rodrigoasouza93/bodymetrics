import { randomUUID } from "node:crypto";
import { createServerSupabaseClient } from "@/src/lib/supabase/server-client";
import type { CurrentSupabaseSession } from "@/src/lib/supabase/server-client";
import type { Json } from "@/src/types/database";
import { createMockExamExtractionService } from "@/src/features/exam-extraction/lib/mock-extraction-service";
import { serializeExtractionPayload } from "@/src/features/exam-extraction/lib/mock-extraction-service";
import type { ExamExtractionService } from "@/src/features/exam-extraction/lib/extraction-types";
import { getVertexAiConfig } from "@/src/features/exam-extraction/lib/vertex-config";
import { createVertexExamExtractionService } from "@/src/features/exam-extraction/lib/vertex-extraction-service";
import { buildExamStoragePath } from "../lib/storage-paths";
import {
  type AllowedExamMimeType,
  validateExamUploadFile,
} from "../lib/upload-validation";
import {
  createExamUploadRecord,
  getExamUploadById,
  updateExamUploadRecord,
} from "../data/exam-upload-repository";
import { uploadExamFileToStorage } from "../data/exam-file-storage";

export interface ExamUploadServiceDependencies {
  readonly createUploadId: () => string;
  readonly extractionService: ExamExtractionService;
  readonly requestClient: ReturnType<typeof createServerSupabaseClient>;
  readonly uploadFileToStorage: typeof uploadExamFileToStorage;
}

export interface ExamUploadResponseBody {
  readonly error?: string;
  readonly extractedFields?: Json;
  readonly extractedPayload?: Json | null;
  readonly fieldIssues?: Json;
  readonly overallConfidence?: number | null;
  readonly status?: string;
  readonly uploadId?: string;
}

const PROVIDER_NAME = "mock";
const PROVIDER_MODEL = "mock-fixture-v1";
const MIN_READABLE_CONFIDENCE = 0.4;

export const createDefaultExamUploadServiceDependencies =
  (): ExamUploadServiceDependencies => ({
    createUploadId: randomUUID,
    extractionService: createConfiguredExamExtractionService(),
    requestClient: createServerSupabaseClient(),
    uploadFileToStorage: uploadExamFileToStorage,
  });

const createConfiguredExamExtractionService = () => {
  const vertexConfig = getVertexAiConfig();

  if (!vertexConfig) {
    return createMockExamExtractionService();
  }

  return createVertexExamExtractionService({ config: vertexConfig });
};

export const handlePostExamUpload = async ({
  dependencies = createDefaultExamUploadServiceDependencies(),
  request,
  session,
}: {
  readonly dependencies?: ExamUploadServiceDependencies;
  readonly request: Request;
  readonly session: CurrentSupabaseSession | null;
}) => {
  if (!session) {
    return createJsonResponse(
      { error: "Entre na conta novamente para enviar exames." },
      401,
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return createJsonResponse(
      { error: "Envie um arquivo de exame para continuar." },
      400,
    );
  }

  const validation = validateExamUploadFile({ file });

  if (validation.error || !validation.mimeType) {
    return createJsonResponse({ error: validation.error ?? "Arquivo inválido." }, 400);
  }

  const uploadId = dependencies.createUploadId();
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const storagePath = buildExamStoragePath({
    filename: file.name,
    uploadId,
    userId: session.user.id,
  });

  try {
    await dependencies.uploadFileToStorage({
      accessToken: session.accessToken,
      body: fileBuffer,
      mimeType: validation.mimeType,
      storagePath,
    });
    await createExamUploadRecord({
      accessToken: session.accessToken,
      client: dependencies.requestClient,
      input: {
        fileSizeBytes: file.size,
        id: uploadId,
        mimeType: validation.mimeType,
        originalFilename: file.name,
        status: "processing",
        storagePath,
        userId: session.user.id,
      },
    });

    return extractAndPersistUpload({
      dependencies,
      fileBuffer,
      fileName: file.name,
      mimeType: validation.mimeType,
      session,
      uploadId,
    });
  } catch {
    return createJsonResponse(
      { error: "Não foi possível processar o upload do exame." },
      500,
    );
  }
};

export const handleGetExamUpload = async ({
  dependencies = createDefaultExamUploadServiceDependencies(),
  session,
  uploadId,
}: {
  readonly dependencies?: Pick<ExamUploadServiceDependencies, "requestClient">;
  readonly session: CurrentSupabaseSession | null;
  readonly uploadId: string;
}) => {
  if (!session) {
    return createJsonResponse(
      { error: "Entre na conta novamente para consultar o upload." },
      401,
    );
  }

  const upload = await getExamUploadById({
    accessToken: session.accessToken,
    client: dependencies.requestClient,
    uploadId,
    userId: session.user.id,
  });

  if (!upload) {
    return createJsonResponse({ error: "Upload não encontrado." }, 404);
  }

  return createJsonResponse({
    extractedPayload: upload.extracted_payload,
    overallConfidence: upload.overall_confidence,
    status: upload.status,
    uploadId: upload.id,
  });
};

const extractAndPersistUpload = async ({
  dependencies,
  fileBuffer,
  fileName,
  mimeType,
  session,
  uploadId,
}: {
  readonly dependencies: ExamUploadServiceDependencies;
  readonly fileBuffer: Buffer;
  readonly fileName: string;
  readonly mimeType: AllowedExamMimeType;
  readonly session: CurrentSupabaseSession;
  readonly uploadId: string;
}) => {
  try {
    const extractionResult = await dependencies.extractionService.extractExam({
      fileBuffer,
      mimeType,
      originalFilename: fileName,
    });
    const extractedPayload = serializeExtractionPayload(extractionResult);
    const status =
      extractionResult.overallConfidence < MIN_READABLE_CONFIDENCE
        ? "failed"
        : "needs_review";
    const errorMessage =
      status === "failed"
        ? "Não foi possível ler o exame com confiança suficiente."
        : null;

    const upload = await updateExamUploadRecord({
      accessToken: session.accessToken,
      client: dependencies.requestClient,
      input: {
        errorMessage,
        extractedPayload,
        overallConfidence: extractionResult.overallConfidence,
        provider: PROVIDER_NAME,
        providerModel: PROVIDER_MODEL,
        status,
        uploadId,
        userId: session.user.id,
      },
    });

    return createJsonResponse({
      error: upload.error_message ?? undefined,
      extractedFields: toJsonPayload(extractionResult.fields),
      extractedPayload: upload.extracted_payload,
      fieldIssues: toJsonPayload(extractionResult.fieldIssues),
      overallConfidence: upload.overall_confidence,
      status: upload.status,
      uploadId: upload.id,
    }, status === "failed" ? 422 : 200);
  } catch {
    const upload = await updateExamUploadRecord({
      accessToken: session.accessToken,
      client: dependencies.requestClient,
      input: {
        errorMessage: "Não foi possível extrair os dados do exame.",
        status: "failed",
        uploadId,
        userId: session.user.id,
      },
    });

    return createJsonResponse(
      {
        error: upload.error_message ?? "Não foi possível extrair os dados do exame.",
        status: upload.status,
        uploadId: upload.id,
      },
      500,
    );
  }
};

const createJsonResponse = (body: ExamUploadResponseBody, status = 200) =>
  Response.json(body, { status });

const toJsonPayload = (payload: unknown): Json =>
  JSON.parse(JSON.stringify(payload)) as Json;
