import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const AUTH_ACCESS_COOKIE = "bm-access-token";
export const AUTH_REFRESH_COOKIE = "bm-refresh-token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const getAuthCookieOptions = (): Partial<ResponseCookie> => ({
  httpOnly: true,
  maxAge: COOKIE_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});
