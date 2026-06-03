import Link from "next/link";
import type { DashboardContext } from "../lib/load-dashboard-context";

interface DashboardOverviewProps {
  readonly context: DashboardContext;
}

const SECTION_CARDS = [
  {
    description:
      "Envie imagens ou PDFs de bioimpedância, revise os dados extraídos e confirme no histórico.",
    href: "/dashboard/exames",
    stat: (context: DashboardContext) =>
      context.examCount === 0
        ? "Nenhum exame confirmado"
        : `${context.examCount} exame${context.examCount === 1 ? "" : "s"} confirmado${context.examCount === 1 ? "" : "s"}`,
    title: "Exames",
  },
  {
    description:
      "Acompanhe gráficos de peso, massa magra e gordura, além de insights comparativos.",
    href: "/dashboard/evolucao",
    stat: (context: DashboardContext) =>
      context.examCount < 1
        ? "Aguardando primeiro exame"
        : context.examCount < 2
          ? "Confirme mais um exame para comparar"
          : "Gráficos e comparações disponíveis",
    title: "Evolução",
  },
  {
    description:
      "Altura, peso de referência e objetivo físico para contextualizar suas leituras.",
    href: "/dashboard/perfil",
    stat: (context: DashboardContext) =>
      context.hasProfile ? "Perfil preenchido" : "Perfil ainda vazio",
    title: "Perfil físico",
  },
] as const;

export function DashboardOverview({ context }: DashboardOverviewProps) {
  return (
    <section className="grid gap-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
          Início
        </p>
        <h1 className="mt-3 text-4xl font-normal leading-tight text-ink">
          Acompanhe sua composição corporal com calma e clareza.
        </h1>
        <p className="mt-4 text-base leading-7 text-body">
          Escolha uma seção abaixo. Cada área concentra uma tarefa para você não
          precisar rolar um painel único cheio de informações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SECTION_CARDS.map((card) => (
          <Link
            className="group rounded-lg border border-hairline bg-surface-soft p-6 shadow-sm transition hover:border-primary-active"
            href={card.href}
            key={card.href}
          >
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
              {card.title}
            </p>
            <p className="mt-3 text-lg font-medium text-ink group-hover:text-body-strong">
              {card.stat(context)}
            </p>
            <p className="mt-3 text-sm leading-6 text-body">{card.description}</p>
            <p className="mt-4 text-sm font-medium text-primary">Abrir seção →</p>
          </Link>
        ))}
      </div>

      <p className="text-sm leading-6 text-muted">
        O BodyMetrics não substitui avaliação médica, nutricional ou de educação
        física.
      </p>
    </section>
  );
}
