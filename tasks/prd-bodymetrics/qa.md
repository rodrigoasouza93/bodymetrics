# Relatório de QA - BodyMetrics

## Resumo

- Data: 2026-06-02
- Status: REPROVADO
- Total de Requisitos Funcionais: 29
- Requisitos Atendidos: 8 verificados diretamente neste ambiente
- Requisitos Bloqueados: 21 dependentes de sessão Supabase, persistência, upload autenticado, revisão, histórico, edição, comparação e gráficos com dados reais
- Bugs/Bloqueios Encontrados: 1

## Ambiente e comandos executados

| Validação | Resultado | Evidência |
| --- | --- | --- |
| `npm run lint` em `frontend` | PASSOU | ESLint finalizou sem erros |
| `npm run test` em `frontend` | PASSOU | 19 arquivos, 60 testes passando |
| `npm run build` em `frontend` | PASSOU | Build Next.js concluído; rotas `/`, `/login`, `/sign-up`, `/dashboard`, `/api/exam-uploads`, `/api/exam-uploads/[id]` |
| `npm run dev` em `frontend` | PASSOU | `http://localhost:3000/login` respondeu 200 |
| Playwright CLI screenshot `/login` | PASSOU | `evidence/qa-login-cli.png` |
| Playwright CLI screenshot `/sign-up` | PASSOU | `evidence/qa-sign-up-cli.png` |
| Playwright CLI screenshot `/dashboard` sem sessão | PASSOU | `evidence/qa-dashboard-cli.png` |
| `curl -I /dashboard` sem sessão | PASSOU | HTTP 307 para `/login` |
| `POST /api/exam-uploads` sem sessão | PASSOU | HTTP 401 com mensagem segura |
| `GET /api/exam-uploads/test-upload-id` sem sessão | PASSOU | HTTP 401 com mensagem segura |

## Requisitos Verificados

| ID | Requisito | Status | Evidência |
| --- | --- | --- | --- |
| RF-01 | O sistema deve permitir criação de conta de usuário. | BLOQUEADO | Tela existe em `/sign-up`, mas criação real depende de Supabase não configurado. |
| RF-02 | O sistema deve permitir consulta e alteração de informações de perfil. | BLOQUEADO | Dashboard autenticado não pôde ser acessado sem Supabase/sessão real. |
| RF-03 | Perfil deve armazenar dados físicos úteis. | PASSOU PARCIAL | Coberto por testes automatizados de validação de perfil. |
| RF-04 | Cada usuário visualiza e gerencia apenas seus próprios dados. | PASSOU PARCIAL | Rota `/dashboard` redireciona sem sessão; API de uploads retorna 401 sem sessão; RLS coberto por testes de migration. |
| RF-05 | Envio de imagem ou PDF de exame. | BLOQUEADO | Upload autenticado não pôde ser executado. |
| RF-06 | Suporte aos layouts `docs/bio-rayane.jpeg` e `docs/bio-rodrigo.jpeg`. | PASSOU PARCIAL | Extração mock/fixture e parser cobertos por testes; E2E com arquivos reais bloqueado. |
| RF-07 | Extrair dados e apresentar campos antes do salvamento. | BLOQUEADO | Fluxo autenticado de upload/revisão não executável neste ambiente. |
| RF-08 | Informar baixa confiança/leitura insuficiente. | PASSOU PARCIAL | Coberto por testes do serviço de upload; E2E bloqueado. |
| RF-09 | Cancelar cadastro antes de salvar. | BLOQUEADO | Ação depende de upload autenticado. |
| RF-10 | Tela de revisão com dados extraídos. | BLOQUEADO | Estado de revisão depende de upload autenticado. |
| RF-11 | Editar campos antes de confirmar. | BLOQUEADO | Fluxo de revisão autenticado não executável. |
| RF-12 | Exame só entra no histórico após confirmação explícita. | PASSOU PARCIAL | Comportamento implementado e coberto por testes; E2E bloqueado. |
| RF-13 | Destacar campos ausentes/inconsistentes/baixa confiança. | PASSOU PARCIAL | Coberto por testes de componentes; E2E bloqueado. |
| RF-14 | Registrar data/hora do exame quando disponível. | PASSOU PARCIAL | Coberto por tipos/repositorios/testes; E2E bloqueado. |
| RF-15 | Registrar métricas principais. | PASSOU PARCIAL | Coberto por testes de domínio e formulário. |
| RF-16 | Registrar composição corporal disponível. | PASSOU PARCIAL | Coberto por modelo e testes. |
| RF-17 | Registrar métricas adicionais disponíveis. | PASSOU PARCIAL | Coberto por modelo e testes. |
| RF-18 | Registrar análises segmentares disponíveis. | PASSOU PARCIAL | Coberto por migration, tipos e testes de repositório. |
| RF-19 | Preservar origem do exame cadastrado. | PASSOU PARCIAL | Coberto por upload/storage path em testes; E2E bloqueado. |
| RF-20 | Listar exames em ordem cronológica. | BLOQUEADO | Requer dados autenticados em Supabase. |
| RF-21 | Consultar detalhes de exame salvo. | BLOQUEADO | Requer exame confirmado. |
| RF-22 | Alterar dados de exame já cadastrado. | BLOQUEADO | Requer exame confirmado. |
| RF-23 | Exibir gráficos de evolução. | BLOQUEADO | Requer exames confirmados. |
| RF-24 | Comparar exame mais recente com anterior. | BLOQUEADO | Requer pelo menos dois exames confirmados. |
| RF-25 | Indicar variações absolutas e percentuais. | PASSOU PARCIAL | Coberto por testes de comparação; E2E bloqueado. |
| RF-26 | Lidar com métricas ausentes. | PASSOU PARCIAL | Coberto por testes de comparação/gráficos. |
| RF-27 | Gerar insights informativos. | PASSOU PARCIAL | Coberto por testes de insights. |
| RF-28 | Deixar claro que insights não substituem avaliação profissional. | PASSOU PARCIAL | Texto aparece na UI e testes de insight cobrem disclaimer. |
| RF-29 | Não emitir diagnóstico/prescrição/recomendação clínica. | PASSOU PARCIAL | Geração determinística de insights coberta por testes; revisão textual não encontrou prescrição. |

## Testes E2E Executados

| Fluxo | Resultado | Observações |
| --- | --- | --- |
| Login - renderização da tela | PASSOU | Labels de Email/Senha, CTA e link para cadastro renderizados. |
| Cadastro - renderização da tela | PASSOU | Labels de Email/Senha, CTA e link para login renderizados. |
| Dashboard sem sessão | PASSOU | Redireciona para `/login`. |
| API de upload sem sessão | PASSOU | Retorna 401 com mensagem segura. |
| Cadastro/login real | BLOQUEADO | Ausência de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| Perfil autenticado | BLOQUEADO | Depende de sessão Supabase real. |
| Upload com `docs/bio-rayane.jpeg`/`docs/bio-rodrigo.jpeg` | BLOQUEADO | Depende de sessão Supabase real e Storage configurado. |
| Revisão, confirmação, histórico, edição, gráficos e insights com dados | BLOQUEADO | Depende de upload/exame confirmado. |

## Acessibilidade

- PASSOU PARCIAL: HTML usa `lang="pt-BR"` e viewport responsivo.
- PASSOU PARCIAL: Inputs de login/cadastro estão associados a labels visíveis.
- PASSOU PARCIAL: Botões e links têm texto descritivo e alvo mínimo aproximado de 44px.
- PASSOU PARCIAL: Mensagens de erro de API sem sessão são textuais e seguras.
- BLOQUEADO: Navegação por teclado completa em fluxos autenticados não pôde ser executada sem ambiente Supabase.
- BLOQUEADO: Contraste/estados visuais de revisão, upload, histórico e gráficos com dados não puderam ser validados por screenshot autenticado.

## Bugs e Bloqueios Encontrados

| ID | Descrição | Severidade | Evidência |
| --- | --- | --- | --- |
| BLOQ-001 | Ambiente local não possui Supabase configurado, impedindo QA E2E obrigatório de cadastro/login real, perfil, upload, revisão, confirmação, histórico, edição e gráficos. | Bloqueante | `bugs.md`; comandos de env e navegação autenticada bloqueados. |

## Conclusão

O QA final fica REPROVADO por bloqueio operacional: os principais fluxos do PRD exigem Supabase real configurado e sessão autenticada, mas as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estão disponíveis neste ambiente. As validações locais possíveis passaram (`lint`, testes, build, renderização pública, redirect sem sessão e respostas 401 seguras), mas isso não é suficiente para aprovar os 29 requisitos do PRD.
