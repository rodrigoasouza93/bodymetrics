import { NextResponse } from "next/server";
import { saveAuthSession } from "@/src/lib/supabase/server-client";
import type { SupabaseAuthResponse } from "@/src/lib/supabase/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as SupabaseAuthResponse;

  if (!payload.access_token || !payload.refresh_token) {
    return NextResponse.json(
      { error: "Sessão de recuperação inválida." },
      { status: 400 },
    );
  }

  await saveAuthSession(payload);

  return NextResponse.json({ ok: true });
}
