import { afterEach, describe, expect, it, vi } from "vitest";
import { createConfiguredExamExtractionService } from "./exam-extraction-provider.ts";

describe("configured exam extraction provider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses OpenAI when the API key is configured and no provider override exists", () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");

    const configured = createConfiguredExamExtractionService();

    expect(configured.extractionProvider).toEqual({
      model: "gpt-4o",
      name: "openai",
    });
  });

  it("uses Vertex when requested even if OpenAI is configured", () => {
    vi.stubEnv("EXAM_EXTRACTION_PROVIDER", "vertex");
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");

    const configured = createConfiguredExamExtractionService();

    expect(configured.extractionProvider).toEqual({
      model: "gemini-2.5-flash",
      name: "vertex",
    });
  });

  it("uses the mock provider when explicitly requested", () => {
    vi.stubEnv("EXAM_EXTRACTION_PROVIDER", "mock");
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "project-1");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "us-central1");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");

    const configured = createConfiguredExamExtractionService();

    expect(configured.extractionProvider).toEqual({
      model: "mock-fixture-v1",
      name: "mock",
    });
  });

  it("falls back to Vertex with API key and then mock when OpenAI is unavailable", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("VERTEX_AI_API_KEY", "vertex-key");
    vi.stubEnv("VERTEX_AI_GEMINI_MODEL", "gemini-2.5-flash");
    vi.stubEnv("GOOGLE_CLOUD_PROJECT", "");
    vi.stubEnv("GOOGLE_CLOUD_LOCATION", "");

    expect(createConfiguredExamExtractionService().extractionProvider).toEqual({
      model: "gemini-2.5-flash",
      name: "vertex",
    });

    vi.stubEnv("VERTEX_AI_API_KEY", "");

    expect(createConfiguredExamExtractionService().extractionProvider.name).toBe(
      "mock",
    );
  });
});
