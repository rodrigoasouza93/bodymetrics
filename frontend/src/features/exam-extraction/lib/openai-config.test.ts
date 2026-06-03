import { afterEach, describe, expect, it, vi } from "vitest";
import { getOpenAiConfig } from "./openai-config.ts";

describe("OpenAI config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when the API key is missing", () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    expect(getOpenAiConfig()).toBeNull();
  });

  it("loads the OpenAI extraction configuration with defaults", () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");

    expect(getOpenAiConfig()).toEqual({
      apiKey: "openai-key",
      baseUrl: "https://api.openai.com/v1",
      maxInputBytes: 50 * 1024 * 1024,
      model: "gpt-4o",
      timeoutMs: 45_000,
    });
  });

  it("allows overrides for model, timeout and size", () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("OPENAI_EXAM_EXTRACTION_MODEL", "gpt-4o-mini");
    vi.stubEnv("OPENAI_EXAM_MAX_INPUT_MB", "12");
    vi.stubEnv("OPENAI_EXAM_TIMEOUT_MS", "1500");
    vi.stubEnv("OPENAI_BASE_URL", "https://example.openai.local/v1");

    expect(getOpenAiConfig()).toEqual({
      apiKey: "openai-key",
      baseUrl: "https://example.openai.local/v1",
      maxInputBytes: 12 * 1024 * 1024,
      model: "gpt-4o-mini",
      timeoutMs: 1500,
    });
  });

  it("uses a longer default timeout for gpt-5 models", () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("OPENAI_EXAM_EXTRACTION_MODEL", "gpt-5-nano");

    expect(getOpenAiConfig()?.timeoutMs).toBe(120_000);
  });
});
