import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cancelUploadRecord: vi.fn(),
  createExamRepository: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  deleteConfirmedExam: vi.fn(),
  getCurrentSession: vi.fn(),
  revalidatePath: vi.fn(),
  saveConfirmedExam: vi.fn(),
  updateConfirmedExam: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/src/lib/supabase/server-client", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
  getCurrentSession: mocks.getCurrentSession,
}));

vi.mock("../data/exam-repository", () => ({
  createExamRepository: mocks.createExamRepository,
}));

vi.mock("../data/exam-upload-repository", () => ({
  updateExamUploadRecord: mocks.cancelUploadRecord,
}));

const session = {
  accessToken: "access-token",
  user: {
    email: "user@example.com",
    id: "user-1",
  },
};

const client = { request: vi.fn() };

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
};

const createExamFormData = (values: Record<string, string> = {}) =>
  createFormData({
    examPerformedAt: "2026-06-03",
    reviewedPayload: JSON.stringify({ source: "extraction" }),
    uploadId: "upload-1",
    weightKg: "78,5",
    ...values,
  });

describe("exam actions", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.cancelUploadRecord.mockReset();
    mocks.createExamRepository.mockReset();
    mocks.createServerSupabaseClient.mockReset();
    mocks.deleteConfirmedExam.mockReset();
    mocks.getCurrentSession.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.saveConfirmedExam.mockReset();
    mocks.updateConfirmedExam.mockReset();
    client.request.mockReset();
    mocks.createServerSupabaseClient.mockReturnValue(client);
    mocks.createExamRepository.mockReturnValue({
      createConfirmedExam: mocks.saveConfirmedExam,
      deleteConfirmedExam: mocks.deleteConfirmedExam,
      updateConfirmedExam: mocks.updateConfirmedExam,
    });
  });

  it("does not confirm uploads without an authenticated session", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);
    const { confirmExamUpload } = await import("./exam-actions.ts");

    await confirmExamUpload(createExamFormData());

    expect(mocks.createExamRepository).not.toHaveBeenCalled();
    expect(mocks.saveConfirmedExam).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("confirms a reviewed exam upload for the current user", async () => {
    mocks.getCurrentSession.mockResolvedValue(session);
    const { confirmExamUpload } = await import("./exam-actions.ts");

    await confirmExamUpload(createExamFormData());

    expect(mocks.createExamRepository).toHaveBeenCalledWith({
      accessToken: "access-token",
      client,
    });
    expect(mocks.saveConfirmedExam).toHaveBeenCalledWith(
      expect.objectContaining({
        exam: expect.objectContaining({
          examPerformedAt: "2026-06-03T00:00:00.000Z",
          weightKg: 78.5,
        }),
        reviewedPayload: {
          originalPayload: { source: "extraction" },
          reviewedFields: expect.objectContaining({
            examPerformedAt: "2026-06-03T00:00:00.000Z",
            weightKg: 78.5,
          }),
        },
        uploadId: "upload-1",
        userId: "user-1",
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("updates a confirmed exam and revalidates the dashboard", async () => {
    mocks.getCurrentSession.mockResolvedValue(session);
    const { updateExam } = await import("./exam-actions.ts");

    await updateExam(
      createExamFormData({
        examId: "exam-1",
        skeletalMuscleMassKg: "33.2",
      }),
    );

    expect(mocks.updateConfirmedExam).toHaveBeenCalledWith(
      expect.objectContaining({
        exam: expect.objectContaining({
          skeletalMuscleMassKg: 33.2,
          weightKg: 78.5,
        }),
        examId: "exam-1",
        userId: "user-1",
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("deletes a confirmed exam scoped to the current user", async () => {
    mocks.getCurrentSession.mockResolvedValue(session);
    const { deleteExam } = await import("./exam-actions.ts");

    await deleteExam(createFormData({ examId: "exam-1" }));

    expect(mocks.deleteConfirmedExam).toHaveBeenCalledWith({
      examId: "exam-1",
      userId: "user-1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("cancels a pending upload record", async () => {
    mocks.getCurrentSession.mockResolvedValue(session);
    const { cancelExamUpload } = await import("./exam-actions.ts");

    await cancelExamUpload(createFormData({ uploadId: "upload-1" }));

    expect(mocks.cancelUploadRecord).toHaveBeenCalledWith({
      accessToken: "access-token",
      client,
      input: {
        status: "cancelled",
        uploadId: "upload-1",
        userId: "user-1",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });
});
