import "server-only";

export interface OpenAiConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly maxInputBytes: number;
  readonly model: string;
  readonly timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 45_000;
const GPT5_DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_INPUT_MB = 50;
const DEFAULT_MODEL = "gpt-4o";
const BYTES_PER_MB = 1024 * 1024;

export const getOpenAiDefaultTimeoutMs = (model: string) =>
  /^gpt-5/i.test(model) ? GPT5_DEFAULT_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

export const getOpenAiConfig = (): OpenAiConfig | null => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_EXAM_EXTRACTION_MODEL ?? DEFAULT_MODEL;

  return {
    apiKey,
    baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
      /\/$/,
      "",
    ),
    maxInputBytes:
      getPositiveNumberEnv("OPENAI_EXAM_MAX_INPUT_MB", DEFAULT_MAX_INPUT_MB) *
      BYTES_PER_MB,
    model,
    timeoutMs: getPositiveNumberEnv(
      "OPENAI_EXAM_TIMEOUT_MS",
      getOpenAiDefaultTimeoutMs(model),
    ),
  };
};

const getPositiveNumberEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};
