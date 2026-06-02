# Tarefa 3.0: Implementar perfil físico do usuário

## Visão geral

Construir o fluxo autenticado de consulta e edição do perfil físico do usuário, com validações, Server Actions, mensagens acessíveis e persistência segura em `profiles`.

<skills>

### Conformidade com skills

- `next-best-practices`: Server Components para leitura e Server Actions para mutações sem arquivo.
- `react-frontend-conventions`: formulários TSX funcionais, estado local e testes de componentes.
- `repo-folder-structure`: domínio em `src/features/profile`.
- `nodejs-typescript-conventions`: tipos explícitos e sem `any`.
- `code-standards-en`: nomes em inglês e funções com verbo.
- `vitest-testing`: testes unitários e integração com `vi`.
- `ui-ux-pro-max`: labels, feedback de erro, foco visível e alvos 44px.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Permitir consulta e alteração do perfil do usuário autenticado.
- Armazenar nome, sexo, data de nascimento ou idade, altura, peso de referência e objetivo físico quando aplicável.
- Garantir que cada usuário gerencie apenas seu próprio perfil.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [x] 3.1 Revisar PRD, TechSpec, `AGENTS.md`, `DESIGN.md`, `execute_task.md` e skills aplicáveis.
- [x] 3.2 Criar schemas e tipos do perfil físico.
- [x] 3.3 Implementar leitura autenticada do perfil.
- [x] 3.4 Implementar Server Action `updateProfile` com validações e mensagens seguras.
- [x] 3.5 Construir UI de perfil com estados vazio, preenchido, erro, loading e sucesso.
- [x] 3.6 Garantir acessibilidade do formulário e navegação por teclado.
- [x] 3.7 Criar testes unitários e de integração para validação e atualização de perfil.
- [x] 3.8 Executar validação local/QA da task no fluxo de perfil.
- [x] 3.9 Corrigir todos os bugs encontrados durante a validação local da task.
- [x] 3.10 Executar `@task-reviewer` e gerar `3_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente "Conta e perfil do usuário", "Modelos de dados" e "Endpoints da API".

## Critérios de sucesso

- Usuário autenticado consulta e atualiza o próprio perfil.
- Dados inválidos exibem mensagens compreensíveis e não são persistidos.
- Usuário não acessa perfil de terceiros.
- UI segue `DESIGN.md` e critérios de acessibilidade do PRD.
- Bugs encontrados na validação local da task foram corrigidos antes do review.
- `3_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [x] Testes unitários para schemas e normalização de dados do perfil.
- [x] Testes de integração para `updateProfile` com sessão válida e inválida.
- [x] Testes E2E ou validação assistida para editar e salvar perfil pela UI.

Observação: a validação visual autenticada pelo Browser/iab não pôde ser executada nesta sessão porque `agent.browsers.list()` retornou vazio. A task foi validada por `npm run test`, `npm run lint`, `npm run build`, teste de componente com Testing Library e review aprovado com observações em `3_task_review.md`.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `DESIGN.md`
- `execute_task.md`
- `frontend/src/features/profile`
- `frontend/app/(dashboard)`
- `frontend/src/components/ui`
