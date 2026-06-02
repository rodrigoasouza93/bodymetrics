# Tarefa 2.0: Criar persistência Supabase para perfis, uploads, exames e segmentação

## Visão geral

Implementar a camada de persistência do MVP no Supabase, incluindo migrations, tabelas, RLS, policies de Storage privado e tipos necessários para perfis, uploads, exames confirmados e análises segmentares.

<skills>

### Conformidade com skills

- `repo-folder-structure`: separação entre dados, serviços e contratos compartilhados.
- `nodejs-typescript-conventions`: tipos concretos para modelos e contratos.
- `code-standards-en`: nomes claros em inglês e constantes para status/enums.
- `vitest-testing`: testes de integração para policies e isolamento de dados.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Implementar o modelo de dados definido na TechSpec.
- Garantir RLS por usuário em todas as tabelas sensíveis.
- Criar bucket privado `exam-files` com acesso restrito por path do usuário.
- Preservar rastreabilidade entre upload, arquivo original e exame confirmado.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [x] 2.1 Revisar PRD, TechSpec, `AGENTS.md`, `execute_task.md` e skills aplicáveis.
- [x] 2.2 Criar migrations para `profiles`, `exam_uploads`, `body_composition_exams` e `exam_segmental_analyses`.
- [x] 2.3 Definir enums/status e constraints necessárias para uploads e segmentação.
- [x] 2.4 Configurar RLS e policies por `auth.uid() = user_id`.
- [x] 2.5 Configurar bucket privado `exam-files` e policies de Storage por primeiro segmento do path.
- [x] 2.6 Gerar ou manter tipos TypeScript de banco usados pela aplicação.
- [x] 2.7 Criar testes de integração ou validações automatizadas para isolamento entre usuários.
- [x] 2.8 Executar validação local/QA da task para confirmar migrations, policies e bucket.
- [x] 2.9 Corrigir todos os bugs encontrados durante a validação local da task.
- [x] 2.10 Executar `@task-reviewer` e gerar `2_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente "Modelos de dados", "Pontos de integração" e "Considerações técnicas".

## Critérios de sucesso

- Tabelas e relações refletem o modelo descrito na TechSpec.
- RLS impede que um usuário leia ou altere dados de outro usuário.
- Storage privado impede acesso público e restringe arquivos por usuário.
- Tipos de banco estão disponíveis para as próximas tasks.
- Bugs encontrados na validação local da task foram corrigidos antes do review.
- `2_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [x] Testes unitários para geração/validação de paths de Storage quando aplicável.
- [x] Testes de integração para RLS e policies de Storage.
- [x] Testes E2E não obrigatórios nesta task, salvo se houver UI de validação criada.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `execute_task.md`
- `frontend/src/lib/supabase`
- `frontend/supabase`
- `frontend/src/types`
