import type {
  BodyCompositionExamRow,
  ExamSegmentalAnalysisRow,
} from "@/src/types/database";
import type { SupabaseRequestOptions } from "@/src/lib/supabase/types";
import type {
  BodyCompositionExamInput,
  ConfirmExamInput,
  DeleteExamInput,
  ExamRepository,
  UpdateExamInput,
} from "../lib/exam-types";
import {
  mapExamInputToRowPayload,
  mapExamInputToUpdatePayload,
  mapExamRowToDomain,
  mapSegmentalInputToRowPayload,
} from "../lib/exam-types";

interface SupabaseRequestClient {
  readonly request: <ResponseBody>(
    path: string,
    options?: SupabaseRequestOptions,
  ) => Promise<ResponseBody>;
}

export interface ExamRepositoryOptions {
  readonly accessToken?: string;
  readonly client: SupabaseRequestClient;
}

const EXAM_SELECT = [
  "id",
  "user_id",
  "upload_id",
  "exam_performed_at",
  "weight_kg",
  "skeletal_muscle_mass_kg",
  "body_fat_mass_kg",
  "body_fat_percentage",
  "bmi",
  "inbody_score",
  "total_body_water_l",
  "protein_kg",
  "minerals_kg",
  "fat_free_mass_kg",
  "basal_metabolic_rate_kcal",
  "waist_hip_ratio",
  "visceral_fat_level",
  "obesity_degree_percentage",
  "ideal_weight_kg",
  "weight_control_kg",
  "fat_control_kg",
  "muscle_control_kg",
  "reviewed_payload",
  "created_at",
  "updated_at",
].join(",");

const SEGMENTAL_SELECT = [
  "id",
  "exam_id",
  "segment",
  "lean_mass_kg",
  "lean_mass_percentage",
  "fat_mass_kg",
  "fat_mass_percentage",
  "created_at",
  "updated_at",
].join(",");

export const createExamRepository = ({
  accessToken,
  client,
}: ExamRepositoryOptions): ExamRepository => ({
  createConfirmedExam: (input) =>
    createConfirmedExam({ accessToken, client, input }),
  deleteConfirmedExam: (input) =>
    deleteConfirmedExam({ accessToken, client, input }),
  getExamById: (input) => getExamById({ accessToken, client, input }),
  listConfirmedExams: (userId) =>
    listConfirmedExams({ accessToken, client, userId }),
  updateConfirmedExam: (input) =>
    updateConfirmedExam({ accessToken, client, input }),
});

const listConfirmedExams = async ({
  accessToken,
  client,
  userId,
}: ExamRepositoryOptions & {
  readonly userId: string;
}) => {
  const path = [
    `/rest/v1/body_composition_exams?user_id=eq.${encodeURIComponent(userId)}`,
    `select=${EXAM_SELECT}`,
    "order=exam_performed_at.asc.nullslast,created_at.asc",
  ].join("&");
  const rows = await client.request<readonly BodyCompositionExamRow[]>(path, {
    accessToken,
  });
  const segmentalRows = await listSegmentalAnalyses({
    accessToken,
    client,
    examIds: rows.map((row) => row.id),
  });

  return rows.map((row) =>
    mapExamRowToDomain({
      row,
      segmentalAnalyses: segmentalRows.filter(
        (segmentalRow) => segmentalRow.exam_id === row.id,
      ),
    }),
  );
};

const getExamById = async ({
  accessToken,
  client,
  input,
}: ExamRepositoryOptions & {
  readonly input: {
    readonly examId: string;
    readonly userId: string;
  };
}) => {
  const rows = await client.request<readonly BodyCompositionExamRow[]>(
    [
      `/rest/v1/body_composition_exams?id=eq.${encodeURIComponent(input.examId)}`,
      `user_id=eq.${encodeURIComponent(input.userId)}`,
      `select=${EXAM_SELECT}`,
      "limit=1",
    ].join("&"),
    { accessToken },
  );
  const row = rows[0];

  if (!row) {
    return null;
  }

  const segmentalRows = await listSegmentalAnalyses({
    accessToken,
    client,
    examIds: [row.id],
  });

  return mapExamRowToDomain({ row, segmentalAnalyses: segmentalRows });
};

const createConfirmedExam = async ({
  accessToken,
  client,
  input,
}: ExamRepositoryOptions & {
  readonly input: ConfirmExamInput;
}) => {
  const rows = await client.request<readonly BodyCompositionExamRow[]>(
    `/rest/v1/body_composition_exams?select=${EXAM_SELECT}`,
    {
      accessToken,
      body: mapExamInputToRowPayload(input),
      headers: { Prefer: "return=representation" },
      method: "POST",
    },
  );
  const row = getRequiredExamRow(rows);

  await replaceSegmentalAnalyses({
    accessToken,
    client,
    exam: input.exam,
    examId: row.id,
  });
  await markUploadAsConfirmed({ accessToken, client, uploadId: input.uploadId });

  return getRequiredExamById({
    accessToken,
    client,
    examId: row.id,
    userId: input.userId,
  });
};

const deleteConfirmedExam = async ({
  accessToken,
  client,
  input,
}: ExamRepositoryOptions & {
  readonly input: DeleteExamInput;
}) => {
  await client.request<Record<string, never>>(
    [
      `/rest/v1/body_composition_exams?id=eq.${encodeURIComponent(input.examId)}`,
      `user_id=eq.${encodeURIComponent(input.userId)}`,
    ].join("&"),
    { accessToken, method: "DELETE" },
  );
};

const updateConfirmedExam = async ({
  accessToken,
  client,
  input,
}: ExamRepositoryOptions & {
  readonly input: UpdateExamInput;
}) => {
  const rows = await client.request<readonly BodyCompositionExamRow[]>(
    [
      `/rest/v1/body_composition_exams?id=eq.${encodeURIComponent(input.examId)}`,
      `user_id=eq.${encodeURIComponent(input.userId)}`,
      `select=${EXAM_SELECT}`,
    ].join("&"),
    {
      accessToken,
      body: mapExamInputToUpdatePayload({
        exam: input.exam,
        reviewedPayload: input.reviewedPayload,
        userId: input.userId,
      }),
      headers: { Prefer: "return=representation" },
      method: "PATCH",
    },
  );
  const row = getRequiredExamRow(rows);

  await replaceSegmentalAnalyses({
    accessToken,
    client,
    exam: input.exam,
    examId: row.id,
  });

  return getRequiredExamById({
    accessToken,
    client,
    examId: row.id,
    userId: input.userId,
  });
};

const getRequiredExamById = async ({
  accessToken,
  client,
  examId,
  userId,
}: ExamRepositoryOptions & {
  readonly examId: string;
  readonly userId: string;
}) => {
  const exam = await getExamById({
    accessToken,
    client,
    input: { examId, userId },
  });

  if (!exam) {
    throw new Error("Não foi possível carregar o exame salvo.");
  }

  return exam;
};

const listSegmentalAnalyses = async ({
  accessToken,
  client,
  examIds,
}: ExamRepositoryOptions & {
  readonly examIds: readonly string[];
}) => {
  if (examIds.length === 0) {
    return [];
  }

  const encodedIds = examIds.map(encodeURIComponent).join(",");

  return client.request<readonly ExamSegmentalAnalysisRow[]>(
    `/rest/v1/exam_segmental_analyses?exam_id=in.(${encodedIds})&select=${SEGMENTAL_SELECT}`,
    { accessToken },
  );
};

const replaceSegmentalAnalyses = async ({
  accessToken,
  client,
  exam,
  examId,
}: ExamRepositoryOptions & {
  readonly exam: BodyCompositionExamInput;
  readonly examId: string;
}) => {
  await client.request<Record<string, never>>(
    `/rest/v1/exam_segmental_analyses?exam_id=eq.${encodeURIComponent(examId)}`,
    { accessToken, method: "DELETE" },
  );

  if (exam.segmentalAnalyses.length === 0) {
    return;
  }

  await client.request<readonly ExamSegmentalAnalysisRow[]>(
    `/rest/v1/exam_segmental_analyses?select=${SEGMENTAL_SELECT}`,
    {
      accessToken,
      body: exam.segmentalAnalyses.map((segmentalAnalysis) =>
        mapSegmentalInputToRowPayload({ examId, segmentalAnalysis }),
      ),
      headers: { Prefer: "return=representation" },
      method: "POST",
    },
  );
};

const markUploadAsConfirmed = async ({
  accessToken,
  client,
  uploadId,
}: ExamRepositoryOptions & {
  readonly uploadId: string;
}) => {
  await client.request<readonly { readonly id: string }[]>(
    `/rest/v1/exam_uploads?id=eq.${encodeURIComponent(uploadId)}&select=id`,
    {
      accessToken,
      body: { status: "confirmed" },
      headers: { Prefer: "return=minimal" },
      method: "PATCH",
    },
  );
};

const getRequiredExamRow = (rows: readonly BodyCompositionExamRow[]) => {
  const row = rows[0];

  if (!row) {
    throw new Error("Não foi possível salvar o exame.");
  }

  return row;
};
