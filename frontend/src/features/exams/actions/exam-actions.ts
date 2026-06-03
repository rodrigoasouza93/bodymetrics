"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  getCurrentSession,
} from "@/src/lib/supabase/server-client";
import type { Json } from "@/src/types/database";
import { createExamRepository } from "../data/exam-repository";
import { updateExamUploadRecord } from "../data/exam-upload-repository";
import {
  readExamInputFromFormData,
  readRequiredString,
  readReviewedPayloadFromFormData,
} from "../lib/exam-form";

export const confirmExamUpload = async (formData: FormData) => {
  const session = await getCurrentSession();

  if (!session) {
    return;
  }

  const uploadId = readRequiredString(formData, "uploadId");
  const repository = createExamRepository({
    accessToken: session.accessToken,
    client: createServerSupabaseClient(),
  });
  const exam = readExamInputFromFormData(formData);

  await repository.createConfirmedExam({
    exam,
    reviewedPayload: toJsonPayload({
      originalPayload: readReviewedPayloadFromFormData(formData),
      reviewedFields: exam,
    }),
    uploadId,
    userId: session.user.id,
  });
  revalidatePath("/dashboard");
};

export const updateExam = async (formData: FormData) => {
  const session = await getCurrentSession();

  if (!session) {
    return;
  }

  const examId = readRequiredString(formData, "examId");
  const repository = createExamRepository({
    accessToken: session.accessToken,
    client: createServerSupabaseClient(),
  });
  const exam = readExamInputFromFormData(formData);

  await repository.updateConfirmedExam({
    exam,
    examId,
    reviewedPayload: toJsonPayload({
      originalPayload: readReviewedPayloadFromFormData(formData),
      reviewedFields: exam,
    }),
    userId: session.user.id,
  });
  revalidatePath("/dashboard");
};

const toJsonPayload = (payload: unknown): Json =>
  JSON.parse(JSON.stringify(payload)) as Json;

export const cancelExamUpload = async (formData: FormData) => {
  const session = await getCurrentSession();

  if (!session) {
    return;
  }

  await updateExamUploadRecord({
    accessToken: session.accessToken,
    client: createServerSupabaseClient(),
    input: {
      status: "cancelled",
      uploadId: readRequiredString(formData, "uploadId"),
      userId: session.user.id,
    },
  });
  revalidatePath("/dashboard");
};
