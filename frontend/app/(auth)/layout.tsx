import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/supabase/server-client";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </section>
      <aside className="hidden bg-surface-dark p-10 text-on-dark lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-on-dark/70">
            BodyMetrics
          </p>
          <h2 className="mt-6 max-w-sm text-5xl font-normal leading-tight">
            Dados físicos privados, comparáveis e revisados por você.
          </h2>
        </div>
        <div className="rounded-lg bg-surface-dark-elevated p-6">
          <p className="text-sm leading-6 text-on-dark/75">
            O exame só entra no histórico após confirmação explícita. A análise
            é informativa e não substitui avaliação profissional.
          </p>
        </div>
      </aside>
    </main>
  );
}
