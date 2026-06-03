import { afterEach, describe, expect, it, vi } from "vitest";
import { getRequiredVertexAiConfig, getVertexAiConfig } from "./vertex-config.ts";

describe("Vertex AI config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when required provider env vars are missing", () => {
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "");

    expect(getVertexAiConfig()).toBeNull();
  });

  it("loads required provider env vars with safe defaults", () => {
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");

    expect(getRequiredVertexAiConfig()).toEqual({
      location: "us-central1",
      maxInputBytes: 10 * 1024 * 1024,
      model: "gemini-2.5-flash",
      project: "project-1",
      timeoutMs: 45_000,
    });
  });

  it("uses positive timeout and input size overrides", () => {
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");
    vi.stubEnv("VERTEX_AI_MAX_INPUT_MB", "2");
    vi.stubEnv("VERTEX_AI_TIMEOUT_MS", "1000");

    expect(getRequiredVertexAiConfig()).toMatchObject({
      maxInputBytes: 2 * 1024 * 1024,
      timeoutMs: 1000,
    });
  });
});
