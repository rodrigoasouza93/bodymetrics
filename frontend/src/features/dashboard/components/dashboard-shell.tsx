"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/src/features/auth/actions/auth-actions";
import { Button } from "@/src/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Início", match: "exact" as const },
  { href: "/dashboard/exames", label: "Exames", match: "prefix" as const },
  { href: "/dashboard/evolucao", label: "Evolução", match: "prefix" as const },
  { href: "/dashboard/perfil", label: "Perfil", match: "prefix" as const },
] as const;

interface DashboardShellProps {
  readonly children: React.ReactNode;
  readonly userEmail: string;
}

export function DashboardShell({ children, userEmail }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
              BodyMetrics
            </p>
            <p className="mt-1 text-sm text-body">{userEmail}</p>
          </div>
          <form action={signOut}>
            <Button type="submit">Sair</Button>
          </form>
        </div>
        <nav
          aria-label="Seções do painel"
          className="mx-auto max-w-6xl border-t border-hairline px-6"
        >
          <ul className="-mb-px flex gap-1 overflow-x-auto py-0">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.match === "exact"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center border-b-2 px-4 text-sm font-medium transition ${
                      isActive
                        ? "border-primary text-ink"
                        : "border-transparent text-muted hover:border-hairline hover:text-body"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
