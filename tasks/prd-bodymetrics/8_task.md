# Tarefa 8.0: Executar QA final de regressão conforme `execute_qa.md`

## Visão geral

Executar a validação final de regressão da funcionalidade BodyMetrics com `@qa-validator`, verificando PRD, TechSpec, tasks implementadas, fluxos E2E, acessibilidade WCAG 2.2, estados visuais e documentação de bugs residuais.

<skills>

### Conformidade com skills

- `ui-ux-pro-max`: acessibilidade, responsividade, contraste, estados e gráficos.
- `next-best-practices`: validação de fluxos App Router e boundaries.
- `react-frontend-conventions`: comportamento dos componentes de UI.
- `vitest-testing`: conferência da cobertura automatizada.

</skills>

<requirements>

- Seguir `execute_qa.md` com `@qa-validator`.
- Executar somente após tasks de implementação aplicáveis estarem concluídas.
- Validar todos os requisitos funcionais numerados do PRD.
- Validar aderência às decisões técnicas da TechSpec.
- Usar Playwright MCP para testes E2E e evidências.
- Gerar `qa.md` e `bugs.md` em `tasks/prd-bodymetrics/`.
- Esta task é regressão final; validações locais e correções por task devem ter ocorrido nas tasks 1.0 a 7.0.

</requirements>

## Subtarefas

- [ ] 8.1 Ler PRD e extrair todos os requisitos funcionais numerados.
- [ ] 8.2 Ler TechSpec e verificar decisões técnicas esperadas.
- [ ] 8.3 Ler `tasks.md` e verificar status/completude das tasks.
- [ ] 8.4 Ler `AGENTS.md`, `DESIGN.md` e skills aplicáveis.
- [ ] 8.5 Preparar checklist de QA baseado em PRD, TechSpec e tasks.
- [ ] 8.6 Confirmar aplicação rodando em localhost.
- [ ] 8.7 Executar E2E com Playwright MCP para cadastro/login, perfil, upload, revisão, confirmação, histórico, detalhe, edição, gráficos e erros.
- [ ] 8.8 Validar acessibilidade WCAG 2.2, navegação por teclado, labels, contraste e mensagens de erro.
- [ ] 8.9 Capturar screenshots/evidências visuais dos fluxos e bugs encontrados.
- [ ] 8.10 Registrar todos os bugs residuais em `bugs.md`.
- [ ] 8.11 Gerar relatório final `qa.md` com status APROVADO ou REPROVADO.

## Detalhes de implementação

Referenciar `execute_qa.md` integralmente. Esta task não implementa produto; ela valida regressão final e documenta evidências.

## Critérios de sucesso

- Todos os requisitos do PRD foram verificados.
- Fluxos principais e alternativos foram executados com Playwright MCP.
- Acessibilidade e visual foram validados.
- `qa.md` foi criado com parecer final.
- `bugs.md` foi criado ou atualizado com todos os bugs residuais encontrados.
- QA só fica aprovado se todos os critérios de `execute_qa.md` forem atendidos.

## Testes da tarefa

- [ ] Testes E2E obrigatórios com Playwright MCP.
- [ ] Verificações de acessibilidade obrigatórias.
- [ ] Verificações visuais obrigatórias com screenshots.

## Arquivos relevantes

- `execute_qa.md`
- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `tasks/prd-bodymetrics/tasks.md`
- `tasks/prd-bodymetrics/qa.md`
- `tasks/prd-bodymetrics/bugs.md`
- `AGENTS.md`
- `DESIGN.md`
