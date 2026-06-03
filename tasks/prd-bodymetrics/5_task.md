# Tarefa 5.0: Implementar upload de exame e fluxo de extração sem provider real

## Visão geral

Construir o fluxo server-side de upload de exame com validação de arquivo, Storage privado, persistência de `exam_uploads` e integração inicial com um extrator mock/fixture para desbloquear a revisão antes do adaptador Vertex real.

<skills>

### Conformidade com skills

- `next-best-practices`: Route Handlers para `multipart/form-data` e runtime Node.js.
- `repo-folder-structure`: API e serviços no domínio de exames/upload.
- `nodejs-typescript-conventions`: tipos concretos e tratamento assíncrono com `async`/`await`.
- `code-standards-en`: nomes em inglês e funções pequenas.
- `vitest-testing`: testes de integração HTTP sem Supertest e mocks com `vi`.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Implementar `POST /api/exam-uploads` e `GET /api/exam-uploads/[id]`.
- Aceitar `image/jpeg`, `image/png` e `application/pdf` dentro do limite configurado.
- Persistir arquivo em Storage privado no path `${userId}/${uploadId}/${filename}`.
- Persistir status e payload extraído em `exam_uploads`.
- Retornar erros seguros para MIME inválido, sessão ausente, baixa confiança e falha de extração.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [x] 5.1 Revisar PRD, TechSpec, `AGENTS.md`, `execute_task.md` e skills aplicáveis.
- [x] 5.2 Criar validações de arquivo, MIME, tamanho e sessão autenticada.
- [x] 5.3 Implementar geração de path e gravação no Storage privado.
- [x] 5.4 Implementar `POST /api/exam-uploads` com extrator mock/fixture.
- [x] 5.5 Implementar `GET /api/exam-uploads/[id]` com controle de acesso.
- [x] 5.6 Persistir transições de status e mensagens de erro seguras.
- [x] 5.7 Criar testes de integração para arquivo válido, MIME inválido, usuário não autenticado, falha de extração e baixa confiança.
- [x] 5.8 Executar validação local/QA da task no fluxo de upload sem provider real.
- [x] 5.9 Corrigir todos os bugs encontrados durante a validação local da task.
- [x] 5.10 Executar `@task-reviewer` e gerar `5_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente "Endpoints da API", "Pontos de integração", "Tratamento de erro" e "Sequenciamento do desenvolvimento".

## Critérios de sucesso

- Upload autenticado persiste arquivo e cria registro de `exam_uploads`.
- Arquivos inválidos são rejeitados com status HTTP correto.
- Acesso de outro usuário é negado de forma segura.
- Payload mock/fixture permite seguir para revisão sem Vertex real.
- Bugs encontrados na validação local da task foram corrigidos antes do review.
- `5_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [x] Testes unitários para validação de arquivo e geração de Storage path.
- [x] Testes de integração para Route Handlers de upload e consulta.
- [x] Testes E2E ou validação assistida para upload básico quando houver UI disponível.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `execute_task.md`
- `frontend/app/api/exam-uploads`
- `frontend/src/features/exams`
- `frontend/src/features/exam-extraction`
- `docs/bio-rayane.jpeg`
- `docs/bio-rodrigo.jpeg`
