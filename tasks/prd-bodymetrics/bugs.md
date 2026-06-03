# Bugs e Bloqueios - BodyMetrics

## Resumo

- Data: 2026-06-03
- Origem: QA final da task 8.0; revalidação na task 9.0
- Status geral: Parcialmente resolvido

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
| Cadastro automático no smoke | BLOQUEADO temporariamente por `over_email_send_rate_limit` no Auth |

### Testes de regressão

- `frontend/src/lib/supabase/config.test.ts` — config ausente vs presente.
- `npm run qa:smoke` — smoke autenticado (requer `pnpm dev` + credenciais de QA para fluxo completo).

### Próximo passo para E2E autenticado completo

Credenciais de QA configuradas em `frontend/.env.local`:

- `BODYMETRICS_QA_EMAIL`
- `BODYMETRICS_QA_PASSWORD`

Em seguida: `pnpm dev` + `npm run qa:smoke`.

Opcional no Supabase Dashboard: desabilitar confirmação de e-mail em Auth para ambiente de desenvolvimento, ou aguardar reset do rate limit de envio de e-mail.

### Análise de bugfix

- **Status:** Corrigido (ambiente)
- **Correção aplicada:** Configuração Supabase local + script/testes de regressão; não foi necessária alteração de lógica de produto para o bloqueio original.
- **Testes de regressão:** `config.test.ts` + `qa:smoke` (parcial sem credenciais QA dedicadas).
