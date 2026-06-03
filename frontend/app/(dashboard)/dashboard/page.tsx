import { redirect } from "next/navigation";
import { DashboardOverview } from "@/src/features/dashboard/components/dashboard-overview";
import { loadDashboardContext } from "@/src/features/dashboard/lib/load-dashboard-context";
import { getCurrentSession } from "@/src/lib/supabase/server-client";

export default async function DashboardHomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const context = await loadDashboardContext(session);

  return <DashboardOverview context={context} />;
}
