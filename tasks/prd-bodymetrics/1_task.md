# Tarefa 1.0: Configurar base Next.js, design system e autenticação Supabase

## Visão geral

Preparar a base da aplicação em `frontend` para suportar a área autenticada do BodyMetrics, incluindo estrutura inicial de pastas, aplicação dos tokens do `DESIGN.md`, clientes Supabase SSR/browser, proteção de rotas e telas de autenticação por email e senha.

<skills>

### Conformidade com skills

- `next-best-practices`: App Router, boundaries de Server/Client Components, metadata, middleware/proxy e runtime Node.js quando aplicável.
- `react-frontend-conventions`: componentes funcionais TSX, estado colocalizado, props explícitas e Tailwind.
- `repo-folder-structure`: organização em `src/features`, `src/lib` e `src/components/ui`.
- `nodejs-typescript-conventions`: TypeScript estrito, ESM, `async`/`await` e tipos concretos.
- `code-standards-en`: identificadores em inglês, funções com verbo, CQS e early returns.
- `vitest-testing`: testes com Vitest e mocks via `vi`.
- `ui-ux-pro-max`: acessibilidade, feedback de erro, alvos de toque e contraste.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Ler `AGENTS.md`, `DESIGN.md`, PRD, TechSpec e esta task antes de implementar.
- Não iniciar esta task se `prd.md`, `techspec.md` e `tasks.md` não estiverem aprovados.
- Criar base para autenticação por email/senha via Supabase conforme TechSpec.
- Proteger rotas autenticadas e manter rotas públicas de login/cadastro.
- Aplicar tokens visuais e tipografia compatíveis com `DESIGN.md`.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [x] 1.1 Revisar PRD, TechSpec, `AGENTS.md`, `DESIGN.md`, `execute_task.md` e skills aplicáveis.
- [x] 1.2 Configurar estrutura base `src`, primitivas compartilhadas e tokens visuais conforme `DESIGN.md`.
- [x] 1.3 Criar factories Supabase browser/server e cliente admin server-only quando necessário.
- [x] 1.4 Implementar atualização de sessão e proteção de rotas autenticadas.
- [x] 1.5 Implementar fluxo inicial de cadastro, login, logout e redirecionamento por sessão.
- [x] 1.6 Criar estados de loading, erro e sucesso acessíveis para autenticação.
- [x] 1.7 Adicionar testes unitários e/ou integração aplicáveis ao fluxo de auth e guards de sessão.
- [x] 1.8 Executar validação local/QA da task, incluindo navegação por teclado nos fluxos principais.
- [x] 1.9 Corrigir todos os bugs encontrados durante a validação local da task.
- [x] 1.10 Executar `@task-reviewer` e gerar `1_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente as seções "Arquitetura do sistema", "Pontos de integração" e "Sequenciamento do desenvolvimento". Não repetir a implementação completa da TechSpec.

## Critérios de sucesso

- Usuário consegue cadastrar, autenticar, sair e ser redirecionado corretamente.
- Rotas autenticadas bloqueiam acesso sem sessão válida.
- UI inicial segue `DESIGN.md` e possui labels, mensagens de erro e foco visível.
- Clientes Supabase ficam isolados entre browser, server request e admin server-only.
- Bugs encontrados na validação local da task foram corrigidos antes do review da task.
- `1_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [x] Testes unitários de helpers/factories e validações do fluxo de auth quando aplicável.
- [ ] Testes de integração para ações de login/cadastro/logout com Supabase mockado. Não executado nesta task por ausência de Vitest/Supabase SDK local; coberto parcialmente por validação unitária de helpers e build.
- [ ] Testes E2E ou validação manual assistida para cadastro, login, logout e proteção de rota. Não executado nesta task por ausência de ambiente Supabase configurado.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `AGENTS.md`
- `DESIGN.md`
- `execute_task.md`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/globals.css`
- `frontend/src/lib/supabase`
- `frontend/src/features/auth`
- `frontend/src/components/ui`
