import "server-only";

import { createMockExamExtractionService } from "./mock-extraction-service";
import type { ExamExtractionService } from "./extraction-types";
import { getOpenAiConfig } from "./openai-config";
import { createOpenAiExamExtractionService } from "./openai-extraction-service";
import { getVertexAiConfig } from "./vertex-config";
import { createVertexExamExtractionService } from "./vertex-extraction-service";

export type ExamExtractionProviderName = "mock" | "openai" | "vertex";

export interface ConfiguredExamExtractionService {
  readonly extractionProvider: {
    readonly model: string;
    readonly name: ExamExtractionProviderName;
  };
  readonly extractionService: ExamExtractionService;
}

const MOCK_PROVIDER = {
  model: "mock-fixture-v1",
  name: "mock",
} as const;

export const createConfiguredExamExtractionService =
  (): ConfiguredExamExtractionService => {
    const requestedProvider = getRequestedExtractionProvider();
    const openAiConfig = getOpenAiConfig();
    const vertexConfig = getVertexAiConfig();

    if (requestedProvider === "mock") {
      return createMockProvider();
    }

    if (requestedProvider === "openai" && openAiConfig) {
      return createOpenAiProvider(openAiConfig);
    }

    if (requestedProvider === "vertex" && vertexConfig) {
      return createVertexProvider(vertexConfig);
    }

    if (openAiConfig) {
      return createOpenAiProvider(openAiConfig);
    }

    if (vertexConfig) {
      return createVertexProvider(vertexConfig);
    }

    return createMockProvider();
  };

const getRequestedExtractionProvider = (): ExamExtractionProviderName | null => {
  const provider = process.env.EXAM_EXTRACTION_PROVIDER?.trim().toLowerCase();

  if (
    provider === "mock" ||
    provider === "openai" ||
    provider === "vertex"
  ) {
    return provider;
  }

  return null;
};

const createMockProvider = (): ConfiguredExamExtractionService => ({
  extractionProvider: MOCK_PROVIDER,
  extractionService: createMockExamExtractionService(),
});

const createOpenAiProvider = (
  config: NonNullable<ReturnType<typeof getOpenAiConfig>>,
): ConfiguredExamExtractionService => ({
  extractionProvider: {
    model: config.model,
    name: "openai",
  },
  extractionService: createOpenAiExamExtractionService({ config }),
});

const createVertexProvider = (
  config: NonNullable<ReturnType<typeof getVertexAiConfig>>,
): ConfiguredExamExtractionService => ({
  extractionProvider: {
    model: config.model,
    name: "vertex",
  },
  extractionService: createVertexExamExtractionService({ config }),
});
