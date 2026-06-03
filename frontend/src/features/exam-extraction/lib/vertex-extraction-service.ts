import "server-only";

import type { ExamExtractionService, ExtractExamInput } from "./extraction-types";
import { getGoogleAccessToken } from "./google-auth";
import { parseVertexExamExtractionResponse } from "./vertex-parser";
import {
  VERTEX_EXAM_EXTRACTION_PROMPT,
  VERTEX_EXAM_RESPONSE_SCHEMA,
} from "./vertex-schema";
import type { VertexAiConfig } from "./vertex-config";

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(createVertexGenerateContentUrl(config), {
        body: JSON.stringify(createVertexRequestBody(input)),
        headers: await createVertexRequestHeaders({ config, fetchToken }),
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

const createVertexGenerateContentUrl = (config: VertexAiConfig) => {
  const modelPath = `publishers/google/models/${encodeURIComponent(config.model)}:generateContent`;

  if (config.authMode === "api_key") {
    return `https://aiplatform.googleapis.com/v1/${modelPath}?key=${encodeURIComponent(config.apiKey)}`;
  }

  return `https://${config.location}-aiplatform.googleapis.com/v1/projects/${encodeURIComponent(config.project)}/locations/${encodeURIComponent(config.location)}/${modelPath}`;
};

const createVertexRequestHeaders = async ({
  config,
  fetchToken,
}: {
  readonly config: VertexAiConfig;
  readonly fetchToken: typeof getGoogleAccessToken;
}): Promise<Record<string, string>> => {
  if (config.authMode === "api_key") {
    return {
      "Content-Type": "application/json",
    };
  }

  const accessToken = await fetchToken();

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

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
