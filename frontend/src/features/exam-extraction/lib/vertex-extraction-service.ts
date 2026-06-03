import "server-only";

import type { ExamExtractionService, ExtractExamInput } from "./extraction-types";
import type { VertexAiConfig } from "./vertex-config";
import { getGoogleAccessToken } from "./google-auth";
import { parseVertexExamExtractionResponse } from "./vertex-parser";
import {
  VERTEX_EXAM_EXTRACTION_PROMPT,
  VERTEX_EXAM_RESPONSE_SCHEMA,
} from "./vertex-schema";

export interface VertexExamExtractionServiceOptions {
  readonly config: VertexAiConfig;
  readonly fetchToken?: typeof getGoogleAccessToken;
}

export const createVertexExamExtractionService = ({
  config,
  fetchToken = getGoogleAccessToken,
}: VertexExamExtractionServiceOptions): ExamExtractionService => ({
  extractExam: async (input) => {
    validateVertexInput({ config, input });

    const accessToken = await fetchToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(createVertexGenerateContentUrl(config), {
        body: JSON.stringify(createVertexRequestBody(input)),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error("Vertex AI não conseguiu processar o exame.");
      }

      return parseVertexExamExtractionResponse(payload);
    } finally {
      clearTimeout(timeout);
    }
  },
});

const validateVertexInput = ({
  config,
  input,
}: {
  readonly config: VertexAiConfig;
  readonly input: ExtractExamInput;
}) => {
  if (input.fileBuffer.byteLength > config.maxInputBytes) {
    throw new Error("Arquivo excede o limite configurado para extração.");
  }
};

const createVertexGenerateContentUrl = ({
  location,
  model,
  project,
}: VertexAiConfig) =>
  `https://${location}-aiplatform.googleapis.com/v1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(model)}:generateContent`;

const createVertexRequestBody = (input: ExtractExamInput) => ({
  contents: [
    {
      parts: [
        { text: VERTEX_EXAM_EXTRACTION_PROMPT },
        {
          inlineData: {
            data: input.fileBuffer.toString("base64"),
            mimeType: input.mimeType,
          },
        },
      ],
      role: "user",
    },
  ],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: VERTEX_EXAM_RESPONSE_SCHEMA,
    temperature: 0,
  },
});
