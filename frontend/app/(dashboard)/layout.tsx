import { redirect } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/dashboard-shell";
import {
  getCurrentSession,
  getCurrentUser,
} from "@/src/lib/supabase/server-client";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const session = await getCurrentSession();

  return (
    <DashboardShell userEmail={session?.user.email ?? user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
