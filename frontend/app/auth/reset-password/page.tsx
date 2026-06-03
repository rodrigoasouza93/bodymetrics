import {
  requestPasswordReset,
  updatePassword,
} from "@/src/features/auth/actions/auth-actions";
import { PasswordResetForm } from "@/src/features/auth/components/password-reset-form";
import { getCurrentUser } from "@/src/lib/supabase/server-client";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm sm:p-8">
          <PasswordResetForm
            action={user ? updatePassword : requestPasswordReset}
            mode={user ? "update" : "request"}
          />
        </div>
      </section>
      <aside className="hidden bg-surface-dark p-10 text-on-dark lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-on-dark/70">
            BodyMetrics
          </p>
          <h2 className="mt-6 max-w-sm text-5xl font-normal leading-tight">
            Recupere o acesso sem expor seus dados de saúde.
          </h2>
        </div>
        <div className="rounded-lg bg-surface-dark-elevated p-6">
          <p className="text-sm leading-6 text-on-dark/75">
            O link enviado pelo Supabase cria uma sessão temporária para troca
            segura da senha.
          </p>
        </div>
      </aside>
    </main>
  );
}
