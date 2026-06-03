"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import type { Json } from "@/src/types/database";
import { cancelExamUpload, confirmExamUpload } from "../actions/exam-actions";
import {
  getExamFormValuesFromPayload,
  type ExamFormValues,
} from "../lib/exam-form";
import { ExamReviewFields } from "./exam-review-fields";

interface UploadResult {
  readonly error?: string;
  readonly extractedFields?: Json;
  readonly extractedPayload?: Json;
  readonly fieldIssues?: Json;
  readonly overallConfidence?: number;
  readonly status?: string;
  readonly uploadId?: string;
}

export function ExamUploadPanel() {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [review, setReview] = useState<{
    readonly issues: Json;
    readonly payload: Json;
    readonly uploadId: string;
    readonly values: ExamFormValues;
  } | null>(null);

  const handleUpload = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/exam-uploads", {
        body: formData,
        method: "POST",
      });
      const result = (await response.json()) as UploadResult;

      if (!response.ok || result.error || !result.uploadId) {
        setError(result.error ?? "Não foi possível enviar o exame.");
        return;
      }

      const payload = result.extractedPayload ?? {};

      setReview({
        issues: result.fieldIssues ?? [],
        payload,
        uploadId: result.uploadId,
        values: getExamFormValuesFromPayload({
          fields: result.extractedFields ?? {},
        }),
      });
    });
  };

  if (review) {
    return (
      <section className="grid gap-5 rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
            Revisão do exame
          </p>
          <h2 className="mt-2 text-2xl font-medium text-ink">
            Confira os dados antes de salvar no histórico.
          </h2>
        </div>
        <Alert tone="warning">
          Campos destacados precisam de atenção. A confirmação abaixo é
          obrigatória para inserir o exame no histórico.
        </Alert>
        <form action={confirmExamUpload} className="grid gap-5">
          <input name="uploadId" type="hidden" value={review.uploadId} />
          <input
            name="reviewedPayload"
            type="hidden"
            value={JSON.stringify(review.payload)}
          />
          <ExamReviewFields issues={review.issues} values={review.values} />
          <div className="flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
            <Button type="submit">Confirmar e salvar</Button>
          </div>
        </form>
        <form action={cancelExamUpload}>
          <input name="uploadId" type="hidden" value={review.uploadId} />
          <button
            className="min-h-11 cursor-pointer rounded-md border border-hairline bg-canvas px-5 py-3 text-sm font-medium text-ink transition hover:border-primary-active"
            type="submit"
          >
            Cancelar cadastro
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="grid gap-5 rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Upload de exame
        </p>
        <h2 className="mt-2 text-2xl font-medium text-ink">
          Envie uma imagem ou PDF de bioimpedância.
        </h2>
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <form action={handleUpload} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-body-strong">
          <span>Arquivo do exame</span>
          <input
            accept="image/jpeg,image/png,application/pdf"
            className="min-h-11 rounded-md border border-hairline bg-canvas px-4 py-3 text-base text-ink file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-on-primary"
            name="file"
            onChange={(event) =>
              setFileName(event.currentTarget.files?.[0]?.name ?? "")
            }
            type="file"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted">
            {fileName || "Formatos aceitos: JPEG, PNG e PDF."}
          </p>
          <Button disabled={isPending} type="submit">
            {isPending ? "Extraindo..." : "Enviar exame"}
          </Button>
        </div>
      </form>
    </section>
  );
}
