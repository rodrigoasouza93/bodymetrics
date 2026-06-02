# Review: Task 1.0 - Configurar base Next.js, design system e autenticação Supabase

**Revisor**: AI Code Reviewer
**Data**: 2026-06-02
**Arquivo da task**: 1_task.md
**Status**: APROVADO COM RESSALVAS

## Atualização Pós-Correções

Os pontos bloqueantes foram corrigidos após a primeira revisão:

- Sessão passa a tentar renovação via refresh token em `getCurrentUser` e no `proxy.ts` quando há refresh token sem access token.
- `createAdminSupabaseClient` não cai mais silenciosamente para anon key; operações admin sem `SUPABASE_SERVICE_ROLE_KEY` lançam erro explícito.
- Foram adicionados testes automatizados com `node:test` para validação de credenciais e guards de rota.
- Cadastro usa `autocomplete="new-password"` e login usa `autocomplete="current-password"`.
- O fluxo de cadastro foi reestruturado com retorno antecipado, sem flag booleana de controle.
- A superfície browser do client Supabase não expõe `serviceRole` nem `accessToken`.

Validações pós-correção:

- `pnpm lint`: passou.
- `pnpm test`: passou, 8 testes.
- `pnpm exec tsc --noEmit`: passou.
- `pnpm exec next build --webpack`: passou.

Ressalvas:

- `pnpm build` padrão com Turbopack segue limitado pelo sandbox local ao tentar bind de porta interno.
- Context7 não pôde ser usado por DNS/rede bloqueada; o usuário solicitou continuar sem novos pedidos de permissão.
- Integração/E2E com Supabase real fica dependente de credenciais e ambiente Supabase configurado.

## Resumo

A implementação criou a base visual do Next.js, rotas públicas de login/cadastro, área autenticada inicial, actions de autenticação e um cliente interno tipado para Supabase Auth REST, mantendo o projeto validável offline sem `@supabase/ssr` e `@supabase/supabase-js`. A direção geral está alinhada com a task, mas há lacunas relevantes: a sessão não é renovada, o proxy valida apenas presença de cookie, não há testes automatizados para auth/guards, e o cliente admin pode cair silenciosamente para anon key. Esses pontos impedem aprovação plena da task.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/app/globals.css` | ✅ OK | 0 |
| `frontend/app/layout.tsx` | ✅ OK | 0 |
| `frontend/app/page.tsx` | ✅ OK | 0 |
| `frontend/app/(auth)/layout.tsx` | ✅ OK | 0 |
| `frontend/app/(auth)/login/page.tsx` | ✅ OK | 0 |
| `frontend/app/(auth)/sign-up/page.tsx` | ⚠️ Problemas | 1 |
| `frontend/app/(dashboard)/layout.tsx` | ✅ OK | 0 |
| `frontend/app/(dashboard)/dashboard/page.tsx` | ✅ OK | 0 |
| `frontend/proxy.ts` | ⚠️ Problemas | 1 |
| `frontend/src/components/ui/alert.tsx` | ✅ OK | 0 |
| `frontend/src/components/ui/button.tsx` | ✅ OK | 0 |
| `frontend/src/components/ui/text-field.tsx` | ✅ OK | 0 |
| `frontend/src/features/auth/actions/auth-actions.ts` | ⚠️ Problemas | 1 |
| `frontend/src/features/auth/components/auth-form.tsx` | ⚠️ Problemas | 1 |
| `frontend/src/lib/supabase/client.ts` | ⚠️ Problemas | 1 |
| `frontend/src/lib/supabase/config.ts` | ✅ OK | 0 |
| `frontend/src/lib/supabase/cookies.ts` | ✅ OK | 0 |
| `frontend/src/lib/supabase/server-client.ts` | ⚠️ Problemas | 2 |
| `frontend/src/lib/supabase/types.ts` | ✅ OK | 0 |
| `tasks/prd-bodymetrics/1_task.md` | ✅ OK | 0 |
| `tasks/prd-bodymetrics/tasks.md` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Major

1. `frontend/src/lib/supabase/server-client.ts:37` e `frontend/proxy.ts:13` - A task exige atualização de sessão e proteção de rotas autenticadas, mas a implementação nunca usa o refresh token para renovar o access token expirado. O proxy também libera a navegação apenas pela presença de `bm-access-token`, mesmo que ele esteja inválido ou expirado. O layout do dashboard corrige parte do risco ao chamar `/auth/v1/user`, mas a experiência quebra quando o access token expira e o refresh token ainda seria válido.
   Correção sugerida: criar uma rotina server-side `refreshAuthSession` usando `POST /auth/v1/token?grant_type=refresh_token`, salvar novos cookies e chamá-la no `proxy`/boundary server antes de redirecionar. O proxy deve tratar cookie ausente, token inválido e refresh falho como sessão ausente.

2. `frontend/src/lib/supabase/client.ts:15` e `frontend/src/lib/supabase/server-client.ts:16` - `createAdminSupabaseClient` solicita `serviceRole: true`, mas `createSupabaseRequestClient` usa `config.serviceRoleKey ?? config.anonKey`. Isso transforma uma configuração admin ausente em chamada anon silenciosa, o que mascara erro operacional e pode quebrar futuras operações server-only de Storage/RLS sem diagnóstico claro.
   Correção sugerida: quando `serviceRole` for `true`, exigir `SUPABASE_SERVICE_ROLE_KEY` e lançar erro explícito se ela não existir. Exemplo:
   ```ts
   if (options.serviceRole && !config.serviceRoleKey) {
     throw new Error("Configure SUPABASE_SERVICE_ROLE_KEY para operações admin.");
   }
   ```

3. Escopo `frontend/src` e `frontend/app` - Não há arquivos `*.test.*`, `*.spec.*` ou configuração Vitest no frontend. A task 1.7 e a seção "Testes da tarefa" pedem testes unitários/integrados para helpers/factories, login/cadastro/logout e guards de sessão.
   Correção sugerida: adicionar testes Vitest para validação de credenciais, `saveAuthSession`/`clearAuthSession`, tratamento de erro do cliente REST e guarda de rota/sessão com Supabase mockado via `vi.fn`/`vi.mock`.

### 🟢 Problemas Minor

1. `frontend/src/features/auth/components/auth-form.tsx:54` e `frontend/app/(auth)/sign-up/page.tsx:6` - O formulário compartilhado usa `autoComplete="current-password"` também no cadastro. Isso prejudica UX e pode confundir gerenciadores de senha na criação de conta.
   Correção sugerida: receber `passwordAutoComplete` como prop explícita e usar `"current-password"` no login e `"new-password"` no cadastro.

2. `frontend/src/features/auth/actions/auth-actions.ts:91` - `shouldRedirect` é um flag booleano para alternar comportamento, contrariando `code-standards-en`. O fluxo pode retornar cedo quando não há tokens e chamar `redirect("/dashboard")` diretamente após salvar a sessão.
   Correção sugerida: remover o flag e estruturar com early returns.

3. `frontend/src/lib/supabase/client.ts:47` - `createBrowserSupabaseClient` exporta a mesma superfície de request usada no servidor, incluindo a opção `serviceRole` no tipo. Embora a service role não esteja disponível no bundle por usar env não público, a API pública do browser fica mais permissiva do que precisa.
   Correção sugerida: separar o tipo de opções do browser removendo `serviceRole` e `accessToken` quando não forem necessários no cliente.

## ✅ Destaques Positivos

- Tokens principais do `DESIGN.md` foram transportados para `globals.css`, com canvas, coral CTA, superfícies, radius e foco visível.
- A UI de autenticação tem labels reais, mensagens com `role="alert"`/`status`, botão desabilitado em pending e alvos de toque adequados.
- O uso de route groups `(auth)` e `(dashboard)` segue bem o App Router e mantém a separação entre área pública e autenticada.
- O cliente REST tipado é uma solução pragmática para manter lint, TypeScript e build funcionando offline sem instalar Supabase SDKs.
- Identificadores e estrutura geral seguem inglês, TypeScript estrito, componentes funcionais e Tailwind.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ⚠️ |
| TypeScript/Node.js | ⚠️ |
| REST/HTTP | ✅ |
| Logging | ⚠️ |
| React | ⚠️ |
| Testes | ❌ |

## Recomendações

1. Implementar refresh de sessão com o refresh token e fazer o guard de rota operar sobre sessão válida, não apenas cookie presente.
2. Alterar o cliente admin para falhar explicitamente quando `SUPABASE_SERVICE_ROLE_KEY` estiver ausente.
3. Adicionar Vitest e cobrir actions de auth, cliente Supabase REST e guards de sessão/proxy com mocks.
4. Ajustar `AuthForm` para diferenciar `current-password` e `new-password`.
5. Remover o flag `shouldRedirect` em favor de retornos antecipados.

## Veredito

Aprovado com ressalvas. A task 1.0 atende a base Next.js, tokens visuais, rotas públicas/protegidas, fluxo inicial de auth, refresh de sessão, isolamento de clients Supabase e validações locais possíveis no ambiente atual.
