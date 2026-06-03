# Bugs e Bloqueios - BodyMetrics

## Resumo

- Data: 2026-06-02
- Origem: QA final da task 8.0
- Status geral: BLOQUEADO

## BLOQ-001 - Ambiente Supabase ausente impede QA E2E obrigatório

- Severidade: Bloqueante
- Status: Bloqueado
- Tipo: Bloqueio operacional/ambiente

### Descrição

O ambiente local não possui configuração Supabase disponível para executar cadastro/login real, sessão autenticada, perfil, upload com Storage, revisão, confirmação, histórico, edição, gráficos e insights com dados persistidos.

### Passos para reproduzir

1. Iniciar a aplicação com `npm run dev` em `frontend`.
2. Acessar `http://localhost:3000/login`.
3. Tentar seguir os fluxos autenticados exigidos pelo PRD.

### Resultado atual

- `/login` e `/sign-up` renderizam.
- `/dashboard` sem sessão redireciona para `/login`.
- APIs autenticadas retornam 401 sem sessão.
- Ações reais de autenticação dependem de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ausentes no ambiente.

### Resultado esperado

Ambiente de QA com Supabase local ou remoto configurado, migrations aplicadas, bucket `exam-files` criado e usuário de teste disponível para executar E2E completo.

### Evidência

- `evidence/qa-login-cli.png`
- `evidence/qa-sign-up-cli.png`
- `evidence/qa-dashboard-cli.png`
- `qa.md`

### Correção necessária

Disponibilizar configuração de QA para Supabase e credenciais de teste, ou criar um modo controlado de QA/demo que permita executar os fluxos autenticados sem usar dados sensíveis reais.

### Testes de regressão esperados

- E2E de cadastro/login real.
- E2E de perfil físico.
- E2E de upload com `docs/bio-rayane.jpeg` e/ou `docs/bio-rodrigo.jpeg`.
- E2E de revisão, correção, confirmação, histórico, detalhe, edição, gráficos e insights.

### Análise de bugfix

- **Status:** Bloqueado
- **Correção aplicada:** Nenhuma alteração de código aplicada. O item depende de configuração Supabase de QA ou de uma decisão explícita para implementar modo demo/QA controlado.
- **Testes de regressão:** Não criados nesta etapa; os testes E2E esperados devem ser executados após o ambiente Supabase de QA estar disponível.
