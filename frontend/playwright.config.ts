import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BODYMETRICS_QA_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  outputDir: "test-results/playwright",
  reporter: [["list"]],
  testDir: "tests/e2e",
  timeout: 120_000,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `${baseURL}/login`,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          height: 900,
          width: 1440,
        },
      },
    },
  ],
});
