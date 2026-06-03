import { type NextRequest, NextResponse } from "next/server";
import { refreshSupabaseAuthSession } from "@/src/lib/supabase/auth-session";
import { isAccessTokenExpired } from "@/src/lib/supabase/access-token";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  getAuthCookieOptions,
} from "@/src/lib/supabase/cookies";

const clearAuthCookies = (response: NextResponse) => {
  response.cookies.delete(AUTH_ACCESS_COOKIE);
  response.cookies.delete(AUTH_REFRESH_COOKIE);
};

export default async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.next();
  }

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    const authResponse = await refreshSupabaseAuthSession(refreshToken);

    if (!authResponse.access_token || !authResponse.refresh_token) {
      throw new Error("A resposta de autenticação não retornou uma sessão válida.");
    }

    const cookieOptions = getAuthCookieOptions();

    response.cookies.set(
      AUTH_ACCESS_COOKIE,
      authResponse.access_token,
      cookieOptions,
    );
    response.cookies.set(
      AUTH_REFRESH_COOKIE,
      authResponse.refresh_token,
      cookieOptions,
    );
  } catch {
    clearAuthCookies(response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
