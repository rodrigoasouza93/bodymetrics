import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/supabase/server-client";

export default async function HomePage() {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  redirect("/login");
}
