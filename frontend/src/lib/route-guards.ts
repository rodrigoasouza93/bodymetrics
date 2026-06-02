const PROTECTED_ROUTE_PREFIXES = ["/dashboard"];

export const isProtectedRoute = (pathname: string) =>
  PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const shouldRequireAuthSession = ({
  hasAccessToken,
  pathname,
}: {
  readonly hasAccessToken: boolean;
  readonly pathname: string;
}) => isProtectedRoute(pathname) && !hasAccessToken;
