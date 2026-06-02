# Skills → ações

Consulte o `SKILL.md` em `.agents/skills/<nome>/` antes de implementar ou revisar.

## Fluxo de trabalho automatizado

Use `FLOW.md` como mapa do ciclo completo. A ordem recomendada para uma feature é:

1. `create_prd.md` com `@prd-writer`
2. `create_techspec.md` com `@techspec-writer`
3. `create_tasks.md` com `@task-planner`
4. `execute_task.md` com `@task-executor`
5. `execute_qa.md` com `@qa-validator`
6. `execute_bugfix.md` com `@bugfixer` quando `bugs.md` tiver bugs
7. `execute_review.md` com `@code-reviewer`

O `@task-reviewer` continua sendo acionado ao final de cada task de implementação para gerar `[num]_task_review.md`.

### Gates obrigatórios de aprovação

- `@techspec-writer` só pode rodar se `prd.md` contiver `Status: APROVADO PELO USUÁRIO`.
- `@task-planner` só pode gerar tasks se `prd.md` e `techspec.md` contiverem `Status: APROVADO PELO USUÁRIO`.
- `@task-executor`, `@qa-validator`, `@bugfixer` e `@code-reviewer` só podem executar se `prd.md`, `techspec.md` e `tasks.md` contiverem `Status: APROVADO PELO USUÁRIO`.
- Se qualquer arquivo estiver com `Status: AGUARDANDO APROVAÇÃO DO USUÁRIO` ou sem status, pare e solicite aprovação explícita.

| Skill                           | Acionar para…                                                                                                                                          | Não usar se…                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `code-standards-en`             | Nomes em inglês, PR, CQS, early return, tamanho de métodos/classes                                                                                     | Política exige identificadores localizados                                      |
| `context7`                      | Documentação técnica atualizada de bibliotecas, frameworks, SDKs, APIs, CLIs e plataformas                                                            | A resposta puder ser dada só pelo contexto local sem risco de versão            |
| `express-rest-http`             | Rotas Express, HTTP, status, OpenAPI, `fetch` externo                                                                                                  | Framework servidor não for Express                                              |
| `next-best-practices`           | Next.js: App Router, RSC, APIs async, metadata, route handlers, image/font optimization, scripts, bundling e hidratação                                | Projeto não usar Next.js                                                        |
| `nodejs-typescript-conventions` | TS/Node, ESM, npm, async/await, sem `any`                                                                                                              | Projeto JS puro ou gestor ≠ npm                                                 |
| `react-frontend-conventions`    | React FC, TSX, Tailwind, hooks, testes de UI                                                                                                           | Class components, styled-components, sem Tailwind (neste repo)                  |
| `ui-ux-pro-max`                 | Design/revisão de UI (componentes, páginas, paletas, tipografia, landing/dashboard, a11y); ver `SKILL.md` para `scripts/search.py` e `--design-system` | Tarefa só backend/API/dados sem interface; escopo sem decisões visuais ou de UX |
| `repo-folder-structure`         | Onde criar `features`, pages, controllers/services/data                                                                                                | Layout do monorepo ou framework diferente do template                           |
| `skill-best-practices`          | Nova skill de agente (agentskills.io), pastas `scripts/` / `references/`                                                                               | Docs gerais, README, código de lib sem ser skill                                |
| `vitest-testing`                | Vitest, `vi`, AAA, timers, integração HTTP sem supertest                                                                                               | Jest/Sinon como stack principal de mock                                         |

**Ordem sugerida por tarefa:** backend HTTP → `express-rest-http`, depois `repo-folder-structure`, `nodejs-typescript-conventions`, `code-standards-en`. Frontend Next.js → `ui-ux-pro-max` (design/UX e sistema visual), depois `next-best-practices`, `react-frontend-conventions`, `repo-folder-structure`, `nodejs-typescript-conventions`, `code-standards-en`. Frontend React sem Next.js → `ui-ux-pro-max`, depois `react-frontend-conventions`, `repo-folder-structure`, `nodejs-typescript-conventions`, `code-standards-en`. Documentação técnica externa → `context7` antes de implementar ou responder. Testes → `vitest-testing` + skill da camada testada.

## Persistência do Modo Plano

<plan_file>`.codex/plans/[timestamp]-[plan-slug].md`</plan_file>

- **OBRIGATÓRIO ABSOLUTO**: No modo Plano, após o usuário aceitar um plano, **SEMPRE** escreva o plano aceito em um arquivo Markdown dentro de <plan_file>.
- **OBRIGATÓRIO**: Se o plano aceito for atualizado posteriormente, atualize ou adicione o respectivo arquivo Markdown em <plan_file>.

## DESIGN.md

- Toda a UI que você trabalhar, você sempre tem que seguir o ./DESIGN.md completamente
- Leia sempre o DESIGN.md antes de começar tanto planejamento quanto execução de tarefas de UI
