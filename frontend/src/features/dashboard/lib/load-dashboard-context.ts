import { createServerSupabaseClient } from "@/src/lib/supabase/server-client";
import type { CurrentSupabaseSession } from "@/src/lib/supabase/server-client";
import { createExamRepository } from "@/src/features/exams/data/exam-repository";
import type { BodyCompositionExam } from "@/src/features/exams/lib/exam-types";
import { getProfileByUserId } from "@/src/features/profile/data/profile-repository";
import type { ProfileRow } from "@/src/types/database";
import { getProfileFormValuesFromRow } from "@/src/features/profile/lib/profile-validation";

export interface DashboardContext {
  readonly examCount: number;
  readonly exams: readonly BodyCompositionExam[];
  readonly hasProfile: boolean;
  readonly profile: ProfileRow | null;
  readonly profileValues: ReturnType<typeof getProfileFormValuesFromRow>;
}

export const loadDashboardContext = async (
  session: CurrentSupabaseSession,
): Promise<DashboardContext> => {
  const client = createServerSupabaseClient();
  const profile = await loadDashboardProfile({
    accessToken: session.accessToken,
    client,
    userId: session.user.id,
  });
  const exams = await loadDashboardExams({
    accessToken: session.accessToken,
    client,
    userId: session.user.id,
  });

  return {
    examCount: exams.length,
    exams,
    hasProfile: Boolean(profile),
    profile,
    profileValues: getProfileFormValuesFromRow(profile),
  };
};

const loadDashboardProfile = async ({
  accessToken,
  client,
  userId,
}: {
  readonly accessToken: string;
  readonly client: ReturnType<typeof createServerSupabaseClient>;
  readonly userId: string;
}) => {
  try {
    return await getProfileByUserId({ accessToken, client, userId });
  } catch (error) {
    console.error("Failed to load dashboard profile", error);
    return null;
  }
};

const loadDashboardExams = async ({
  accessToken,
  client,
  userId,
}: {
  readonly accessToken: string;
  readonly client: ReturnType<typeof createServerSupabaseClient>;
  readonly userId: string;
}) => {
  try {
    return await createExamRepository({
      accessToken,
      client,
    }).listConfirmedExams(userId);
  } catch (error) {
    console.error("Failed to load dashboard exams", error);
    return [];
  }
};
