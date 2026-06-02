export type Json =
  | boolean
  | null
  | number
  | string
  | { readonly [key: string]: Json | undefined }
  | readonly Json[];

export type ProfileSex = "female" | "male" | "other" | "prefer_not_to_say";

export type ExamUploadStatus =
  | "cancelled"
  | "confirmed"
  | "failed"
  | "needs_review"
  | "processing"
  | "uploaded";

export type ExamSegment =
  | "left_arm"
  | "left_leg"
  | "right_arm"
  | "right_leg"
  | "trunk";

export interface ProfileRow {
  readonly birth_date: string | null;
  readonly created_at: string;
  readonly fitness_goal: string | null;
  readonly full_name: string | null;
  readonly height_cm: number | null;
  readonly id: string;
  readonly reference_weight_kg: number | null;
  readonly sex: ProfileSex | null;
  readonly updated_at: string;
}

export interface ExamUploadRow {
  readonly created_at: string;
  readonly error_message: string | null;
  readonly extracted_payload: Json | null;
  readonly file_size_bytes: number;
  readonly id: string;
  readonly mime_type: "application/pdf" | "image/jpeg" | "image/png";
  readonly original_filename: string;
  readonly overall_confidence: number | null;
  readonly provider: string | null;
  readonly provider_model: string | null;
  readonly status: ExamUploadStatus;
  readonly storage_path: string;
  readonly updated_at: string;
  readonly user_id: string;
}

export interface BodyCompositionExamRow {
  readonly basal_metabolic_rate_kcal: number | null;
  readonly bmi: number | null;
  readonly body_fat_mass_kg: number | null;
  readonly body_fat_percentage: number | null;
  readonly created_at: string;
  readonly exam_performed_at: string | null;
  readonly fat_control_kg: number | null;
  readonly fat_free_mass_kg: number | null;
  readonly id: string;
  readonly ideal_weight_kg: number | null;
  readonly inbody_score: number | null;
  readonly minerals_kg: number | null;
  readonly muscle_control_kg: number | null;
  readonly obesity_degree_percentage: number | null;
  readonly protein_kg: number | null;
  readonly reviewed_payload: Json | null;
  readonly skeletal_muscle_mass_kg: number | null;
  readonly total_body_water_l: number | null;
  readonly updated_at: string;
  readonly upload_id: string;
  readonly user_id: string;
  readonly visceral_fat_level: number | null;
  readonly waist_hip_ratio: number | null;
  readonly weight_control_kg: number | null;
  readonly weight_kg: number | null;
}

export interface ExamSegmentalAnalysisRow {
  readonly created_at: string;
  readonly exam_id: string;
  readonly fat_mass_kg: number | null;
  readonly fat_mass_percentage: number | null;
  readonly id: string;
  readonly lean_mass_kg: number | null;
  readonly lean_mass_percentage: number | null;
  readonly segment: ExamSegment;
  readonly updated_at: string;
}

export interface Database {
  readonly public: {
    readonly Enums: {
      readonly exam_segment: ExamSegment;
      readonly exam_upload_status: ExamUploadStatus;
      readonly profile_sex: ProfileSex;
    };
    readonly Tables: {
      readonly body_composition_exams: {
        readonly Row: BodyCompositionExamRow;
      };
      readonly exam_segmental_analyses: {
        readonly Row: ExamSegmentalAnalysisRow;
      };
      readonly exam_uploads: {
        readonly Row: ExamUploadRow;
      };
      readonly profiles: {
        readonly Row: ProfileRow;
      };
    };
  };
}
