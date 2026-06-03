import { afterEach, describe, expect, it, vi } from "vitest";
import { getRequiredVertexAiConfig, getVertexAiConfig } from "./vertex-config.ts";

describe("Vertex AI config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when the model is missing", () => {
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "");
    vi.stubEnv("VERTEX_AI_API_KEY", "vertex-key");

    expect(getVertexAiConfig()).toBeNull();
  });

  it("loads express mode config when an API key and model are configured", () => {
    vi.stubEnv("VERTEX_AI_API_KEY", "vertex-key");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "");

    expect(getVertexAiConfig()).toEqual({
      apiKey: "vertex-key",
      authMode: "api_key",
      maxInputBytes: 10 * 1024 * 1024,
      model: "gemini-2.5-flash",
      timeoutMs: 45_000,
    });
  });

  it("prefers VERTEX_AI_API_KEY over OAuth project settings", () => {
    vi.stubEnv("VERTEX_AI_API_KEY", "vertex-key");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");

    expect(getVertexAiConfig()?.authMode).toBe("api_key");
  });

  it("falls back to GOOGLE_API_KEY when VERTEX_AI_API_KEY is absent", () => {
    vi.stubEnv("VERTEX_AI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "google-key");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");

    expect(getVertexAiConfig()).toMatchObject({
      apiKey: "google-key",
      authMode: "api_key",
    });
  });

  it("loads OAuth config when project, location and model are configured", () => {
    vi.stubEnv("VERTEX_AI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");

    expect(getRequiredVertexAiConfig()).toEqual({
      authMode: "oauth",
      location: "us-central1",
      maxInputBytes: 10 * 1024 * 1024,
      model: "gemini-2.5-flash",
      project: "project-1",
      timeoutMs: 45_000,
    });
  });

  it("uses positive timeout and input size overrides", () => {
    vi.stubEnv("VERTEX_AI_API_KEY", "vertex-key");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");
    vi.stubEnv("VERTEX_AI_MAX_INPUT_MB", "2");
    vi.stubEnv("VERTEX_AI_TIMEOUT_MS", "1000");

    expect(getRequiredVertexAiConfig()).toMatchObject({
      maxInputBytes: 2 * 1024 * 1024,
      timeoutMs: 1000,
    });
  });
});
