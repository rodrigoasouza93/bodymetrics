import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getMissingSupabaseConfigMessage, getSupabaseConfig } from "./config";

const originalEnv = {
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

describe("getSupabaseConfig", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      originalEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
      originalEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("returns null when public Supabase env vars are missing (BLOQ-001 guard)", () => {
    expect(getSupabaseConfig()).toBeNull();
    expect(getMissingSupabaseConfigMessage()).toContain(
      "NEXT_PUBLIC_SUPABASE_URL",
    );
  });

  it("returns config when publishable key and url are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co/";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";

    expect(getSupabaseConfig()).toEqual({
      anonKey: "publishable-key",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: "https://project.supabase.co",
    });
  });

  it("accepts legacy NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(getSupabaseConfig()?.anonKey).toBe("anon-key");
  });
});
