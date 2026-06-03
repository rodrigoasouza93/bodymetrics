import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": dirname,
      "server-only": path.resolve(dirname, "src/lib/server-only-stub.ts"),
    },
  },
  test: {
    coverage: {
      exclude: [
        ".next/**",
        "app/**",
        "next-env.d.ts",
        "playwright.config.ts",
        "src/**/*.d.ts",
        "src/**/*-types.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/lib/server-only-stub.ts",
        "src/types/database.ts",
        "tests/e2e/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    exclude: ["node_modules/**", "tests/e2e/**"],
    globals: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
