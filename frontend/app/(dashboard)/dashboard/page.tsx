import { signOut } from "@/src/features/auth/actions/auth-actions";
import { Button } from "@/src/components/ui/button";
import {
  createServerSupabaseClient,
  getCurrentSession,
} from "@/src/lib/supabase/server-client";
import { updateProfile } from "@/src/features/profile/actions/profile-actions";
import { ProfileForm } from "@/src/features/profile/components/profile-form";
import { getProfileByUserId } from "@/src/features/profile/data/profile-repository";
import { getProfileFormValuesFromRow } from "@/src/features/profile/lib/profile-validation";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const user = session?.user ?? null;
  const profile = session
    ? await getProfileByUserId({
        accessToken: session.accessToken,
        client: createServerSupabaseClient(),
        userId: session.user.id,
      })
    : null;
  const profileValues = getProfileFormValuesFromRow(profile);
  const hasProfile = Boolean(profile);

  return (
    <main className="min-h-dvh bg-canvas">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
              BodyMetrics
            </p>
            <p className="mt-1 text-sm text-body">{user?.email}</p>
          </div>
          <form action={signOut}>
            <Button type="submit">Sair</Button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="rounded-lg bg-surface-card p-8">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
              Perfil físico
            </p>
            <h1 className="mt-3 text-4xl font-normal leading-tight tracking-normal text-ink">
              Mantenha o contexto dos seus exames atualizado.
            </h1>
            <p className="mt-4 text-base leading-7 text-body">
              Esses dados ajudam a contextualizar leituras, histórico e gráficos.
              Eles não geram diagnóstico ou recomendação clínica.
            </p>
            <div className="mt-6 rounded-md border border-hairline bg-canvas p-4">
              <p className="text-sm font-medium text-body-strong">
                {hasProfile ? "Perfil preenchido" : "Perfil ainda vazio"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {hasProfile
                  ? "Revise quando houver mudança relevante de altura, peso de referência ou objetivo."
                  : "Preencha apenas o que fizer sentido agora; campos opcionais podem ficar em branco."}
              </p>
            </div>
          </aside>

          <div className="rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm md:p-8">
            <ProfileForm action={updateProfile} initialValues={profileValues} />
          </div>
        </div>
      </section>
    </main>
  );
}
