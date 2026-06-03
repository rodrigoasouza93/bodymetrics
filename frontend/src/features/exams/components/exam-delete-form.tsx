"use client";

import { useTransition } from "react";
import { deleteExam } from "../actions/exam-actions";

interface ExamDeleteButtonProps {
  readonly examDateLabel: string;
  readonly examId: string;
}

export function ExamDeleteButton({
  examDateLabel,
  examId,
}: ExamDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const message = `Excluir o exame de ${examDateLabel}? Esta ação não pode ser desfeita.`;

    if (!window.confirm(message)) {
      return;
    }

    const formData = new FormData();
    formData.set("examId", examId);

    startTransition(async () => {
      await deleteExam(formData);
    });
  };

  return (
    <button
      className="min-h-11 cursor-pointer rounded-md border border-error/30 px-5 py-3 text-sm font-medium text-error transition hover:border-error hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      {isPending ? "Excluindo..." : "Excluir exame"}
    </button>
  );
}
