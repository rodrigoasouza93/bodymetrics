import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createExamRepository: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  getProfileByUserId: vi.fn(),
  listConfirmedExams: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server-client", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

vi.mock("@/src/features/exams/data/exam-repository", () => ({
  createExamRepository: mocks.createExamRepository,
}));

vi.mock("@/src/features/profile/data/profile-repository", () => ({
  getProfileByUserId: mocks.getProfileByUserId,
}));

const client = { request: vi.fn() };
const session = {
  accessToken: "access-token",
  user: {
    email: "user@example.com",
    id: "user-1",
  },
};

const profile = {
  birth_date: "1991-03-12",
  created_at: "2026-06-01T00:00:00.000Z",
  fitness_goal: "Manter evolução",
  full_name: "User Example",
  height_cm: 180,
  id: "user-1",
  reference_weight_kg: 80,
  sex: "male" as const,
  updated_at: "2026-06-01T00:00:00.000Z",
};

const exam = {
  basalMetabolicRateKcal: 1680,
  bmi: 24.1,
  bodyFatMassKg: 18,
  bodyFatPercentage: 22.5,
  createdAt: "2026-06-02T00:00:00.000Z",
  examPerformedAt: "2026-06-02T00:00:00.000Z",
  fatControlKg: -2,
  fatFreeMassKg: 60,
  id: "exam-1",
  idealWeightKg: 76,
  inbodyScore: 82,
  mineralsKg: 3.2,
  muscleControlKg: 1,
  obesityDegreePercentage: 105,
  proteinKg: 11,
  reviewedPayload: { source: "review" },
  segmentalAnalyses: [],
  skeletalMuscleMassKg: 33,
  totalBodyWaterL: 44,
  updatedAt: "2026-06-02T00:00:00.000Z",
  uploadId: "upload-1",
  userId: "user-1",
  visceralFatLevel: 7,
  waistHipRatio: 0.82,
  weightControlKg: -1,
  weightKg: 78,
};

describe("loadDashboardContext", () => {
  beforeEach(() => {
    vi.resetModules();
    client.request.mockReset();
    mocks.createExamRepository.mockReset();
    mocks.createServerSupabaseClient.mockReset();
    mocks.getProfileByUserId.mockReset();
    mocks.listConfirmedExams.mockReset();
    mocks.createServerSupabaseClient.mockReturnValue(client);
    mocks.createExamRepository.mockReturnValue({
      listConfirmedExams: mocks.listConfirmedExams,
    });
  });

  it("loads profile values and confirmed exams for the current user", async () => {
    mocks.getProfileByUserId.mockResolvedValue(profile);
    mocks.listConfirmedExams.mockResolvedValue([exam]);
    const { loadDashboardContext } = await import("./load-dashboard-context.ts");

    const context = await loadDashboardContext(session);

    expect(context).toEqual({
      examCount: 1,
      exams: [exam],
      hasProfile: true,
      profile,
      profileValues: {
        birthDate: "1991-03-12",
        fitnessGoal: "Manter evolução",
        fullName: "User Example",
        heightCm: "180",
        referenceWeightKg: "80",
        sex: "male",
      },
    });
    expect(mocks.getProfileByUserId).toHaveBeenCalledWith({
      accessToken: "access-token",
      client,
      userId: "user-1",
    });
    expect(mocks.createExamRepository).toHaveBeenCalledWith({
      accessToken: "access-token",
      client,
    });
    expect(mocks.listConfirmedExams).toHaveBeenCalledWith("user-1");
  });

  it("uses empty profile state when profile loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mocks.getProfileByUserId.mockRejectedValue(new Error("Profile failed"));
    mocks.listConfirmedExams.mockResolvedValue([exam]);
    const { loadDashboardContext } = await import("./load-dashboard-context.ts");

    const context = await loadDashboardContext(session);

    expect(context.hasProfile).toBe(false);
    expect(context.profile).toBeNull();
    expect(context.profileValues).toEqual({
      birthDate: "",
      fitnessGoal: "",
      fullName: "",
      heightCm: "",
      referenceWeightKg: "",
      sex: "",
    });
    expect(context.exams).toEqual([exam]);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to load dashboard profile",
      expect.any(Error),
    );
  });

  it("uses an empty exam list when exam loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mocks.getProfileByUserId.mockResolvedValue(profile);
    mocks.listConfirmedExams.mockRejectedValue(new Error("Exams failed"));
    const { loadDashboardContext } = await import("./load-dashboard-context.ts");

    const context = await loadDashboardContext(session);

    expect(context.examCount).toBe(0);
    expect(context.exams).toEqual([]);
    expect(context.hasProfile).toBe(true);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to load dashboard exams",
      expect.any(Error),
    );
  });
});
