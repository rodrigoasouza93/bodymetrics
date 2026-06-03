# Bugs e Bloqueios - BodyMetrics

## Resumo

- Data: 2026-06-03
- Origem: QA final da task 8.0; revalidação na task 9.0
- Status geral: Corrigido e revalidado

## BLOQ-001 - Ambiente Supabase ausente impede QA E2E obrigatório

- Severidade: Bloqueante
- Status: **Corrigido**
- Tipo: Bloqueio operacional/ambiente (resolvido)

### Descrição

O ambiente local não possuía configuração Supabase disponível para executar cadastro/login real, sessão autenticada, perfil, upload com Storage, revisão, confirmação, histórico, edição, gráficos e insights com dados persistidos.

### Correção aplicada

- Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` configuradas em `frontend/.env.local`.
- Script de regressão `npm run qa:smoke` em `frontend/scripts/qa-authenticated-smoke.mjs`.
- Testes unitários em `frontend/src/lib/supabase/config.test.ts` (guarda BLOQ-001).

### Evidência (2026-06-03)

| Verificação | Resultado |
| --- | --- |
| Supabase env no smoke | PASS |
| `http://localhost:3000/login` com `pnpm dev` | PASS (200) |
| `/dashboard` sem sessão | PASS (307 → login) |
| Auth sign-in com usuário QA | PASS |
| Páginas autenticadas `/dashboard`, `/dashboard/perfil`, `/dashboard/exames`, `/dashboard/evolucao` | PASS |
| Upload autenticado com `docs/bio-rayane.jpeg` | PASS (200, `needs_review`) |
| GET do upload criado no smoke | PASS |

### Testes de regressão

- `frontend/src/lib/supabase/config.test.ts` — config ausente vs presente.
- `npm run qa:smoke` — smoke autenticado 11/11 com `pnpm dev`, credenciais QA e fixture `docs/bio-rayane.jpeg`.

### Requisitos para reexecutar o E2E autenticado

Credenciais de QA configuradas em `frontend/.env.local`:

- `BODYMETRICS_QA_EMAIL`
- `BODYMETRICS_QA_PASSWORD`

Em seguida: `pnpm dev` + `npm run qa:smoke`.

### Análise de bugfix

- **Status:** Corrigido (ambiente)
- **Correção aplicada:** Configuração Supabase local + script/testes de regressão; não foi necessária alteração de lógica de produto para o bloqueio original.
- **Testes de regressão:** `config.test.ts` + `qa:smoke` completo 11/11 com credenciais QA.
