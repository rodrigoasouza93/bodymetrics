const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return atob(padded);
};

export const isAccessTokenExpired = (accessToken: string | undefined) => {
  if (!accessToken) {
    return true;
  }

  const [, payloadSegment] = accessToken.split(".");

  if (!payloadSegment) {
    return true;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as {
      exp?: number;
    };

    if (typeof payload.exp !== "number") {
      return true;
    }

    return Date.now() >= payload.exp * 1000 - ACCESS_TOKEN_EXPIRY_BUFFER_MS;
  } catch {
    return true;
  }
};
