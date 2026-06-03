import type { Json } from "@/src/types/database";
import {
  EXAM_FORM_FIELDS,
  type ExamFormValues,
} from "../lib/exam-form";

interface ExamReviewFieldsProps {
  readonly issues?: Json;
  readonly values: ExamFormValues;
}

export function ExamReviewFields({ issues, values }: ExamReviewFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {EXAM_FORM_FIELDS.map((field) => {
        const issue = getIssueForField({ fieldName: field.name, issues });
        const describedBy = issue ? `${field.name}-issue` : undefined;

        return (
          <label
            className="grid gap-2 text-sm font-medium text-body-strong"
            key={field.name}
          >
            <span className="flex items-center justify-between gap-3">
              <span>{field.label}</span>
              {field.unit ? (
                <span className="text-xs font-medium text-muted">
                  {field.unit}
                </span>
              ) : null}
            </span>
            <input
              aria-describedby={describedBy}
              aria-invalid={Boolean(issue)}
              className={[
                "min-h-11 rounded-md border bg-canvas px-4 py-3 text-base text-ink shadow-sm transition placeholder:text-muted focus:border-primary-active",
                issue ? "border-warning" : "border-hairline",
              ].join(" ")}
              defaultValue={values[field.name]}
              inputMode={field.name === "examPerformedAt" ? undefined : "decimal"}
              name={field.name}
              type={field.name === "examPerformedAt" ? "date" : "text"}
            />
            {issue ? (
              <span className="text-sm leading-6 text-body" id={describedBy}>
                {issue}
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}

const getIssueForField = ({
  fieldName,
  issues,
}: {
  readonly fieldName: string;
  readonly issues?: Json;
}) => {
  if (!Array.isArray(issues)) {
    return null;
  }

  const issue = issues.find(
    (item) =>
      Boolean(item) &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      item.field === fieldName,
  );

  if (
    issue &&
    typeof issue === "object" &&
    !Array.isArray(issue) &&
    typeof issue.message === "string"
  ) {
    return issue.message;
  }

  return null;
};
