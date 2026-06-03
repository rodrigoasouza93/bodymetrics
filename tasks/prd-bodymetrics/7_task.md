# Tarefa 7.0: Construir UI de revisão, confirmação, histórico, detalhe, edição e gráficos

## Visão geral

Implementar a experiência autenticada principal do BodyMetrics: upload visual, revisão editável de dados extraídos, confirmação explícita, cancelamento, histórico cronológico, detalhe/edição de exame, gráficos de evolução e insights informativos.

<skills>

### Conformidade com skills

- `ui-ux-pro-max`: acessibilidade, gráficos com alternativa textual, contraste, estados e responsividade.
- `next-best-practices`: Server Components para leituras, Client Components para formulários, upload, revisão e gráficos.
- `react-frontend-conventions`: componentes funcionais TSX, estado colocalizado e testes de componentes.
- `repo-folder-structure`: UI de domínio em `src/features/exams` e primitivas em `src/components/ui`.
- `nodejs-typescript-conventions`: tipos concretos e sem `any`.
- `code-standards-en`: nomes em inglês e funções verb-led.
- `vitest-testing`: testes de componentes, domínio e integração.

</skills>

<requirements>

- Seguir `execute_task.md` com `@task-executor`.
- Ler `DESIGN.md` antes de qualquer implementação de UI.
- Exibir tela de revisão antes de salvar exame no histórico.
- Permitir edição de campos extraídos e destacar campos ausentes, inconsistentes ou de baixa confiança.
- Confirmar exame apenas após ação explícita do usuário.
- Permitir cancelamento do cadastro antes de salvar.
- Listar, consultar detalhe e editar exame salvo.
- Exibir gráficos de peso, massa magra, massa de gordura e percentual de gordura.
- Exibir comparação com exame anterior quando houver pelo menos dois exames.
- Lidar com métricas ausentes sem bloquear demais informações.
- Incluir validação local/QA da task, correção dos bugs encontrados e review da task.

</requirements>

## Subtarefas

- [x] 7.1 Revisar PRD, TechSpec, `AGENTS.md`, `DESIGN.md`, `execute_task.md` e skills aplicáveis.
- [x] 7.2 Construir UI de upload com estados vazio, selecionado, loading, erro e sucesso.
- [x] 7.3 Construir tela de revisão editável com unidades, issues por campo e baixa confiança destacada.
- [x] 7.4 Implementar Server Actions `confirmExamUpload`, `updateExam` e `cancelExamUpload`.
- [x] 7.5 Construir histórico cronológico, detalhe de exame e edição de exame salvo.
- [x] 7.6 Construir gráficos de evolução e alternativa textual/tabela acessível.
- [x] 7.7 Exibir comparação entre exames e insights informativos com disclaimer obrigatório.
- [x] 7.8 Criar testes unitários, integração, componentes e E2E aplicáveis aos fluxos principais.
- [x] 7.9 Executar validação local/QA da task, incluindo teclado, estados de erro e responsividade.
- [x] 7.10 Corrigir todos os bugs encontrados durante a validação local da task.
- [x] 7.11 Executar `@task-reviewer` e gerar `7_task_review.md`, corrigindo apontamentos bloqueantes.

## Detalhes de implementação

Referenciar `tasks/prd-bodymetrics/techspec.md`, especialmente "Experiência do usuário", "Endpoints da API", "Tipos de UI/API", "Histórico, comparação e gráficos" e "Insights informativos".

## Critérios de sucesso

- Exame só entra no histórico após confirmação explícita.
- Usuário consegue corrigir dados extraídos antes de salvar.
- Histórico, detalhe, edição, comparação e gráficos funcionam com dados completos e parciais.
- UI segue `DESIGN.md`, possui rótulos claros, foco visível e não depende apenas de cor para significado.
- Bugs encontrados na validação local da task foram corrigidos antes do review.
- `7_task_review.md` foi gerado e não contém pendências bloqueantes.

## Testes da tarefa

- [x] Testes unitários para derivação de estados visuais, mapeamento de issues e form state.
- [x] Testes de integração para confirmação, cancelamento e edição de exame.
- [x] Testes E2E para upload, revisão com correção, confirmação, histórico, detalhe e gráficos.

## Arquivos relevantes

- `tasks/prd-bodymetrics/prd.md`
- `tasks/prd-bodymetrics/techspec.md`
- `DESIGN.md`
- `execute_task.md`
- `frontend/src/features/exams`
- `frontend/src/features/insights`
- `frontend/src/components/ui`
- `frontend/app/(dashboard)`
