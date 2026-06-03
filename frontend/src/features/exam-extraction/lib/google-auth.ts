import "server-only";

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

interface GoogleServiceAccountCredentials {
  readonly client_email: string;
  readonly private_key: string;
}

interface GoogleTokenResponse {
  readonly access_token?: string;
  readonly error?: string;
  readonly error_description?: string;
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_OAUTH_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

export const getGoogleAccessToken = async () => {
  const directToken = process.env.GOOGLE_CLOUD_ACCESS_TOKEN;

  if (directToken) {
    return directToken;
  }

  const credentials = await readServiceAccountCredentials();
  const assertion = createServiceAccountAssertion(credentials);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as GoogleTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ??
        payload.error ??
        "Não foi possível autenticar no Google Cloud.",
    );
  }

  return payload.access_token;
};

const readServiceAccountCredentials =
  async (): Promise<GoogleServiceAccountCredentials> => {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!credentialsPath) {
      throw new Error(
        "Configure VERTEX_AI_API_KEY (express), GOOGLE_CLOUD_ACCESS_TOKEN ou GOOGLE_APPLICATION_CREDENTIALS.",
      );
    }

    const rawCredentials = await readFile(credentialsPath, "utf8");
    const credentials = JSON.parse(rawCredentials) as Partial<GoogleServiceAccountCredentials>;

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Credenciais Google Cloud inválidas.");
    }

    return {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    };
  };

const createServiceAccountAssertion = ({
  client_email,
  private_key,
}: GoogleServiceAccountCredentials) => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );
  const claimSet = encodeBase64Url(
    JSON.stringify({
      aud: GOOGLE_TOKEN_URL,
      exp: nowSeconds + 3600,
      iat: nowSeconds,
      iss: client_email,
      scope: GOOGLE_OAUTH_SCOPE,
    }),
  );
  const unsignedToken = `${header}.${claimSet}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(private_key, "base64url");

  return `${unsignedToken}.${signature}`;
};

const encodeBase64Url = (value: string) =>
  Buffer.from(value).toString("base64url");
