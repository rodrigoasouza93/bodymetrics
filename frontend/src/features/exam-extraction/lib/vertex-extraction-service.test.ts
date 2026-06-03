import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createVertexExamExtractionService } from "./vertex-extraction-service.ts";
import type { VertexAiConfig } from "./vertex-config";

const oauthConfig: VertexAiConfig = {
  authMode: "oauth",
  location: "us-central1",
  maxInputBytes: 10 * 1024 * 1024,
  model: "gemini-2.5-flash",
  project: "project-1",
  timeoutMs: 1000,
};

const apiKeyConfig: VertexAiConfig = {
  apiKey: "vertex-api-key",
  authMode: "api_key",
  maxInputBytes: 10 * 1024 * 1024,
  model: "gemini-2.5-flash",
  timeoutMs: 1000,
};

describe("Vertex exam extraction service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends multimodal content and parses the structured response", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    fields: {
                      weightKg: {
                        confidence: 0.9,
                        rawValue: "78 kg",
                        value: "78 kg",
                      },
                    },
                    segmentalAnalyses: [],
                  }),
                },
              ],
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const service = createVertexExamExtractionService({
      config: oauthConfig,
      fetchToken: async () => "token-1",
    });
    const fileBuffer = await readFile("../docs/bio-rodrigo.jpeg");

    const result = await service.extractExam({
      fileBuffer,
      mimeType: "image/jpeg",
      originalFilename: "bio-rodrigo.jpeg",
    });

    expect(result.fields.weightKg.value).toBe(78);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain(
      "/projects/project-1/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent",
    );
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer token-1",
      "Content-Type": "application/json",
    });
    expect(String(init?.body)).toContain("inlineData");
    expect(String(init?.body)).not.toContain("bio-rodrigo.jpeg");
  });

  it("uses express mode URL and API key query param without OAuth headers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    fields: {
                      weightKg: {
                        confidence: 0.9,
                        rawValue: "78 kg",
                        value: "78 kg",
                      },
                    },
                    segmentalAnalyses: [],
                  }),
                },
              ],
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const fetchToken = vi.fn<() => Promise<string>>(async () => "token-1");
    const service = createVertexExamExtractionService({
      config: apiKeyConfig,
      fetchToken,
    });

    await service.extractExam({
      fileBuffer: Buffer.from("test"),
      mimeType: "image/jpeg",
      originalFilename: "bio.jpeg",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe(
      "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=vertex-api-key",
    );
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(fetchToken).not.toHaveBeenCalled();
  });

  it("maps provider failures to a safe extraction error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () =>
        Response.json({ error: "raw provider detail" }, { status: 500 }),
      ),
    );
    const service = createVertexExamExtractionService({
      config: oauthConfig,
      fetchToken: async () => "token-1",
    });

    await expect(
      service.extractExam({
        fileBuffer: Buffer.from("test"),
        mimeType: "image/jpeg",
        originalFilename: "bio.jpeg",
      }),
    ).rejects.toThrow("Vertex AI não conseguiu processar o exame.");
  });

  it("rejects files above the configured provider limit", async () => {
    const service = createVertexExamExtractionService({
      config: { ...oauthConfig, maxInputBytes: 1 },
      fetchToken: async () => "token-1",
    });

    await expect(
      service.extractExam({
        fileBuffer: Buffer.from("test"),
        mimeType: "image/jpeg",
        originalFilename: "bio.jpeg",
      }),
    ).rejects.toThrow("Arquivo excede o limite configurado para extração.");
  });
});
