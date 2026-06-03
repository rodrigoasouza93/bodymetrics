import "server-only";

export interface VertexAiConfig {
  readonly location: string;
  readonly maxInputBytes: number;
  readonly model: string;
  readonly project: string;
  readonly timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_INPUT_MB = 10;
const BYTES_PER_MB = 1024 * 1024;

export const getVertexAiConfig = (): VertexAiConfig | null => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION;
  const model = process.env.VERTEX_AI_GEMINI_MODEL;

  if (!project || !location || !model) {
    return null;
  }

  return {
    location,
    maxInputBytes: getPositiveNumberEnv(
      "VERTEX_AI_MAX_INPUT_MB",
      DEFAULT_MAX_INPUT_MB,
    ) * BYTES_PER_MB,
    model,
    project,
    timeoutMs: getPositiveNumberEnv(
      "VERTEX_AI_TIMEOUT_MS",
      DEFAULT_TIMEOUT_MS,
    ),
  };
};

export const getRequiredVertexAiConfig = () => {
  const config = getVertexAiConfig();

  if (!config) {
    throw new Error(
      "Configure GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION e VERTEX_AI_GEMINI_MODEL.",
    );
  }

  return config;
};

const getPositiveNumberEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};
