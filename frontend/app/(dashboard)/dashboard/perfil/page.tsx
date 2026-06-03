import { redirect } from "next/navigation";
import { loadDashboardContext } from "@/src/features/dashboard/lib/load-dashboard-context";
import { updateProfile } from "@/src/features/profile/actions/profile-actions";
import { ProfileForm } from "@/src/features/profile/components/profile-form";
import { getCurrentSession } from "@/src/lib/supabase/server-client";

export default async function DashboardProfilePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const { hasProfile, profileValues } = await loadDashboardContext(session);

  return (
    <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <aside className="rounded-lg bg-surface-card p-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Perfil físico
        </p>
        <h1 className="mt-3 text-4xl font-normal leading-tight text-ink">
          Contexto para leituras e gráficos.
        </h1>
        <p className="mt-4 text-base leading-7 text-body">
          Atualize quando houver mudança relevante de altura, peso de referência
          ou objetivo. Campos opcionais podem ficar em branco.
        </p>
        <div className="mt-6 rounded-md border border-hairline bg-canvas p-4">
          <p className="text-sm font-medium text-body-strong">
            {hasProfile ? "Perfil preenchido" : "Perfil ainda vazio"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {hasProfile
              ? "Esses dados não geram diagnóstico nem recomendação clínica."
              : "Preencha apenas o que fizer sentido agora."}
          </p>
        </div>
      </aside>

      <div className="rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm md:p-8">
        <ProfileForm action={updateProfile} initialValues={profileValues} />
      </div>
    </section>
  );
}
