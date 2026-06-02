const SAFE_FILENAME_PATTERN = /[^a-zA-Z0-9._-]+/g;

export interface BuildExamStoragePathInput {
  readonly filename: string;
  readonly uploadId: string;
  readonly userId: string;
}

export const EXAM_FILES_BUCKET = "exam-files";

export const buildExamStoragePath = ({
  filename,
  uploadId,
  userId,
}: BuildExamStoragePathInput) => {
  const normalizedFilename = sanitizeStorageFilename(filename);

  return `${userId}/${uploadId}/${normalizedFilename}`;
};

export const getStoragePathUserId = (storagePath: string) => {
  const [userId] = storagePath.split("/");

  return userId || null;
};

export const isExamStoragePathOwnedByUser = ({
  storagePath,
  userId,
}: {
  readonly storagePath: string;
  readonly userId: string;
}) => getStoragePathUserId(storagePath) === userId;

const sanitizeStorageFilename = (filename: string) => {
  const trimmedFilename = filename.trim();
  const safeFilename = trimmedFilename.replace(SAFE_FILENAME_PATTERN, "-");
  const collapsedFilename = safeFilename.replace(/-+/g, "-");

  return collapsedFilename || "exam-file";
};
