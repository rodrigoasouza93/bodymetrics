# Tarefa 4.0: Implementar domínio de exames, comparação e insights informativos

## Visão geral

Criar a camada de domínio para exames de bioimpedância, incluindo schemas, normalizadores, repositórios, métricas principais/adicionais, segmentação, comparação entre exames e insights informativos sem caráter médico.

<skills>

### Conformidade com skills

- `repo-folder-structure`: domínio em `src/features/exams`, `src/features/exam-extraction` e `src/features/insights`.
- `nodejs-typescript-conventions`: TypeScript estrito, tipos concretos e ESM.
- `code-standards-en`: funções verb-led, CQS e early returns.
- `vitest-testing`: cobertura unitária de domínio e mocks com `vi`.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Modelar dados extraídos e confirmados conforme TechSpec.
- Calcular deltas absolutos e percentuais entre exame mais recente e anterior.
- Lidar com métricas ausentes sem impedir visualização das demais informações.
- Gerar insights informativos sem diagnóstico, prescrição ou recomendação clínica.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [ ] 4.1 Revisar PRD, TechSpec, `AGENTS.md`, `execute_task.md` e skills aplicáveis.
- [ ] 4.2 Criar tipos e schemas para campos extraídos, exames confirmados, issues e segmentação.
- [ ] 4.3 Implementar normalizadores de números, datas, unidades e percentuais.
- [ ] 4.4 Implementar contratos e repositórios de exames conforme TechSpec.
- [ ] 4.5 Implementar cálculo de comparação e trend points.
- [ ] 4.6 Implementar geração determinística de insights informativos e disclaimer obrigatório.
- [ ] 4.7 Criar testes unitários para normalização, comparação, métricas ausentes e insights.
- [ ] 4.8 Executar validação local/QA da task sobre os cenários de domínio.
- [ ] 4.9 Corrigir todos os bugs encontrados durante a validação local da task.
- [ ] 4.10 Executar `@task-reviewer` e gerar `4_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente "Principais interfaces", "Modelos de dados", "Tipos de UI/API" e "Insights informativos".

## Critérios de sucesso

- Domínio representa todas as métricas obrigatórias e opcionais previstas.
- Comparações ignoram métricas ausentes sem quebrar o resultado.
- Insights deixam claro que são informativos e não substituem avaliação profissional.
- Testes cobrem caminhos principais e alternativos relevantes.
- Bugs encontrados na validação local da task foram corrigidos antes do review.
- `4_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [ ] Testes unitários de normalizadores, schemas, comparação e insights.
- [ ] Testes de integração de repositórios com mocks ou Supabase local quando configurado.
- [ ] Testes E2E não obrigatórios nesta task.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `execute_task.md`
- `frontend/src/features/exams`
- `frontend/src/features/exam-extraction`
- `frontend/src/features/insights`
