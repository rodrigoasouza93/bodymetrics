# Fluxo de trabalho com agentes

Este projeto usa documentos de workflow na raiz e agentes em `.codex/agents/` para transformar uma ideia em implementacao validada.

## Visao geral para desenvolvedores

O fluxo e dividido em duas fases:

1. **Planejamento aprovado**
   - Criar PRD.
   - Aprovar PRD.
   - Criar TechSpec.
   - Aprovar TechSpec.
   - Criar tasks.
   - Aprovar tasks.

2. **Execucao automatizada**
   - Implementar tasks.
   - Revisar cada task.
   - Executar QA final.
   - Corrigir bugs.
   - Executar code review final.

Nenhuma etapa deve avancar automaticamente para a proxima se o arquivo da etapa anterior nao tiver `Status: APROVADO PELO USUÁRIO`.

## Ordem recomendada

1. `create_prd.md` com `@prd-writer`
   - Entrada: ideia ou pedido de feature.
   - Saida: `tasks/prd-[nome-da-feature]/prd.md`.
   - Objetivo: definir o que sera construido, por que importa, requisitos funcionais, UX, acessibilidade e fora de escopo.
   - Gate: parar com `Status: AGUARDANDO APROVAÇÃO DO USUÁRIO`.
   - Proxima etapa permitida somente apos `Status: APROVADO PELO USUÁRIO`.

2. `create_techspec.md` com `@techspec-writer`
   - Entrada: `prd.md`.
   - Saida: `tasks/prd-[nome-da-feature]/techspec.md`.
   - Objetivo: definir arquitetura, componentes, interfaces, modelos, endpoints, integracoes, testes, observabilidade e riscos.
   - Pre-requisito: `prd.md` com `Status: APROVADO PELO USUÁRIO`.
   - Gate: parar com `Status: AGUARDANDO APROVAÇÃO DO USUÁRIO`.
   - Proxima etapa permitida somente apos `Status: APROVADO PELO USUÁRIO`.

3. `create_tasks.md` com `@task-planner`
   - Entrada: `prd.md` e `techspec.md`.
   - Saidas: `tasks.md` e arquivos `[num]_task.md`.
   - Objetivo: quebrar a feature em entregas implementaveis, com testes e criterios de sucesso.
   - Pre-requisito: `prd.md` e `techspec.md` com `Status: APROVADO PELO USUÁRIO`.
   - Gate: primeiro aprovar a lista de alto nivel; depois aprovar `tasks.md`.
   - Implementacao permitida somente apos `tasks.md` conter `Status: APROVADO PELO USUÁRIO`.

4. `execute_task.md` com `@task-executor`
   - Entrada: proxima task pendente.
   - Saida: codigo implementado, validado e task marcada como completa.
   - Observacao: ao final de cada task de implementacao, aciona `@task-reviewer`.
   - Pre-requisito: `prd.md`, `techspec.md` e `tasks.md` com `Status: APROVADO PELO USUÁRIO`.

5. `execute_qa.md` com `@qa-validator`
   - Entrada: feature implementada.
   - Saidas: `qa.md`, evidencias e `bugs.md` quando houver bugs.
   - Objetivo: validar PRD, TechSpec, tasks, E2E, acessibilidade WCAG 2.2 e visual.

6. `execute_bugfix.md` com `@bugfixer`
   - Entrada: `bugs.md`.
   - Saidas: bugs corrigidos, testes de regressao, `bugfix.md` e `bugs.md` atualizado.
   - Objetivo: corrigir causa raiz e validar regressao.

7. `execute_review.md` com `@code-reviewer`
   - Entrada: diff final da feature.
   - Saida: `codereview.md`.
   - Objetivo: review final de branch/feature contra regras, skills, TechSpec, tasks e testes.

## Atalhos de uso

- Para criar uma feature do zero: comece com `@prd-writer`.
- Para planejar depois de um PRD existente: use `@techspec-writer`.
- Para gerar tasks depois de PRD e TechSpec existentes: use `@task-planner`.
- Para implementar a proxima task: use `@task-executor`.
- Para validar a feature pronta: use `@qa-validator`.
- Para corrigir bugs documentados: use `@bugfixer`.
- Para review final: use `@code-reviewer`.

## Como iniciar uma nova feature

Use `@prd-writer` com uma descricao inicial da feature. O agente deve fazer perguntas antes de gerar o PRD.

Exemplo:

```text
@prd-writer crie o PRD para a feature [nome].

Contexto:
- Problema:
- Usuarios:
- Objetivo:
- Funcionalidades esperadas:
- Fora de escopo:
- Restricoes:
```

Ao final, o agente deve salvar:

```text
tasks/prd-[nome-da-feature]/prd.md
```

O PRD deve nascer com:

```markdown
**Status:** AGUARDANDO APROVAÇÃO DO USUÁRIO
```

Depois de revisar o PRD, aprove explicitamente:

```text
PRD aprovado. Atualize o status do prd.md para APROVADO PELO USUÁRIO.
```

## Como criar a TechSpec

Depois que `prd.md` estiver aprovado, use:

```text
@techspec-writer crie a TechSpec para tasks/prd-[nome-da-feature]/prd.md.
```

O agente deve:

- validar que `prd.md` contem `Status: APROVADO PELO USUÁRIO`;
- explorar o projeto antes de escrever;
- consultar Context7 quando houver tecnologia externa;
- fazer perguntas tecnicas quando necessario;
- salvar `techspec.md` com status aguardando aprovacao.

Ao final, revise a TechSpec e aprove explicitamente:

```text
TechSpec aprovada. Atualize o status do techspec.md para APROVADO PELO USUÁRIO.
```

## Como criar as tasks

Depois que `prd.md` e `techspec.md` estiverem aprovados, use:

```text
@task-planner crie as tasks para tasks/prd-[nome-da-feature]/.
```

O agente deve primeiro mostrar a lista de alto nivel e aguardar aprovacao antes de gerar arquivos.

Depois de aprovar a lista, ele deve criar:

```text
tasks/prd-[nome-da-feature]/tasks.md
tasks/prd-[nome-da-feature]/[num]_task.md
```

`tasks.md` deve nascer com:

```markdown
**Status:** AGUARDANDO APROVAÇÃO DO USUÁRIO
```

Depois de revisar as tasks, aprove explicitamente:

```text
Tasks aprovadas. Atualize o status do tasks.md para APROVADO PELO USUÁRIO.
```

## Como executar a implementacao

Depois que `prd.md`, `techspec.md` e `tasks.md` estiverem aprovados, use:

```text
@task-executor execute a proxima task pendente de tasks/prd-[nome-da-feature]/.
```

O agente deve:

- validar os tres status de aprovacao;
- ler PRD, TechSpec, task especifica, `AGENTS.md`, `DESIGN.md` quando houver UI e skills aplicaveis;
- implementar apenas a task selecionada;
- rodar validacoes reais do projeto;
- acionar `@task-reviewer`;
- corrigir problemas bloqueantes;
- marcar a task como completa em `tasks.md`.

Repita `@task-executor` ate concluir as tasks de implementacao.

## Como executar QA, bugfix e review final

Quando as tasks de implementacao estiverem completas:

```text
@qa-validator execute o QA final de tasks/prd-[nome-da-feature]/.
```

Se o QA gerar `bugs.md` com bugs:

```text
@bugfixer corrija os bugs de tasks/prd-[nome-da-feature]/bugs.md.
```

Depois do QA aprovado e dos bugfixes necessarios:

```text
@code-reviewer execute o code review final de tasks/prd-[nome-da-feature]/.
```

## Checklist antes de avancar

Antes de pedir a proxima etapa, confira:

- PRD tem `Status: APROVADO PELO USUÁRIO` antes de TechSpec.
- TechSpec tem `Status: APROVADO PELO USUÁRIO` antes de tasks.
- Tasks tem `Status: APROVADO PELO USUÁRIO` antes de implementacao.
- Tasks de implementacao estao completas antes de QA final.
- Bugs de QA foram corrigidos antes do code review final.
- Relatorios `qa.md`, `bugfix.md` quando aplicavel e `codereview.md` foram gerados.

## Gates de aprovacao obrigatorios

Nenhum agente deve depender apenas da lembranca do desenvolvedor. Antes de avancar, o agente deve validar os marcadores nos arquivos:

- `prd.md`: precisa conter `Status: APROVADO PELO USUÁRIO` antes de criar TechSpec.
- `techspec.md`: precisa conter `Status: APROVADO PELO USUÁRIO` antes de criar tasks.
- `tasks.md`: precisa conter `Status: APROVADO PELO USUÁRIO` antes de executar qualquer task.

Se algum marcador estiver ausente ou como `AGUARDANDO APROVAÇÃO DO USUÁRIO`, o agente deve parar e pedir aprovacao explicita.

## Regras transversais

- Sempre leia `AGENTS.md`.
- Sempre leia `.agents/skills/<nome>/SKILL.md` antes de implementar ou revisar algo coberto por uma skill.
- Sempre leia `DESIGN.md` antes de planejar, implementar ou validar UI.
- Use Context7 para documentacao tecnica externa quando houver risco de versao ou API.
- Detecte scripts reais do projeto antes de rodar lint, typecheck, build ou testes.
- Nunca avance para a proxima fase sem validar o gate de aprovacao do arquivo anterior.

## Resultado esperado por feature

Uma feature completa deve produzir, no minimo:

- `tasks/prd-[feature]/prd.md`
- `tasks/prd-[feature]/techspec.md`
- `tasks/prd-[feature]/tasks.md`
- `tasks/prd-[feature]/[num]_task.md`
- `tasks/prd-[feature]/qa.md`
- `tasks/prd-[feature]/bugs.md` quando bugs forem encontrados
- `tasks/prd-[feature]/bugfix.md` quando houver bugfix
- `tasks/prd-[feature]/codereview.md`
