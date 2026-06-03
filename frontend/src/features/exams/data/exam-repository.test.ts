import { describe, expect, it } from "vitest";
import type {
  BodyCompositionExamRow,
  ExamSegmentalAnalysisRow,
} from "@/src/types/database";
import type { SupabaseRequestOptions } from "@/src/lib/supabase/types";
import { createExamRepository } from "./exam-repository.ts";

const examRow: BodyCompositionExamRow = {
  basal_metabolic_rate_kcal: 1680,
  bmi: 24.1,
  body_fat_mass_kg: 18,
  body_fat_percentage: 22.5,
  created_at: "2026-02-01T00:00:00.000Z",
  exam_performed_at: "2026-02-01T00:00:00.000Z",
  fat_control_kg: -2,
  fat_free_mass_kg: 60,
  id: "exam-1",
  ideal_weight_kg: 76,
  inbody_score: 82,
  minerals_kg: 3.2,
  muscle_control_kg: 1,
  obesity_degree_percentage: 105,
  protein_kg: 11,
  reviewed_payload: { source: "review" },
  skeletal_muscle_mass_kg: 33,
  total_body_water_l: 44,
  updated_at: "2026-02-01T00:00:00.000Z",
  upload_id: "upload-1",
  user_id: "user-1",
  visceral_fat_level: 7,
  waist_hip_ratio: 0.82,
  weight_control_kg: -1,
  weight_kg: 78,
};

const segmentalRow: ExamSegmentalAnalysisRow = {
  created_at: "2026-02-01T00:00:00.000Z",
  exam_id: "exam-1",
  fat_mass_kg: 1.2,
  fat_mass_percentage: 80,
  id: "segment-1",
  lean_mass_kg: 3.4,
  lean_mass_percentage: 102,
  segment: "left_arm",
  updated_at: "2026-02-01T00:00:00.000Z",
};

describe("exam repository", () => {
  it("lists exams with segmental analyses mapped to domain fields", async () => {
    const requests: Array<{
      readonly options?: SupabaseRequestOptions;
      readonly path: string;
    }> = [];
    const repository = createExamRepository({
      accessToken: "access-token",
      client: {
        request: async <ResponseBody>(
          path: string,
          options?: SupabaseRequestOptions,
        ) => {
          requests.push({ options, path });

          if (path.startsWith("/rest/v1/body_composition_exams")) {
            return [examRow] as ResponseBody;
          }

          return [segmentalRow] as ResponseBody;
        },
      },
    });

    const exams = await repository.listConfirmedExams("user-1");

    expect(exams).toHaveLength(1);
    expect(exams[0]?.weightKg).toBe(78);
    expect(exams[0]?.segmentalAnalyses).toEqual([
      {
        fatMassKg: 1.2,
        fatMassPercentage: 80,
        leanMassKg: 3.4,
        leanMassPercentage: 102,
        segment: "left_arm",
      },
    ]);
    expect(requests[0]?.options?.accessToken).toBe("access-token");
    expect(requests[1]?.path).toContain(
      "/rest/v1/exam_segmental_analyses?exam_id=in.(exam-1)",
    );
  });

  it("creates a confirmed exam, stores segmental analyses and marks the upload", async () => {
    const requests: Array<{
      readonly body: unknown;
      readonly options?: SupabaseRequestOptions;
      readonly path: string;
    }> = [];
    const repository = createExamRepository({
      client: {
        request: async <ResponseBody>(
          path: string,
          options?: SupabaseRequestOptions,
        ) => {
          requests.push({ body: options?.body, options, path });

          if (
            path.startsWith("/rest/v1/body_composition_exams") &&
            options?.method === "POST"
          ) {
            return [examRow] as ResponseBody;
          }

          if (
            path.startsWith("/rest/v1/body_composition_exams") &&
            options?.method !== "POST"
          ) {
            return [examRow] as ResponseBody;
          }

          if (path.startsWith("/rest/v1/exam_segmental_analyses?exam_id=in.")) {
            return [segmentalRow] as ResponseBody;
          }

          return [] as ResponseBody;
        },
      },
    });

    const exam = await repository.createConfirmedExam({
      exam: {
        basalMetabolicRateKcal: 1680,
        bmi: 24.1,
        bodyFatMassKg: 18,
        bodyFatPercentage: 22.5,
        examPerformedAt: "2026-02-01T00:00:00.000Z",
        fatControlKg: -2,
        fatFreeMassKg: 60,
        idealWeightKg: 76,
        inbodyScore: 82,
        mineralsKg: 3.2,
        muscleControlKg: 1,
        obesityDegreePercentage: 105,
        proteinKg: 11,
        segmentalAnalyses: [
          {
            fatMassKg: 1.2,
            fatMassPercentage: 80,
            leanMassKg: 3.4,
            leanMassPercentage: 102,
            segment: "left_arm",
          },
        ],
        skeletalMuscleMassKg: 33,
        totalBodyWaterL: 44,
        visceralFatLevel: 7,
        waistHipRatio: 0.82,
        weightControlKg: -1,
        weightKg: 78,
      },
      reviewedPayload: { source: "review" },
      uploadId: "upload-1",
      userId: "user-1",
    });

    expect(exam.id).toBe("exam-1");
    expect(requests.map((request) => request.options?.method)).toEqual([
      "POST",
      "DELETE",
      "POST",
      "PATCH",
      undefined,
      undefined,
    ]);
    expect(requests[0]?.body).toMatchObject({
      body_fat_mass_kg: 18,
      upload_id: "upload-1",
      user_id: "user-1",
      weight_kg: 78,
    });
    expect(requests[2]?.body).toEqual([
      {
        exam_id: "exam-1",
        fat_mass_kg: 1.2,
        fat_mass_percentage: 80,
        lean_mass_kg: 3.4,
        lean_mass_percentage: 102,
        segment: "left_arm",
      },
    ]);
    expect(requests[3]?.body).toEqual({ status: "confirmed" });
  });

  it("deletes a confirmed exam scoped to the authenticated user", async () => {
    const requests: Array<{
      readonly options?: SupabaseRequestOptions;
      readonly path: string;
    }> = [];
    const repository = createExamRepository({
      accessToken: "access-token",
      client: {
        request: async <ResponseBody>(
          path: string,
          options?: SupabaseRequestOptions,
        ) => {
          requests.push({ options, path });
          return [] as ResponseBody;
        },
      },
    });

    await repository.deleteConfirmedExam({
      examId: "exam-1",
      userId: "user-1",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.options?.method).toBe("DELETE");
    expect(requests[0]?.path).toBe(
      "/rest/v1/body_composition_exams?id=eq.exam-1&user_id=eq.user-1",
    );
    expect(requests[0]?.options?.accessToken).toBe("access-token");
  });
});
