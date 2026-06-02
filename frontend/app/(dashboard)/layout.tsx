import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/supabase/server-client";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return children;
}
