export const ALLOWED_EXAM_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type AllowedExamMimeType = (typeof ALLOWED_EXAM_MIME_TYPES)[number];

export interface ExamUploadFile {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface ExamUploadValidationResult {
  readonly error: string | null;
  readonly mimeType: AllowedExamMimeType | null;
}

const DEFAULT_MAX_FILE_SIZE_MB = 10;
const BYTES_PER_MB = 1024 * 1024;

export const getMaxExamFileSizeBytes = () => {
  const configuredValue = Number(process.env.MAX_EXAM_FILE_SIZE_MB);
  const maxSizeMb =
    Number.isFinite(configuredValue) && configuredValue > 0
      ? configuredValue
      : DEFAULT_MAX_FILE_SIZE_MB;

  return maxSizeMb * BYTES_PER_MB;
};

export const validateExamUploadFile = ({
  file,
  maxFileSizeBytes = getMaxExamFileSizeBytes(),
}: {
  readonly file: ExamUploadFile | null;
  readonly maxFileSizeBytes?: number;
}): ExamUploadValidationResult => {
  if (!file) {
    return {
      error: "Envie um arquivo de exame para continuar.",
      mimeType: null,
    };
  }

  if (!isAllowedExamMimeType(file.type)) {
    return {
      error: "Envie uma imagem JPEG, PNG ou um PDF.",
      mimeType: null,
    };
  }

  if (file.size <= 0) {
    return {
      error: "O arquivo enviado está vazio.",
      mimeType: null,
    };
  }

  if (file.size > maxFileSizeBytes) {
    return {
      error: "O arquivo excede o tamanho máximo permitido.",
      mimeType: null,
    };
  }

  return { error: null, mimeType: file.type };
};

export const isAllowedExamMimeType = (
  mimeType: string,
): mimeType is AllowedExamMimeType =>
  ALLOWED_EXAM_MIME_TYPES.includes(mimeType as AllowedExamMimeType);
