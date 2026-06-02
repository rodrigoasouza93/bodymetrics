import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseAuthSession } from "@/src/lib/supabase/auth-session";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  getAuthCookieOptions,
} from "@/src/lib/supabase/cookies";
import { shouldRequireAuthSession } from "@/src/lib/route-guards";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;

  if (!accessToken && refreshToken) {
    return refreshSessionAndContinue(request, refreshToken);
  }

  if (
    shouldRequireAuthSession({
      hasAccessToken: Boolean(accessToken),
      pathname,
    })
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

const refreshSessionAndContinue = async (
  request: NextRequest,
  refreshToken: string,
) => {
  try {
    const authResponse = await refreshSupabaseAuthSession(refreshToken);

    if (!authResponse.access_token || !authResponse.refresh_token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = NextResponse.next();
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

    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete(AUTH_ACCESS_COOKIE);
    response.cookies.delete(AUTH_REFRESH_COOKIE);

    return response;
  }
};

export const config = {
  matcher: ["/dashboard/:path*"],
};
