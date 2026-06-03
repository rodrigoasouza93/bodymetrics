import { describe, expect, it } from "vitest";
import { isAccessTokenExpired } from "./access-token";

const createAccessToken = (expiresAtMs: number) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(expiresAtMs / 1000) }),
  ).toString("base64url");

  return `${header}.${payload}.signature`;
};

describe("isAccessTokenExpired", () => {
  it("treats missing tokens as expired", () => {
    expect(isAccessTokenExpired(undefined)).toBe(true);
  });

  it("detects expired access tokens", () => {
    const token = createAccessToken(Date.now() - 120_000);

    expect(isAccessTokenExpired(token)).toBe(true);
  });

  it("accepts valid access tokens", () => {
    const token = createAccessToken(Date.now() + 120_000);

    expect(isAccessTokenExpired(token)).toBe(false);
  });
});
