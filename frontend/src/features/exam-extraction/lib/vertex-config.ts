import "server-only";

interface VertexAiConfigBase {
  readonly maxInputBytes: number;
  readonly model: string;
  readonly timeoutMs: number;
}

export type VertexAiConfig =
  | (VertexAiConfigBase & {
      readonly apiKey: string;
      readonly authMode: "api_key";
    })
  | (VertexAiConfigBase & {
      readonly authMode: "oauth";
      readonly location: string;
      readonly project: string;
    });

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_INPUT_MB = 10;
const BYTES_PER_MB = 1024 * 1024;

export const getVertexAiConfig = (): VertexAiConfig | null => {
  const model = process.env.VERTEX_AI_GEMINI_MODEL?.trim();

  if (!model) {
    return null;
  }

  const apiKey = getVertexApiKey();

  if (apiKey) {
    return {
      apiKey,
      authMode: "api_key",
      maxInputBytes: getMaxInputBytes(),
      model,
      timeoutMs: getTimeoutMs(),
    };
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location = process.env.GOOGLE_CLOUD_LOCATION?.trim();

  if (!project || !location) {
    return null;
  }

  return {
    authMode: "oauth",
    location,
    maxInputBytes: getMaxInputBytes(),
    model,
    project,
    timeoutMs: getTimeoutMs(),
  };
};

export const getRequiredVertexAiConfig = () => {
  const config = getVertexAiConfig();

  if (!config) {
    throw new Error(
      "Configure VERTEX_AI_API_KEY e VERTEX_AI_GEMINI_MODEL (Vertex express), ou GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION e VERTEX_AI_GEMINI_MODEL (OAuth).",
    );
  }

  return config;
};

const getVertexApiKey = () => {
  for (const envName of ["VERTEX_AI_API_KEY", "GOOGLE_API_KEY"] as const) {
    const apiKey = process.env[envName]?.trim();

    if (apiKey) {
      return apiKey;
    }
  }

  return null;
};

const getMaxInputBytes = () =>
  getPositiveNumberEnv("VERTEX_AI_MAX_INPUT_MB", DEFAULT_MAX_INPUT_MB) *
  BYTES_PER_MB;

const getTimeoutMs = () =>
  getPositiveNumberEnv("VERTEX_AI_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);

const getPositiveNumberEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};
