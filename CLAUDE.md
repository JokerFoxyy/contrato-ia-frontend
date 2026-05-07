# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ContratoIA frontend — Angular 17 SPA for AI-generated Brazilian legal contracts. Talks to a Spring backend (`contrato-ia-backend`) and authenticates via Keycloak. Deployed to Vercel; UI copy is Portuguese (pt-BR).

## Commands

```bash
npm start              # ng serve on http://localhost:4200
npm run build          # default = production (see angular.json)
npm run build:prod     # explicit production build → dist/contrato-ia-frontend
npm run watch          # development build, rebuild on change
npm test               # ng test (Karma + Jasmine, ChromeHeadless)
npm run lint           # ng lint (CI runs it with --if-present)
```

Run a single test file: `npm test -- --include='**/api.service.spec.ts'` (passes through to Karma; combine with `--watch=false` for one-shot runs in CI-like mode).

Local dev requires the backend at `localhost:8080` and Keycloak at `localhost:8180` (realm `contrato-ia`, client `contrato-ia-frontend`). Endpoints and Keycloak coordinates live in `src/environments/environment.ts` — change there, not in services.

## Architecture

**Standalone components everywhere.** No `NgModule`s. Bootstrap is `main.ts` → `appConfig` (`src/app/app.config.ts`), routes in `src/app/app.routes.ts` use `loadComponent` for lazy loading. New routes follow the same pattern and gate behind `authGuard` unless they're public (only `/login` is).

**Auth flow is intentionally lazy.** `KeycloakService.initAndCheck()` is *not* called at bootstrap — Keycloak is initialized only when the user lands on the login screen, so the app still boots if the Keycloak server is down. Consequence:

- `authGuard` (`core/auth/auth.guard.ts`) only checks `isAuthenticated()` against an already-initialized Keycloak. If the user deep-links to a guarded route on a cold load, `isAuthenticated()` returns false and they're sent to `/login`, where init happens. Don't "fix" this by eagerly initializing in `app.config.ts` — that re-introduces the boot-on-Keycloak-down problem.
- `authInterceptor` (`core/interceptors/auth.interceptor.ts`) skips token attachment when not authenticated and refreshes via `kc.updateToken(30)` on every authenticated request. All HTTP goes through `provideHttpClient(withInterceptors([authInterceptor]))`.
- `silent-check-sso.html` must remain in `src/assets/` — `KeycloakService` references it as `silentCheckSsoRedirectUri` and the path is registered in Keycloak's client config.

**API contract lives in `core/services/api.service.ts`.** `DocumentResponse.status` is a fixed union (`GENERATING | DRAFT | FINALIZED | SIGNING | SIGNED | ARCHIVED`) mirroring the backend enum; `Page<T>` matches Spring Data's pagination shape. Keep these in sync when the backend changes.

**Feature folders own their UI.** Each `features/<name>/` component is self-contained (TS + inline template + styles). Shared/reusable UI goes in `shared/components/`. Tailwind utility classes in templates are the norm; `src/styles.scss` defines `.page-container` and `.card` helpers and configures the Angular Material theme (Material `@use` must stay before Tailwind directives — order matters for SCSS compilation).

## Conventions

- Angular CLI schematics default to `style: scss` and `standalone: true` (see `angular.json`); generated components match what's already in the tree.
- Components prefer `inject()` over constructor DI and use signals (`signal()`) for local state — match this style in new code.
- Production build budget: 500kb warning / 1mb error for the initial bundle. If you add a heavy dep, lazy-load it.

## Git workflow

**NEVER push directly to `main` or `develop`.** Both branches are protected and only accept merges via approved PRs.

To implement any change:

1. Create a feature branch from `develop`: `git checkout develop && git checkout -b feature/short-description`
2. Commit your changes on the feature branch
3. Push the feature branch: `git push -u origin feature/short-description`
4. A GitHub Action automatically creates a PR `feature/* → develop`
5. After approval and merge into `develop`, another Action creates a PR `develop → main`

Branch naming: `feature/<short-kebab-description>` (e.g., `feature/add-new-page`, `feature/fix-auth-redirect`).

## Deploy

`vercel.json` rewrites everything to `/index.html` for SPA routing. CI (`.github/workflows/ci.yml`) only runs `lint` and `build:prod` on push/PR to `main` — tests are not run in CI, so don't rely on CI to catch test breakage.
