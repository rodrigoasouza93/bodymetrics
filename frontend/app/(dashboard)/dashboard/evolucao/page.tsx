import { redirect } from "next/navigation";
import { loadDashboardContext } from "@/src/features/dashboard/lib/load-dashboard-context";
import { ExamTrendsPanel } from "@/src/features/exams/components/exam-trends-panel";
import { getCurrentSession } from "@/src/lib/supabase/server-client";

export default async function DashboardEvolutionPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const { exams } = await loadDashboardContext(session);

  return (
    <section className="grid gap-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Evolução
        </p>
        <h1 className="mt-3 text-4xl font-normal leading-tight text-ink">
          Gráficos e comparação entre exames.
        </h1>
        <p className="mt-4 text-base leading-7 text-body">
          Visualize tendências e insights informativos com base nos exames que
          você já confirmou.
        </p>
      </div>
      <ExamTrendsPanel exams={exams} />
    </section>
  );
}
