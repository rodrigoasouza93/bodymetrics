# Especificação técnica

**Status:** APROVADO PELO USUÁRIO

## Resumo executivo

A solução será construída como aplicação full-stack em Next.js App Router dentro de `frontend`, usando Supabase para autenticação por email/senha, Postgres, Row Level Security e Storage privado. As telas principais serão Server Components para leituras autenticadas e Client Components apenas onde houver formulário, upload, revisão editável, estados interativos e gráficos. Mutações internas usarão Server Actions quando não houver arquivo grande; upload e extração usarão Route Handlers no runtime Node.js para processar `multipart/form-data`, validar MIME/tamanho e chamar serviços de servidor.

A extração dos exames será isolada em um módulo `exam-extraction` com adaptador Vertex AI/Gemini. O nome do modelo será configuração (`VERTEX_AI_GEMINI_MODEL`) para suportar variações como `gemini-2.5-flash` ou outro modelo disponível sem mudar código de domínio. O fluxo persistirá primeiro um upload em estado `processing`/`needs_review`, enviará imagem/PDF ao Vertex AI com schema de resposta JSON, normalizará campos e confiança, e só criará um exame confirmado após revisão explícita do usuário.

## Arquitetura do sistema

### Visão dos componentes

- `app/(auth)`: páginas de login, cadastro, recuperação simples e redirecionamento conforme sessão Supabase.
- `app/(dashboard)`: área autenticada com perfil, upload, revisão, histórico, detalhe de exame e evolução.
- `middleware.ts`: atualização de sessão Supabase SSR e proteção das rotas autenticadas.
- `src/lib/supabase`: factories `createBrowserClient`, `createServerClient` e cliente admin server-only para operações de storage/serviço.
- `src/features/profile`: componentes e Server Actions para leitura/edição do perfil físico.
- `src/features/exams`: upload, revisão, edição, histórico, detalhe, comparação e gráficos.
- `src/features/exam-extraction`: contrato de extração, adaptador Vertex AI/Gemini, prompt/schema, parser de resposta e cálculo de confiança.
- `src/features/insights`: geração determinística de insights informativos a partir de deltas entre exames confirmados, sem diagnóstico.
- `src/components/ui`: primitivas visuais aderentes ao `DESIGN.md` para botões, inputs, alerts, cards, tabelas e estados vazios.
- Supabase Auth/Postgres/Storage: identidade, tabelas relacionais, políticas RLS e bucket privado `exam-files`.
- Vertex AI/Gemini: integração server-only para leitura multimodal e saída estruturada.

Fluxo principal: usuário autenticado envia arquivo -> Route Handler valida e grava em Storage privado -> serviço de extração chama Vertex AI/Gemini -> resposta estruturada vira `exam_uploads.extracted_payload` com campos sinalizados -> tela de revisão permite correções -> Server Action confirma e cria/atualiza `body_composition_exams` e tabelas segmentares -> dashboard recalcula gráficos, comparação e insights.

## Design de implementação

### Principais interfaces

```ts
export interface ExamExtractionService {
  extractExam(input: ExtractExamInput): Promise<ExtractExamResult>;
}

export interface ExamRepository {
  listConfirmedExams(userId: string): Promise<BodyCompositionExam[]>;
  createConfirmedExam(input: ConfirmExamInput): Promise<BodyCompositionExam>;
  updateConfirmedExam(input: UpdateExamInput): Promise<BodyCompositionExam>;
}
```

```ts
export interface ExtractExamResult {
  fields: ExtractedExamFields;
  fieldIssues: FieldIssue[];
  overallConfidence: number;
  rawProviderPayload: unknown;
}
```

### Modelos de dados

Tabelas Supabase propostas:

- `profiles`: `id uuid auth.users`, `full_name`, `sex`, `birth_date`, `height_cm`, `reference_weight_kg`, `fitness_goal`, `created_at`, `updated_at`.
- `exam_uploads`: `id`, `user_id`, `storage_path`, `original_filename`, `mime_type`, `file_size_bytes`, `status` (`uploaded`, `processing`, `needs_review`, `confirmed`, `failed`, `cancelled`), `provider`, `provider_model`, `overall_confidence`, `extracted_payload jsonb`, `error_message`, timestamps.
- `body_composition_exams`: `id`, `user_id`, `upload_id`, `exam_performed_at`, `weight_kg`, `skeletal_muscle_mass_kg`, `body_fat_mass_kg`, `body_fat_percentage`, `bmi`, `inbody_score`, `total_body_water_l`, `protein_kg`, `minerals_kg`, `fat_free_mass_kg`, `basal_metabolic_rate_kcal`, `waist_hip_ratio`, `visceral_fat_level`, `obesity_degree_percentage`, `ideal_weight_kg`, `weight_control_kg`, `fat_control_kg`, `muscle_control_kg`, `reviewed_payload jsonb`, timestamps.
- `exam_segmental_analyses`: `id`, `exam_id`, `segment` (`left_arm`, `right_arm`, `trunk`, `left_leg`, `right_leg`), `lean_mass_kg`, `lean_mass_percentage`, `fat_mass_kg`, `fat_mass_percentage`.

Todos os registros terão RLS por `auth.uid() = user_id`; `exam_segmental_analyses` deve validar acesso via join com `body_composition_exams`. Storage deve usar caminho `${userId}/${uploadId}/${filename}` e policy que restringe acesso ao primeiro segmento do path.

Tipos de UI/API:

- `ReviewExamFormState`: payload editável, issues por campo, unidades e flags de baixa confiança.
- `ExamTrendPoint`: `examId`, `date`, `weightKg`, `skeletalMuscleMassKg`, `bodyFatMassKg`, `bodyFatPercentage`.
- `ExamComparison`: variação absoluta e percentual entre exame atual e anterior, ignorando métricas ausentes.

### Endpoints da API

- `POST /api/exam-uploads`: recebe `multipart/form-data` com `file`; autentica via Supabase SSR; valida `image/jpeg`, `image/png` e `application/pdf`; grava Storage; cria `exam_uploads`; executa extração; retorna `uploadId`, `status`, `extractedFields` e `fieldIssues`.
- `GET /api/exam-uploads/[id]`: retorna status e payload extraído para tela de revisão quando necessário.

Mutações sem arquivo ficam como Server Actions:

- `signUpWithEmail`, `signInWithEmail`, `signOut`.
- `updateProfile`.
- `confirmExamUpload`.
- `updateExam`.
- `cancelExamUpload`.

## Pontos de integração

- Supabase SSR: usar `@supabase/ssr` com cliente criado por request, cookies via middleware e `auth.getUser()` para validação server-side. Context7 verificou que `createServerClient` deve receber handlers de cookies e que middleware é recomendado para persistir refresh de sessão.
- Supabase Storage: bucket privado `exam-files`, sem URLs públicas permanentes; usar URLs assinadas de curta duração apenas quando a UI precisar exibir o arquivo original.
- Vertex AI/Gemini: usar SDK oficial Node ou cliente REST server-only com Application Default Credentials/Service Account. Configurações: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `VERTEX_AI_GEMINI_MODEL`, timeout e limite de tamanho. Context7 e Google Cloud indicam suporte a entrada multimodal por base64/GCS URI e resposta estruturada com `responseMimeType: application/json` e `responseSchema`.
- LGPD/privacidade: dados de saúde vinculados a pessoa natural são dados pessoais sensíveis segundo ANPD/LGPD; aplicar minimização, finalidade explícita, controle de acesso, logs sem conteúdo sensível e exclusão/correção por usuário.

Tratamento de erro: falhas de MIME/tamanho retornam `400`; sessão ausente `401`; tentativa de acessar recurso de outro usuário `404`/`403`; baixa confiança ou campos ausentes retornam `needs_review`; falha Vertex persiste `failed` com mensagem segura e permite novo upload.

## Abordagem de testes

### Testes unitários

- Normalizadores de números, datas, unidades e percentuais extraídos.
- Validação de `ExtractedExamFields` e marcação de `FieldIssue`.
- Cálculo de deltas absolutos/percentuais e insights informativos.
- Guards de dados ausentes em gráficos e comparação.
- Geração de paths de Storage por usuário/upload.

Mocks devem existir apenas para Supabase e Vertex AI, usando `vi.fn`/`vi.mock`.

### Testes de integração

- Server Actions de perfil, confirmação e edição de exame com repositórios mockados ou banco Supabase local quando configurado.
- `POST /api/exam-uploads` com arquivo válido, MIME inválido, usuário não autenticado, falha de extração e baixa confiança.
- Políticas RLS/migrations: usuário A não lista, altera ou lê arquivos/exames do usuário B.

### Testes E2E

Usar Playwright para cobrir: cadastro/login por email e senha, preenchimento de perfil, upload de um exemplo de `docs`, revisão com correção de campo, confirmação, histórico, detalhe e gráficos. Incluir estados vazios, erro de upload e navegação por teclado nos fluxos críticos.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Configurar base Next.js: estrutura `src`, tokens do `DESIGN.md`, metadata, layout autenticado e middleware Supabase.
2. Criar migrations Supabase, tipos de banco, RLS e bucket privado; isso desbloqueia segurança e persistência.
3. Implementar Auth email/senha e perfil físico, validando sessão fim a fim.
4. Implementar domínio de exames: schemas, repositórios, métricas, segmentação, comparação e insights determinísticos.
5. Implementar upload + Storage + Route Handler com estados de processamento sem Vertex real.
6. Implementar adaptador Vertex AI/Gemini com schema estruturado e fixture dos documentos em `docs`.
7. Construir UI de revisão, histórico, detalhe e gráficos.
8. Fechar testes unitários, integração, Playwright e ajustes de observabilidade.

### Dependências técnicas

- Projeto Supabase, URL, anon key, service role server-only, migrations e bucket `exam-files`.
- Projeto Google Cloud com Vertex AI habilitado, credenciais de serviço e modelo disponível na região configurada.
- Escolha da biblioteca de gráficos compatível com React 19/Next 16; recomendação: Recharts se compatível no momento da implementação, ou alternativa leve validada antes da task.
- Definição de limites de arquivo (`MAX_EXAM_FILE_SIZE_MB`) e timeout do provider.

## Monitoramento e observabilidade

Expor logs estruturados server-side com `requestId`, `userId` pseudonimizado, `uploadId`, `provider`, `providerModel`, `status`, duração da extração e motivo de falha sem registrar arquivo, payload médico completo ou prompt com dados sensíveis.

Métricas Prometheus desejadas:

- `bodymetrics_accounts_created_total`
- `bodymetrics_exam_uploads_total{status,mime_type}`
- `bodymetrics_exam_extractions_total{provider,status}`
- `bodymetrics_exam_extraction_duration_seconds`
- `bodymetrics_exam_confirmation_total`
- `bodymetrics_exam_field_corrections_total{field}`
- `bodymetrics_chart_views_total{chart}`

Dashboards Grafana devem acompanhar taxa de upload confirmado, falhas de extração, baixa confiança, correções por campo e latência Vertex. Alertas iniciais: aumento de `failed`, p95 de extração alto e erros 401/403 anormais.

## Considerações técnicas

### Principais decisões

- Supabase centraliza Auth/Postgres/Storage para reduzir infraestrutura do MVP e permitir RLS consistente por usuário.
- Route Handler para upload evita acoplar arquivo grande a Server Actions e permite respostas HTTP claras.
- Vertex AI/Gemini fica atrás de interface própria para trocar modelo, prompt ou provider sem afetar UI/domínio.
- Exames entram no histórico apenas após confirmação para preservar confiança do dado.
- Insights serão determinísticos, baseados em deltas, para evitar recomendações clínicas e reduzir risco regulatório.
- Arquivo original será preservado em Storage privado para rastreabilidade, mas nunca exposto publicamente.

### Riscos conhecidos

- Nomes e disponibilidade de modelos Gemini mudam; mitigação: env var, validação de startup e documentação operacional.
- Extração pode variar com qualidade do arquivo; mitigação: confidence por campo, revisão obrigatória e fixtures dos layouts `docs`.
- PDF pode exigir pré-processamento se o modelo/provider não aceitar o formato direto; mitigação: módulo de conversão server-only isolado.
- Dados sensíveis elevam exigência de segurança; mitigação: RLS, bucket privado, logs minimizados, consentimento claro e acesso por usuário.
- Next 16/React 19 podem limitar bibliotecas de gráfico; mitigação: spike de compatibilidade antes de implementar dashboard.

### Conformidade com rules

- `AGENTS.md`: PRD validado com `Status: APROVADO PELO USUÁRIO`; TechSpec fica aguardando aprovação; nenhuma task/implementação deve iniciar sem aprovação explícita.
- `DESIGN.md`: UI deve usar canvas `#faf9f5`, superfície clara, CTA coral, tipografia configurada via `next/font` ou fallback equivalente e radius/tokens definidos.
- `create_techspec.md`: projeto explorado, Context7 usado, busca web usada para LGPD/Vertex, esclarecimentos técnicos respondidos e arquivo salvo no caminho obrigatório.
- RTK local: comandos futuros no shell devem usar prefixo `rtk` conforme `/Users/rodrigosouza/.codex/RTK.md`.

### Conformidade com skills

- `context7`: usado para Next.js Route Handlers/FormData, Supabase SSR/Storage/RLS e Vertex AI/Gemini structured output.
- `next-best-practices`: App Router, Server Components para leitura, Server Actions para mutações internas, Route Handlers para upload/API e Node runtime padrão.
- `react-frontend-conventions`: componentes funcionais TSX, estado colocalizado, Tailwind, Context apenas para estado transversal e testes de componentes.
- `repo-folder-structure`: domínio em `src/features/*`, primitivas em `src/components/ui`, helpers em `src/lib`.
- `nodejs-typescript-conventions`: TypeScript estrito, ESM, `async`/`await`, sem `any`, tipos concretos.
- `code-standards-en`: identificadores em inglês, funções verb-led, CQS e parâmetros por objeto.
- `vitest-testing`: Vitest, `vi`, Arrange-Act-Assert, fake timers quando datas de exame importarem.
- `ui-ux-pro-max`: acessibilidade, alvos 44px, labels, feedback de erro, gráficos com alternativa textual/tabela e contraste adequado.

### Arquivos relevantes e dependentes

- `tasks/prd-bodymetrics/prd.md`
- `create_techspec.md`
- `AGENTS.md`
- `DESIGN.md`
- `.codex/agents/techspec-writer.toml`
- `.agents/skills/context7/SKILL.md`
- `.agents/skills/next-best-practices/SKILL.md`
- `.agents/skills/react-frontend-conventions/SKILL.md`
- `.agents/skills/repo-folder-structure/SKILL.md`
- `.agents/skills/nodejs-typescript-conventions/SKILL.md`
- `.agents/skills/code-standards-en/SKILL.md`
- `.agents/skills/vitest-testing/SKILL.md`
- `.agents/skills/ui-ux-pro-max/SKILL.md`
- `frontend/package.json`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/globals.css`
- `frontend/next.config.ts`
- `frontend/tsconfig.json`
- `docs/bio-rayane.jpeg`
- `docs/bio-rodrigo.jpeg`
