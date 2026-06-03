import "server-only";

import { headers } from "next/headers";

export const getPublicAuthRedirectUrl = async (pathname: string) => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return new URL(pathname, withTrailingSlash(configuredUrl)).toString();
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return new URL(pathname, "http://localhost:3000").toString();
  }

  return new URL(pathname, `${protocol}://${host}`).toString();
};

const withTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`);
