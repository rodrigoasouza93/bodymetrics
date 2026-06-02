# Tarefa 6.0: Implementar adaptador Vertex AI/Gemini para extração estruturada

## Visão geral

Implementar o adaptador server-only para Vertex AI/Gemini atrás do contrato `ExamExtractionService`, com schema de resposta JSON, normalização de payload, cálculo de confiança por campo, tratamento seguro de erros e fixtures dos layouts em `docs`.

<skills>

### Conformidade com skills

- `context7`: consultar documentação atualizada de Vertex AI/Gemini e SDK/REST antes de implementar.
- `nodejs-typescript-conventions`: TypeScript estrito, env vars tipadas e sem `any`.
- `code-standards-en`: funções pequenas, nomes em inglês e parâmetros por objeto.
- `repo-folder-structure`: provider isolado em `src/features/exam-extraction`.
- `vitest-testing`: mocks de provider com `vi` e testes de parser/confiança.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Consultar documentação técnica atualizada via `context7` antes de integrar provider externo.
- Usar env vars `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `VERTEX_AI_GEMINI_MODEL` e configurações de timeout/limite.
- Manter provider server-only e isolado por interface.
- Produzir saída estruturada compatível com `ExtractExamResult`.
- Não registrar arquivo, prompt completo ou payload sensível em logs.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [ ] 6.1 Revisar PRD, TechSpec, `AGENTS.md`, `execute_task.md`, `context7` e skills aplicáveis.
- [ ] 6.2 Consultar documentação atualizada de Vertex AI/Gemini para entrada multimodal e JSON schema.
- [ ] 6.3 Criar configuração server-only e validação de env vars do provider.
- [ ] 6.4 Implementar adaptador Vertex AI/Gemini para imagem/PDF conforme contrato `ExamExtractionService`.
- [ ] 6.5 Implementar prompt/schema, parser de resposta e cálculo de confiança por campo.
- [ ] 6.6 Mapear falhas de provider para mensagens seguras e status persistível.
- [ ] 6.7 Criar testes unitários com mocks e fixtures dos documentos em `docs`.
- [ ] 6.8 Executar validação local/QA da task com fixtures, sem depender de dados sensíveis em logs.
- [ ] 6.9 Corrigir todos os bugs encontrados durante a validação local da task.
- [ ] 6.10 Executar `@task-reviewer` e gerar `6_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente "Principais interfaces", "Pontos de integração", "Tratamento de erro", "Monitoramento e observabilidade" e "Riscos conhecidos".

## Critérios de sucesso

- Provider fica isolado e substituível sem afetar UI/domínio.
- Modelo é configurável via env var.
- Parser retorna campos, issues, confiança geral e payload bruto controlado.
- Falhas do provider não expõem dados sensíveis.
- Bugs encontrados na validação local da task foram corrigidos antes do review.
- `6_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [ ] Testes unitários para parser, confidence, configuração e tratamento de falhas.
- [ ] Testes de integração do serviço de extração com provider mockado.
- [ ] Testes E2E não obrigatórios nesta task.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `execute_task.md`
- `.agents/skills/context7/SKILL.md`
- `frontend/src/features/exam-extraction`
- `docs/bio-rayane.jpeg`
- `docs/bio-rodrigo.jpeg`
