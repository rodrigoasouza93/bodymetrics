# Relatório de Bugfix - BodyMetrics

## Resumo

- Data: 2026-06-03
- Status: **APROVADO COM RESSALVAS**
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
| `npm run test` (frontend) | PASS — 25 arquivos, 83 testes |
| `npm run lint` (frontend) | PASS |
| `npm run build` (frontend) | PASS (rodada anterior nesta sessão) |
| `npm run qa:smoke` | PARCIAL — 3/4 checks antes de auth; auth bloqueado por rate limit de e-mail no Supabase |

## Ressalvas

- Fluxos autenticados completos no smoke (perfil, upload, GET upload) dependem de `BODYMETRICS_QA_EMAIL` / `BODYMETRICS_QA_PASSWORD` com usuário já criado, ou de aguardar o rate limit do Auth.
- Recomenda-se reexecutar `npm run qa:smoke` após definir credenciais de QA.

## Conclusão

O bloqueio original (ambiente sem Supabase) foi resolvido. A task 9.0 atende a causa raiz do BLOQ-001 com regressão automatizada; o E2E autenticado de ponta a ponta fica pendente apenas de credenciais de teste estáveis ou reset do rate limit do Supabase Auth.
