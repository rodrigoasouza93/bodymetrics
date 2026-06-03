import { randomUUID } from "node:crypto";
import { createServerSupabaseClient } from "@/src/lib/supabase/server-client";
import type { CurrentSupabaseSession } from "@/src/lib/supabase/server-client";
import type { Json } from "@/src/types/database";
import { serializeExtractionPayload } from "@/src/features/exam-extraction/lib/mock-extraction-service";
import type { ConfiguredExamExtractionService } from "@/src/features/exam-extraction/lib/exam-extraction-provider";
import { createConfiguredExamExtractionService } from "@/src/features/exam-extraction/lib/exam-extraction-provider";
import type { ExamExtractionService } from "@/src/features/exam-extraction/lib/extraction-types";
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
  readonly extractionProvider: ConfiguredExamExtractionService["extractionProvider"];
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

const MIN_READABLE_CONFIDENCE = 0.4;
const DEFAULT_EXTRACTION_ERROR_MESSAGE =
  "Não foi possível extrair os dados do exame.";

const getExtractionErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return DEFAULT_EXTRACTION_ERROR_MESSAGE;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("insufficient_quota") ||
    message.includes("exceeded your current quota")
  ) {
    return "A cota da OpenAI foi excedida. Verifique billing e créditos da API.";
  }

  if (
    message.includes("invalid api key") ||
    message.includes("incorrect api key")
  ) {
    return "A chave da OpenAI é inválida. Revise OPENAI_API_KEY no .env.local.";
  }

  if (message.includes("model") && message.includes("not exist")) {
    return "O modelo configurado para extração não está disponível na OpenAI.";
  }

  if (
    message.includes("temperature") &&
    message.includes("unsupported")
  ) {
    return "O modelo configurado não aceita temperature=0. Atualize o serviço de extração ou troque o modelo.";
  }

  if (
    message.includes("não respondeu dentro de") ||
    message.includes("openai_exam_timeout_ms")
  ) {
    return error.message;
  }

  return DEFAULT_EXTRACTION_ERROR_MESSAGE;
};

export const createDefaultExamUploadServiceDependencies =
  (): ExamUploadServiceDependencies => ({
    createUploadId: randomUUID,
    ...createConfiguredExamExtractionService(),
    requestClient: createServerSupabaseClient(),
    uploadFileToStorage: uploadExamFileToStorage,
  });

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
        provider: dependencies.extractionProvider.name,
        providerModel: dependencies.extractionProvider.model,
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
  } catch (error) {
    const errorMessage = getExtractionErrorMessage(error);
    const upload = await updateExamUploadRecord({
      accessToken: session.accessToken,
      client: dependencies.requestClient,
      input: {
        errorMessage,
        status: "failed",
        uploadId,
        userId: session.user.id,
      },
    });

    return createJsonResponse(
      {
        error: upload.error_message ?? errorMessage,
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
