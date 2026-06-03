/**
 * Smoke E2E autenticado para regressão do BLOQ-001 (Supabase + sessão + upload).
 * Uso: npm run qa:smoke (com `npm run dev` em outro terminal).
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const BASE_URL = process.env.BODYMETRICS_QA_BASE_URL ?? "http://localhost:3000";
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";
const QA_EMAIL =
  process.env.BODYMETRICS_QA_EMAIL ??
  `qa-smoke-${Date.now()}@test.com`;
const QA_PASSWORD = process.env.BODYMETRICS_QA_PASSWORD ?? "BodyMetricsQa!2026";

const ACCESS_COOKIE = "bm-access-token";
const REFRESH_COOKIE = "bm-refresh-token";

const EXAM_FIXTURE_PATH = resolve("..", "docs", "bio-rayane.jpeg");

const results = [];

const record = (name, passed, detail = "") => {
  results.push({ name, passed, detail });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const assertConfig = () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    record(
      "Supabase env",
      false,
      "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY são obrigatórios",
    );
    return false;
  }

  record("Supabase env", true, SUPABASE_URL);
  return true;
};

const supabaseAuth = async (path, body) => {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }

  return { ok: response.ok, payload, status: response.status };
};

const obtainSession = async () => {
  const signIn = await supabaseAuth("/auth/v1/token?grant_type=password", {
    email: QA_EMAIL,
    password: QA_PASSWORD,
  });

  if (signIn.ok && signIn.payload.access_token) {
    record("Auth sign-in", true, QA_EMAIL);
    return signIn.payload;
  }

  const signUp = await supabaseAuth("/auth/v1/signup", {
    email: QA_EMAIL,
    password: QA_PASSWORD,
  });

  if (signUp.ok && signUp.payload.access_token) {
    record("Auth sign-up", true, QA_EMAIL);
    return signUp.payload;
  }

  if (signUp.payload?.msg?.includes("already registered")) {
    const retry = await supabaseAuth("/auth/v1/token?grant_type=password", {
      email: QA_EMAIL,
      password: QA_PASSWORD,
    });

    if (retry.ok && retry.payload.access_token) {
      record("Auth sign-in (retry)", true, QA_EMAIL);
      return retry.payload;
    }
  }

  const authDetail =
    signUp.payload?.error_description ??
    signUp.payload?.msg ??
    signIn.payload?.error_description ??
    signIn.payload?.msg ??
    `sign-in ${signIn.status}, sign-up ${signUp.status}`;

  if (signUp.payload?.error_code === "over_email_send_rate_limit") {
    record(
      "Auth session",
      false,
      `${authDetail}. Defina BODYMETRICS_QA_EMAIL e BODYMETRICS_QA_PASSWORD com um usuário de teste já criado.`,
    );
    return null;
  }

  record("Auth session", false, authDetail);

  return null;
};

const cookieHeader = (session) =>
  `${ACCESS_COOKIE}=${session.access_token}; ${REFRESH_COOKIE}=${session.refresh_token}`;

const fetchApp = async (path, init = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    redirect: "manual",
    headers: {
      ...init.headers,
    },
  });

  return response;
};

const runSmoke = async () => {
  if (!assertConfig()) {
    return 1;
  }

  let devOk = false;

  try {
    const health = await fetchApp("/login");
    devOk = health.status === 200;
  } catch (error) {
    record(
      "Dev server",
      false,
      `Não foi possível acessar ${BASE_URL}/login (${error instanceof Error ? error.message : "erro"})`,
    );
    return 1;
  }

  record("Dev server", devOk, `${BASE_URL}/login → 200`);

  if (!devOk) {
    return 1;
  }

  const unauthDashboard = await fetchApp("/dashboard");
  record(
    "Dashboard sem sessão",
    unauthDashboard.status === 307 || unauthDashboard.status === 302,
    `status ${unauthDashboard.status}`,
  );

  const session = await obtainSession();

  if (!session?.access_token) {
    return 1;
  }

  const cookies = cookieHeader(session);

  const dashboard = await fetchApp("/dashboard", {
    headers: { Cookie: cookies },
  });
  record(
    "Dashboard autenticado",
    dashboard.status === 200,
    `status ${dashboard.status}`,
  );

  for (const route of ["/dashboard/perfil", "/dashboard/exames", "/dashboard/evolucao"]) {
    const page = await fetchApp(route, { headers: { Cookie: cookies } });
    record(`${route}`, page.status === 200, `status ${page.status}`);
  }

  const examBytes = await readFile(EXAM_FIXTURE_PATH);
  const form = new FormData();
  form.append(
    "file",
    new Blob([examBytes], { type: "image/jpeg" }),
    "bio-rayane.jpeg",
  );

  const upload = await fetch(`${BASE_URL}/api/exam-uploads`, {
    method: "POST",
    headers: { Cookie: cookies },
    body: form,
  });

  const uploadBody = await upload.json().catch(() => ({}));
  const uploadOk =
    upload.status === 200 &&
    typeof uploadBody.uploadId === "string" &&
    (uploadBody.status === "needs_review" || uploadBody.status === "processing");

  record(
    "Upload autenticado",
    uploadOk,
    `status ${upload.status}, upload status ${uploadBody.status ?? "n/a"}, id ${uploadBody.uploadId ?? "n/a"}`,
  );

  if (uploadBody.uploadId) {
    const detail = await fetch(
      `${BASE_URL}/api/exam-uploads/${uploadBody.uploadId}`,
      { headers: { Cookie: cookies } },
    );
    const detailBody = await detail.json().catch(() => ({}));
    record(
      "GET upload por id",
      detail.status === 200 && detailBody.uploadId === uploadBody.uploadId,
      `status ${detail.status}`,
    );
  }

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  record(
    "Supabase user endpoint",
    userResponse.ok,
    `status ${userResponse.status}`,
  );

  const failed = results.filter((item) => !item.passed).length;

  console.log(`\nResumo: ${results.length - failed}/${results.length} passou.`);

  return failed === 0 ? 0 : 1;
};

runSmoke()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
