import "server-only";

import {
  parseProviderExtractionPayload,
  type ProviderExtractionPayload,
} from "./exam-extraction-parser";
import {
  EXAM_EXTRACTION_PROMPT,
  EXAM_EXTRACTION_RESPONSE_SCHEMA,
} from "./exam-extraction-schema";
import type { ExamExtractionService, ExtractExamInput } from "./extraction-types";
import type { OpenAiConfig } from "./openai-config";

export interface OpenAiExamExtractionServiceOptions {
  readonly config: OpenAiConfig;
}

interface ChatCompletionResponse {
  readonly choices?: readonly {
    readonly message?: {
      readonly content?: string | null;
      readonly refusal?: string | null;
    };
  }[];
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly type?: string;
  };
}

export const createOpenAiExamExtractionService = ({
  config,
}: OpenAiExamExtractionServiceOptions): ExamExtractionService => ({
  extractExam: async (input) => {
    validateOpenAiInput({ config, input });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(createOpenAiChatCompletionsUrl(config), {
        body: JSON.stringify(createOpenAiRequestBody(input, config.model)),
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });
      const payloadText = await response.text();
      const payload = parseOpenAiResponse(payloadText);

      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? "OpenAI não conseguiu processar o exame.",
        );
      }

      const message = payload.choices?.[0]?.message;
      const content = message?.content;

      if (message?.refusal) {
        throw new Error("OpenAI recusou a extração do exame.");
      }

      if (!content) {
        throw new Error("OpenAI não retornou conteúdo estruturado.");
      }

      const structuredPayload = JSON.parse(content) as ProviderExtractionPayload;

      return parseProviderExtractionPayload(structuredPayload);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `OpenAI não respondeu dentro de ${config.timeoutMs}ms. Aumente OPENAI_EXAM_TIMEOUT_MS.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },
});

const validateOpenAiInput = ({
  config,
  input,
}: {
  readonly config: OpenAiConfig;
  readonly input: ExtractExamInput;
}) => {
  if (input.fileBuffer.byteLength > config.maxInputBytes) {
    throw new Error("Arquivo excede o limite configurado para extração.");
  }
};

const createOpenAiChatCompletionsUrl = ({ baseUrl }: OpenAiConfig) =>
  `${baseUrl}/chat/completions`;

const createOpenAiRequestBody = (input: ExtractExamInput, model: string) => {
  const body = {
    messages: [
      {
        content: EXAM_EXTRACTION_PROMPT,
        role: "developer",
      },
      {
        content: [
          {
            text: "Extract the exam data from this file.",
            type: "text",
          },
          createFileContentPart(input),
        ],
        role: "user",
      },
    ],
    model,
    response_format: {
      json_schema: {
        name: "exam_extraction",
        schema: EXAM_EXTRACTION_RESPONSE_SCHEMA,
        strict: true,
      },
      type: "json_schema",
    },
  };

  const temperature = getOpenAiRequestTemperature(model);
  const reasoningEffort = getOpenAiReasoningEffort(model);

  return {
    ...body,
    ...(temperature === undefined ? {} : { temperature }),
    ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
  };
};

export const getOpenAiReasoningEffort = (
  model: string,
): "low" | undefined => {
  if (/^gpt-5/i.test(model)) {
    return "low";
  }

  return undefined;
};

export const getOpenAiRequestTemperature = (
  model: string,
): number | undefined => {
  if (/^gpt-5/i.test(model)) {
    return undefined;
  }

  return 0;
};

const createFileContentPart = (input: ExtractExamInput) => {
  if (input.mimeType === "application/pdf") {
    return {
      file: {
        file_data: `data:${input.mimeType};base64,${input.fileBuffer.toString("base64")}`,
        filename: input.originalFilename,
      },
      type: "file",
    } as const;
  }

  return {
    image_url: {
      url: `data:${input.mimeType};base64,${input.fileBuffer.toString("base64")}`,
    },
    type: "image_url",
  } as const;
};

const parseOpenAiResponse = (payloadText: string) => {
  if (!payloadText) {
    return {} as ChatCompletionResponse;
  }

  try {
    return JSON.parse(payloadText) as ChatCompletionResponse;
  } catch {
    return {} as ChatCompletionResponse;
  }
};
