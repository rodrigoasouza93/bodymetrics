# Relatório de Bugfix - BodyMetrics

## Resumo

- Data: 2026-06-03
- Status: **APROVADO**
- Total de Bugs/Bloqueios: 1
- Bugs Corrigidos: 1 (BLOQ-001 — ambiente Supabase)
- Testes de Regressão Criados: 2 (`config.test.ts`, `qa:smoke`)

## Planejamento por item

| ID | Severidade | Componente Afetado | Causa Raiz | Estratégia |
| --- | --- | --- | --- | --- |
| BLOQ-001 | Bloqueante | Ambiente de QA / Supabase | Faltavam variáveis públicas do Supabase no ambiente local durante o QA da task 8. | Usuário configurou `.env.local`; adicionados script `qa:smoke` e testes de `getSupabaseConfig`. |

## Detalhes por Bug

| ID | Severidade | Status | Correção | Testes Criados |
| --- | --- | --- | --- | --- |
| BLOQ-001 | Bloqueante | Corrigido | `.env.local` com URL e publishable key; smoke valida dev + redirect + Supabase Auth API. | `config.test.ts`, `npm run qa:smoke` |

## Testes executados

| Comando | Resultado |
| --- | --- |
| `npm run test` (frontend) | PASS — 28 arquivos, 99 testes |
| `npm run lint` (frontend) | PASS |
| `npm run build` (frontend) | PASS |
| `npm run qa:smoke` | PASS — 11/11 checks com Supabase real, sessão autenticada e upload de `docs/bio-rayane.jpeg` |

## Ressalvas

- O smoke depende de `BODYMETRICS_QA_EMAIL` / `BODYMETRICS_QA_PASSWORD` e de `pnpm dev` ativo para reexecuções futuras.
- A inspeção visual interativa com Browser/Playwright MCP não foi reexecutada nesta sessão porque a ferramenta local de browser não estava disponível.

## Conclusão

O bloqueio original (ambiente sem Supabase) foi resolvido. A task 9.0 atende a causa raiz do BLOQ-001 com regressão automatizada, e o smoke autenticado completo passou com upload real de exame.
