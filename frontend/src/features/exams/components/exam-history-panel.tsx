import type { BodyCompositionExam } from "../lib/exam-types";
import { updateExam } from "../actions/exam-actions";
import {
  EXAM_FORM_FIELDS,
  getExamFormValuesFromExam,
} from "../lib/exam-form";
import { ExamDeleteButton } from "./exam-delete-form";
import { ExamReviewFields } from "./exam-review-fields";

interface ExamHistoryPanelProps {
  readonly exams: readonly BodyCompositionExam[];
}

export function ExamHistoryPanel({ exams }: ExamHistoryPanelProps) {
  if (exams.length === 0) {
    return (
      <section className="rounded-lg border border-hairline bg-surface-card p-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Histórico
        </p>
        <h2 className="mt-2 text-2xl font-medium text-ink">
          Nenhum exame confirmado ainda.
        </h2>
        <p className="mt-3 text-sm leading-6 text-body">
          Envie um exame e confirme os dados revisados para iniciar sua linha do
          tempo.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Histórico
        </p>
        <h2 className="mt-2 text-2xl font-medium text-ink">
          Exames confirmados em ordem cronológica.
        </h2>
      </div>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <details
            className="rounded-lg border border-hairline bg-surface-card p-5"
            key={exam.id}
          >
            <summary className="cursor-pointer list-none">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-lg font-medium text-ink">
                    {formatDate(exam.examPerformedAt ?? exam.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Peso {formatMetric(exam.weightKg, "kg")} · Gordura{" "}
                    {formatMetric(exam.bodyFatPercentage, "%")}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary">
                  Ver detalhe e editar
                </span>
              </div>
            </summary>
            <div className="mt-5 grid gap-5 border-t border-hairline pt-5">
              <dl className="grid gap-3 md:grid-cols-4">
                {EXAM_FORM_FIELDS.slice(1, 5).map((field) => (
                  <div className="rounded-md bg-canvas p-4" key={field.name}>
                    <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
                      {field.label}
                    </dt>
                    <dd className="mt-2 text-xl font-medium text-ink">
                      {formatMetric(exam[field.name], field.unit)}
                    </dd>
                  </div>
                ))}
              </dl>
              <form
                action={updateExam}
                className="grid gap-5"
                id={`exam-edit-${exam.id}`}
              >
                <input name="examId" type="hidden" value={exam.id} />
                <input
                  name="reviewedPayload"
                  type="hidden"
                  value={JSON.stringify(exam.reviewedPayload ?? {})}
                />
                <ExamReviewFields values={getExamFormValuesFromExam(exam)} />
              </form>
              <div className="flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
                <ExamDeleteButton
                  examDateLabel={formatDate(
                    exam.examPerformedAt ?? exam.createdAt,
                  )}
                  examId={exam.id}
                />
                <button
                  className="min-h-11 cursor-pointer rounded-md bg-primary px-5 py-3 text-sm font-medium text-on-primary transition hover:bg-primary-active"
                  form={`exam-edit-${exam.id}`}
                  type="submit"
                >
                  Salvar alterações
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

const formatMetric = (value: number | string | null, unit: string) => {
  if (value === null || value === "") {
    return "Não informado";
  }

  return `${value}${unit ? ` ${unit}` : ""}`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
