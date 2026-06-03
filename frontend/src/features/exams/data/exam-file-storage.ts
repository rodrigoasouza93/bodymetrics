import { getMissingSupabaseConfigMessage, getSupabaseConfig } from "@/src/lib/supabase/config";
import { EXAM_FILES_BUCKET } from "../lib/storage-paths";

export interface UploadExamFileInput {
  readonly accessToken: string;
  readonly body: Buffer;
  readonly mimeType: string;
  readonly storagePath: string;
}

export const uploadExamFileToStorage = async ({
  accessToken,
  body,
  mimeType,
  storagePath,
}: UploadExamFileInput) => {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(getMissingSupabaseConfigMessage());
  }

  const response = await fetch(
    `${config.url}/storage/v1/object/${EXAM_FILES_BUCKET}/${encodeStoragePath(storagePath)}`,
    {
      body: new Blob([new Uint8Array(body)], { type: mimeType }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": mimeType,
        apikey: config.anonKey,
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível armazenar o arquivo do exame.");
  }
};

const encodeStoragePath = (storagePath: string) =>
  storagePath.split("/").map(encodeURIComponent).join("/");
