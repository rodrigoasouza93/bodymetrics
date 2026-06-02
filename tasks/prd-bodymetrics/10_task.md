# Tarefa 10.0: Executar code review final conforme `execute_review.md`

## Visão geral

Executar o code review final da funcionalidade BodyMetrics com `@code-reviewer`, validando diff, aderência ao PRD, TechSpec, tasks, reviews por task, rules do projeto, skills aplicáveis e resultados de testes.

<skills>

### Conformidade com skills

- `next-best-practices`: revisão de padrões Next.js.
- `react-frontend-conventions`: revisão de componentes e UI React.
- `repo-folder-structure`: revisão de organização modular.
- `nodejs-typescript-conventions`: revisão de TypeScript, ESM e tipos.
- `code-standards-en`: revisão de naming, CQS, early returns e tamanho.
- `vitest-testing`: revisão da qualidade e cobertura de testes.
- `ui-ux-pro-max`: revisão visual, acessibilidade e UX.

</skills>

<requirements>

- Seguir `execute_review.md` com `@code-reviewer`.
- Executar somente após implementação, QA final e bugfix residual aplicável.
- Analisar `git status`, `git diff`, `git diff --staged`, histórico da branch e diff contra `main` quando disponível.
- Verificar conformidade com `AGENTS.md`, `DESIGN.md` e skills aplicáveis.
- Validar aderência à TechSpec e completude das tasks.
- Executar scripts reais de testes/coverage disponíveis ou documentar lacunas.
- Gerar `tasks/prd-bodymetrics/codereview.md`.

</requirements>

## Subtarefas

- [ ] 10.1 Ler TechSpec, `tasks.md`, task reviews individuais, `qa.md`, `bugs.md`, `AGENTS.md`, `DESIGN.md` e skills aplicáveis.
- [ ] 10.2 Executar comandos git obrigatórios de análise de mudanças conforme `execute_review.md`.
- [ ] 10.3 Revisar arquivos modificados linha a linha.
- [ ] 10.4 Verificar conformidade com rules e skills do projeto.
- [ ] 10.5 Verificar aderência à TechSpec e completude das tasks.
- [ ] 10.6 Verificar qualidade de testes, cobertura e regressões criadas.
- [ ] 10.7 Executar scripts reais de testes, lint/build/typecheck/coverage disponíveis.
- [ ] 10.8 Identificar problemas por severidade com arquivo, linha e sugestão.
- [ ] 10.9 Gerar `codereview.md` com status APROVADO, APROVADO COM RESSALVAS ou REPROVADO.

## Detalhes de implementação

Referenciar `execute_review.md` integralmente. Esta task não implementa produto; ela revisa a entrega final e bloqueia aprovação se testes falharem ou houver violação grave.

## Critérios de sucesso

- Diff completo foi analisado.
- Regras do projeto, skills, PRD, TechSpec e tasks foram verificados.
- Todos os testes exigidos foram executados ou lacunas foram documentadas.
- `codereview.md` foi gerado em `tasks/prd-bodymetrics/`.
- Review só aprova se os critérios de `execute_review.md` forem atendidos.

## Testes da tarefa

- [ ] Execução da suíte de testes configurada no projeto.
- [ ] Execução de coverage quando script existir.
- [ ] Execução de lint/build/typecheck quando scripts existirem.

## Arquivos relevantes

- `execute_review.md`
- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `tasks/prd-bodymetrics/tasks.md`
- `tasks/prd-bodymetrics/*_task_review.md`
- `tasks/prd-bodymetrics/qa.md`
- `tasks/prd-bodymetrics/bugs.md`
- `tasks/prd-bodymetrics/codereview.md`
- `AGENTS.md`
- `DESIGN.md`
