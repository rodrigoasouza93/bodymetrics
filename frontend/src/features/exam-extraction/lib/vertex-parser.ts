import { parseProviderExtractionPayload } from "./exam-extraction-parser";
import type { ExtractExamResult } from "./extraction-types";

interface VertexGenerateContentResponse {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly {
        readonly text?: string;
      }[];
    };
  }[];
}

export const parseVertexExamExtractionResponse = (
  response: VertexGenerateContentResponse,
): ExtractExamResult => {
  const responseText = getVertexResponseText(response);
  const payload = JSON.parse(responseText);

  return parseProviderExtractionPayload(payload);
};

const getVertexResponseText = (response: VertexGenerateContentResponse) => {
  const text = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Vertex AI não retornou texto estruturado.");
  }

  return text;
};
