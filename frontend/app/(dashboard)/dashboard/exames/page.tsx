import { redirect } from "next/navigation";
import { loadDashboardContext } from "@/src/features/dashboard/lib/load-dashboard-context";
import { ExamHistoryPanel } from "@/src/features/exams/components/exam-history-panel";
import { ExamUploadPanel } from "@/src/features/exams/components/exam-upload-panel";
import { getCurrentSession } from "@/src/lib/supabase/server-client";

export default async function DashboardExamsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const { exams } = await loadDashboardContext(session);

  return (
    <section className="grid gap-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Exames
        </p>
        <h1 className="mt-3 text-4xl font-normal leading-tight text-ink">
          Envie, revise e confirme seus exames.
        </h1>
        <p className="mt-4 text-base leading-7 text-body">
          O upload e a revisão ficam nesta seção. Depois de confirmar, o exame
          entra no histórico e alimenta a evolução.
        </p>
      </div>
      <div className="grid gap-6">
        <ExamUploadPanel />
        <ExamHistoryPanel exams={exams} />
      </div>
    </section>
  );
}
