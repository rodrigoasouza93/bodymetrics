# Agent Memory

## 2026-06-02 - Task 3.0 Profile Review Revalidation

- BodyMetrics frontend uses npm, Vitest, Testing Library and Next.js 16 with Turbopack; `npm run test` should run `vitest run`.
- Profile domain lives under `frontend/src/features/profile`; Server Actions delegate persistence logic to `lib/profile-update.ts` and repository calls to `data/profile-repository.ts`.
- Date validation for profile `birthDate` must reject impossible calendar dates instead of relying only on `new Date`, because JavaScript normalizes invalid dates.
- User-facing persistence failures should return safe domain messages and avoid leaking Supabase/PostgREST details.
- Component tests are expected for user-facing React components such as `ProfileForm`; use `@vitest-environment jsdom` when the global Vitest environment remains `node`.
