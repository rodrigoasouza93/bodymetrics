import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ACCESS_COOKIE = "bm-access-token";
const APP_ORIGIN = process.env.BODYMETRICS_QA_BASE_URL ?? "http://localhost:3000";
const REFRESH_COOKIE = "bm-refresh-token";
const EVIDENCE_DIR = path.resolve(
  process.cwd(),
  "..",
  "tasks",
  "prd-bodymetrics",
  "evidence",
);
const EXAM_FIXTURE_PATH = path.resolve(
  process.cwd(),
  "..",
  "docs",
  "bio-rayane.jpeg",
);

interface SupabaseAuthResponse {
  readonly access_token?: string;
  readonly error?: string;
  readonly error_description?: string;
  readonly msg?: string;
  readonly refresh_token?: string;
}

test.beforeAll(async () => {
  await loadEnvLocal();
  await mkdir(EVIDENCE_DIR, { recursive: true });
});

test("authenticated dashboard flow renders and uploads an exam for review", async ({
  context,
  page,
}) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
  await saveEvidence(page, "visual-login.png");

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  const session = await obtainSupabaseSession();
  await addSessionCookies({ context, session });

  await page.goto("/dashboard");
  await expect(page.getByText("BodyMetrics", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { exact: true, name: "Exames" }),
  ).toBeVisible();
  await saveEvidence(page, "visual-dashboard.png");

  await page.goto("/dashboard/perfil");
  await expect(
    page.getByRole("heading", { name: /contexto para leituras/i }),
  ).toBeVisible();
  await saveEvidence(page, "visual-profile.png");

  await page.goto("/dashboard/exames");
  await expect(
    page.getByRole("heading", { name: /envie, revise e confirme/i }),
  ).toBeVisible();
  await expect(page.getByText("Upload de exame")).toBeVisible();
  await saveEvidence(page, "visual-exams-before-upload.png");

  await page.locator('input[name="file"]').setInputFiles(EXAM_FIXTURE_PATH);
  await page.getByRole("button", { name: "Enviar exame" }).click();
  await expect(page.getByText("Revisão do exame")).toBeVisible({
    timeout: 60_000,
  });
  await expect(
    page.getByRole("button", { name: "Confirmar e salvar" }),
  ).toBeVisible();
  await saveEvidence(page, "visual-exams-review.png");

  await page.goto("/dashboard/evolucao");
  await expect(
    page.getByRole("heading", { level: 1, name: /gráficos e comparação/i }),
  ).toBeVisible();
  await saveEvidence(page, "visual-evolution.png");
});

const saveEvidence = async (page: Page, filename: string) => {
  await page.screenshot({
    fullPage: true,
    path: path.join(EVIDENCE_DIR, filename),
  });
};

const loadEnvLocal = async () => {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = await readFile(envPath, "utf8").catch(() => "");

  content.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

const obtainSupabaseSession = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.BODYMETRICS_QA_EMAIL;
  const password = process.env.BODYMETRICS_QA_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !email || !password) {
    throw new Error("Configuração de QA Supabase incompleta.");
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      body: JSON.stringify({ email, password }),
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  const payload = (await response.json()) as SupabaseAuthResponse;

  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    throw new Error(
      payload.error_description ??
        payload.msg ??
        payload.error ??
        "Não foi possível autenticar usuário QA no Supabase.",
    );
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  };
};

const addSessionCookies = async ({
  context,
  session,
}: {
  readonly context: BrowserContext;
  readonly session: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
}) => {
  await context.addCookies([
    {
      httpOnly: true,
      name: ACCESS_COOKIE,
      sameSite: "Lax",
      url: APP_ORIGIN,
      value: session.accessToken,
    },
    {
      httpOnly: true,
      name: REFRESH_COOKIE,
      sameSite: "Lax",
      url: APP_ORIGIN,
      value: session.refreshToken,
    },
  ]);
};
