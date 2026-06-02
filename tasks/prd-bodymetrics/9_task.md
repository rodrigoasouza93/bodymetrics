# Tarefa 9.0: Corrigir bugs residuais pós-QA conforme `execute_bugfix.md`

## Visão geral

Corrigir todos os bugs residuais documentados em `tasks/prd-bodymetrics/bugs.md` após o QA final, tratando causa raiz, adicionando testes de regressão e validando novamente a suíte aplicável.

<skills>

### Conformidade com skills

- `context7`: consultar documentação atualizada quando bug envolver framework, SDK, API ou biblioteca externa.
- `next-best-practices`: correções em App Router, Route Handlers, Server Actions e boundaries.
- `react-frontend-conventions`: correções de UI React.
- `repo-folder-structure`: manter alterações no módulo correto.
- `nodejs-typescript-conventions`: TypeScript estrito e sem `any`.
- `code-standards-en`: correções limpas, nomes em inglês e sem gambiarras.
- `vitest-testing`: testes de regressão com Vitest e `vi`.
- `ui-ux-pro-max`: correções visuais e de acessibilidade.

</skills>

<requirements>

- Seguir `execute_bugfix.md` com `@bugfixer`.
- Ler e corrigir todos os bugs documentados em `bugs.md`.
- Planejar causa raiz e estratégia para cada bug antes de corrigir.
- Criar testes de regressão para cada bug corrigido.
- Atualizar `bugs.md` com status, correção aplicada e testes criados.
- Executar validação final de testes e tipagem com scripts reais do projeto.

</requirements>

## Subtarefas

- [ ] 9.1 Ler `bugs.md`, PRD, TechSpec, `tasks.md`, `AGENTS.md`, `DESIGN.md` e skills aplicáveis.
- [ ] 9.2 Extrair todos os bugs residuais documentados pelo QA final.
- [ ] 9.3 Planejar causa raiz, arquivos afetados, estratégia e testes de regressão para cada bug.
- [ ] 9.4 Corrigir bugs em ordem de severidade, resolvendo causa raiz.
- [ ] 9.5 Criar testes de regressão unitários, integração e/ou E2E para cada bug.
- [ ] 9.6 Validar bugs visuais/frontend com Playwright MCP e screenshots quando aplicável.
- [ ] 9.7 Executar scripts reais de testes, lint/build/typecheck disponíveis.
- [ ] 9.8 Atualizar `bugs.md` com status "Corrigido", correção aplicada e testes de regressão.
- [ ] 9.9 Gerar relatório final de bugfix conforme `execute_bugfix.md`.

## Detalhes de implementação

Referenciar `execute_bugfix.md` integralmente. Esta task deve atuar apenas sobre bugs residuais pós-QA; bugs encontrados nas tasks 1.0 a 7.0 devem ter sido corrigidos localmente antes do review de cada task.

## Critérios de sucesso

- Todos os bugs em `bugs.md` foram corrigidos ou justificados se não reproduzíveis.
- Cada bug corrigido possui teste de regressão.
- `bugs.md` foi atualizado com status e evidências.
- Suíte de testes e validações disponíveis passam.
- Não há correções superficiais ou desvios da TechSpec.

## Testes da tarefa

- [ ] Testes unitários de regressão para bugs de lógica.
- [ ] Testes de integração de regressão para bugs entre módulos ou endpoints.
- [ ] Testes E2E de regressão para bugs de fluxo ou UI.

## Arquivos relevantes

- `execute_bugfix.md`
- `tasks/prd-bodymetrics/bugs.md`
- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `tasks/prd-bodymetrics/tasks.md`
- `AGENTS.md`
- `DESIGN.md`
