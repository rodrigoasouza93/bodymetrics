import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getGoogleAccessToken } from "./google-auth.ts";

describe("getGoogleAccessToken", () => {
  let credentialsDirectory: string | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();

    if (credentialsDirectory) {
      await rm(credentialsDirectory, { force: true, recursive: true });
      credentialsDirectory = null;
    }
  });

  it("uses a direct Google Cloud access token when configured", async () => {
    vi.stubEnv("GOOGLE_CLOUD_ACCESS_TOKEN", "direct-token");

    await expect(getGoogleAccessToken()).resolves.toBe("direct-token");
  });

  it("requires service account credentials when direct token is missing", async () => {
    vi.stubEnv("GOOGLE_CLOUD_ACCESS_TOKEN", "");
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "");

    await expect(getGoogleAccessToken()).rejects.toThrow(
      "Configure VERTEX_AI_API_KEY (express), GOOGLE_CLOUD_ACCESS_TOKEN ou GOOGLE_APPLICATION_CREDENTIALS.",
    );
  });

  it("rejects service account files missing required fields", async () => {
    const credentialsPath = await writeCredentialsFile({
      client_email: "service@example.iam.gserviceaccount.com",
    });
    vi.stubEnv("GOOGLE_CLOUD_ACCESS_TOKEN", "");
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

    await expect(getGoogleAccessToken()).rejects.toThrow(
      "Credenciais Google Cloud inválidas.",
    );
  });

  it("exchanges a service account assertion for an access token", async () => {
    const credentialsPath = await writeCredentialsFile({
      client_email: "service@example.iam.gserviceaccount.com",
      private_key: createPrivateKeyPem(),
    });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ access_token: "oauth-token" }),
      ok: true,
    } as Response);
    vi.stubEnv("GOOGLE_CLOUD_ACCESS_TOKEN", "");
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

    await expect(getGoogleAccessToken()).resolves.toBe("oauth-token");

    const [, options] = fetchMock.mock.calls[0] ?? [];
    expect(fetchMock).toHaveBeenCalledWith(
      "https://oauth2.googleapis.com/token",
      expect.objectContaining({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      }),
    );
    expect(options?.body).toBeInstanceOf(URLSearchParams);
    expect((options?.body as URLSearchParams).get("grant_type")).toBe(
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
    );
    expect((options?.body as URLSearchParams).get("assertion")).toMatch(
      /^[^.]+\.[^.]+\.[^.]+$/,
    );
  });

  it("surfaces Google OAuth error descriptions", async () => {
    const credentialsPath = await writeCredentialsFile({
      client_email: "service@example.iam.gserviceaccount.com",
      private_key: createPrivateKeyPem(),
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({
        error_description: "Service account disabled",
      }),
      ok: false,
    } as Response);
    vi.stubEnv("GOOGLE_CLOUD_ACCESS_TOKEN", "");
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

    await expect(getGoogleAccessToken()).rejects.toThrow(
      "Service account disabled",
    );
  });

  it("falls back to a safe Google OAuth error message", async () => {
    const credentialsPath = await writeCredentialsFile({
      client_email: "service@example.iam.gserviceaccount.com",
      private_key: createPrivateKeyPem(),
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => {
        throw new Error("Invalid JSON");
      },
      ok: false,
    } as unknown as Response);
    vi.stubEnv("GOOGLE_CLOUD_ACCESS_TOKEN", "");
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

    await expect(getGoogleAccessToken()).rejects.toThrow(
      "Não foi possível autenticar no Google Cloud.",
    );
  });

  const writeCredentialsFile = async (
    credentials: Readonly<Record<string, string>>,
  ) => {
    credentialsDirectory = await mkdtemp(join(tmpdir(), "bodymetrics-google-"));
    const credentialsPath = join(credentialsDirectory, "credentials.json");

    await writeFile(credentialsPath, JSON.stringify(credentials), "utf8");

    return credentialsPath;
  };

  const createPrivateKeyPem = () => {
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });

    return privateKey.export({
      format: "pem",
      type: "pkcs8",
    }).toString();
  };
});
