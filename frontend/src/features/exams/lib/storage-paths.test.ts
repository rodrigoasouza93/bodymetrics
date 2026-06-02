import { describe, expect, it } from "vitest";
import {
  buildExamStoragePath,
  getStoragePathUserId,
  isExamStoragePathOwnedByUser,
} from "./storage-paths.ts";

describe("exam storage paths", () => {
  it("builds paths with user id as the first segment", () => {
    const storagePath = buildExamStoragePath({
      filename: "bio exame 01.jpeg",
      uploadId: "upload-123",
      userId: "user-123",
    });

    expect(storagePath).toBe("user-123/upload-123/bio-exame-01.jpeg");
  });

  it("returns the owner segment from a storage path", () => {
    expect(
      getStoragePathUserId("user-123/upload-123/exam.pdf"),
    ).toBe("user-123");
  });

  it("matches storage paths only against their owner user", () => {
    expect(
      isExamStoragePathOwnedByUser({
        storagePath: "user-123/upload-123/exam.pdf",
        userId: "user-123",
      }),
    ).toBe(true);
    expect(
      isExamStoragePathOwnedByUser({
        storagePath: "user-123/upload-123/exam.pdf",
        userId: "user-456",
      }),
    ).toBe(false);
  });
});
