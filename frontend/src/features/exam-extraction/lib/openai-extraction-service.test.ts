import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAiExamExtractionService } from "./openai-extraction-service.ts";
import type { OpenAiConfig } from "./openai-config";

const config: OpenAiConfig = {
  apiKey: "openai-key",
  baseUrl: "https://api.openai.com/v1",
  maxInputBytes: 50 * 1024 * 1024,
  model: "gpt-4o",
  timeoutMs: 1000,
};

describe("OpenAI exam extraction service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a PDF file input with structured output schema", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
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
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const service = createOpenAiExamExtractionService({ config });
    const fileBuffer = await readFile("../docs/bio-rodrigo.jpeg");

    const result = await service.extractExam({
      fileBuffer,
      mimeType: "application/pdf",
      originalFilename: "bio.pdf",
    });

    expect(result.fields.weightKg.value).toBe(78);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://api.openai.com/v1/chat/completions");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer openai-key",
      "Content-Type": "application/json",
    });
    expect(String(init?.body)).toContain('"type":"json_schema"');
    expect(String(init?.body)).toContain('"type":"file"');
    expect(String(init?.body)).toContain("data:application/pdf;base64");
    expect(String(init?.body)).toContain('"temperature":0');
  });

  it("omits temperature for gpt-5 models that only support the default value", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
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
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const service = createOpenAiExamExtractionService({
      config: {
        ...config,
        model: "gpt-5-nano",
      },
    });

    await service.extractExam({
      fileBuffer: Buffer.from("test"),
      mimeType: "image/jpeg",
      originalFilename: "bio.jpeg",
    });

    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).not.toContain(
      '"temperature"',
    );
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain(
      '"reasoning_effort":"low"',
    );
  });

  it("sends an image input for JPEG files", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
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
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const service = createOpenAiExamExtractionService({ config });

    const result = await service.extractExam({
      fileBuffer: Buffer.from("test"),
      mimeType: "image/jpeg",
      originalFilename: "bio.jpeg",
    });

    expect(result.fields.weightKg.value).toBe(78);
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain(
      '"type":"image_url"',
    );
  });

  it("maps provider failures to a safe extraction error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () =>
        Response.json({ error: { message: "raw provider detail" } }, { status: 500 }),
      ),
    );
    const service = createOpenAiExamExtractionService({ config });

    await expect(
      service.extractExam({
        fileBuffer: Buffer.from("test"),
        mimeType: "image/jpeg",
        originalFilename: "bio.jpeg",
      }),
    ).rejects.toThrow("raw provider detail");
  });
});
