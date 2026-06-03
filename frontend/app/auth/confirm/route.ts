import { type NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  saveAuthSession,
} from "@/src/lib/supabase/server-client";
import type { SupabaseAuthResponse } from "@/src/lib/supabase/types";

const OTP_TYPES = new Set([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (!tokenHash || !type || !OTP_TYPES.has(type)) {
    return redirectToLoginWithError(request);
  }

  try {
    const client = createServerSupabaseClient();
    const authResponse = await client.request<SupabaseAuthResponse>(
      "/auth/v1/verify",
      {
        body: { token_hash: tokenHash, type },
        method: "POST",
      },
    );

    await saveAuthSession(authResponse);

    return NextResponse.redirect(getSuccessRedirectUrl({ request, type }));
  } catch {
    return redirectToLoginWithError(request);
  }
}

const getSuccessRedirectUrl = ({
  request,
  type,
}: {
  readonly request: NextRequest;
  readonly type: string;
}) => {
  const nextPath = request.nextUrl.searchParams.get("next");

  if (nextPath?.startsWith("/")) {
    return new URL(nextPath, request.url);
  }

  if (type === "recovery") {
    return new URL("/auth/reset-password", request.url);
  }

  return new URL("/dashboard", request.url);
};

const redirectToLoginWithError = (request: NextRequest) =>
  NextResponse.redirect(new URL("/login?auth=invalid-link", request.url));
