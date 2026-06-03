import type { ExamUploadRow, ExamUploadStatus, Json } from "@/src/types/database";
import type { SupabaseRequestOptions } from "@/src/lib/supabase/types";

interface SupabaseRequestClient {
  readonly request: <ResponseBody>(
    path: string,
    options?: SupabaseRequestOptions,
  ) => Promise<ResponseBody>;
}

export interface ExamUploadRepositoryOptions {
  readonly accessToken?: string;
  readonly client: SupabaseRequestClient;
}

export interface CreateExamUploadInput {
  readonly fileSizeBytes: number;
  readonly id: string;
  readonly mimeType: ExamUploadRow["mime_type"];
  readonly originalFilename: string;
  readonly status: ExamUploadStatus;
  readonly storagePath: string;
  readonly userId: string;
}

export interface UpdateExamUploadInput {
  readonly errorMessage?: string | null;
  readonly extractedPayload?: Json | null;
  readonly overallConfidence?: number | null;
  readonly provider?: string | null;
  readonly providerModel?: string | null;
  readonly status: ExamUploadStatus;
  readonly uploadId: string;
  readonly userId: string;
}

const UPLOAD_SELECT = [
  "id",
  "user_id",
  "storage_path",
  "original_filename",
  "mime_type",
  "file_size_bytes",
  "status",
  "provider",
  "provider_model",
  "overall_confidence",
  "extracted_payload",
  "error_message",
  "created_at",
  "updated_at",
].join(",");

export const createExamUploadRecord = async ({
  accessToken,
  client,
  input,
}: ExamUploadRepositoryOptions & {
  readonly input: CreateExamUploadInput;
}) => {
  const rows = await client.request<readonly ExamUploadRow[]>(
    `/rest/v1/exam_uploads?select=${UPLOAD_SELECT}`,
    {
      accessToken,
      body: {
        file_size_bytes: input.fileSizeBytes,
        id: input.id,
        mime_type: input.mimeType,
        original_filename: input.originalFilename,
        status: input.status,
        storage_path: input.storagePath,
        user_id: input.userId,
      },
      headers: { Prefer: "return=representation" },
      method: "POST",
    },
  );

  return getRequiredUploadRow(rows);
};

export const getExamUploadById = async ({
  accessToken,
  client,
  uploadId,
  userId,
}: ExamUploadRepositoryOptions & {
  readonly uploadId: string;
  readonly userId: string;
}) => {
  const rows = await client.request<readonly ExamUploadRow[]>(
    [
      `/rest/v1/exam_uploads?id=eq.${encodeURIComponent(uploadId)}`,
      `user_id=eq.${encodeURIComponent(userId)}`,
      `select=${UPLOAD_SELECT}`,
      "limit=1",
    ].join("&"),
    { accessToken },
  );

  return rows[0] ?? null;
};

export const updateExamUploadRecord = async ({
  accessToken,
  client,
  input,
}: ExamUploadRepositoryOptions & {
  readonly input: UpdateExamUploadInput;
}) => {
  const rows = await client.request<readonly ExamUploadRow[]>(
    [
      `/rest/v1/exam_uploads?id=eq.${encodeURIComponent(input.uploadId)}`,
      `user_id=eq.${encodeURIComponent(input.userId)}`,
      `select=${UPLOAD_SELECT}`,
    ].join("&"),
    {
      accessToken,
      body: {
        error_message: input.errorMessage ?? null,
        extracted_payload: input.extractedPayload ?? null,
        overall_confidence: input.overallConfidence ?? null,
        provider: input.provider ?? null,
        provider_model: input.providerModel ?? null,
        status: input.status,
      },
      headers: { Prefer: "return=representation" },
      method: "PATCH",
    },
  );

  return getRequiredUploadRow(rows);
};

const getRequiredUploadRow = (rows: readonly ExamUploadRow[]) => {
  const row = rows[0];

  if (!row) {
    throw new Error("Não foi possível salvar o upload do exame.");
  }

  return row;
};
