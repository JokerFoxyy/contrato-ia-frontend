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

## Quality Standards

### Documentation — Always Up to Date

**CLAUDE.md and README.md must always reflect the current state of the codebase.** Every session that changes code, architecture, dependencies, commands, routes, or conventions **MUST** update the relevant documentation in the same commit or PR. Never leave docs stale — if you add a new component, route, service, environment variable, or change behavior, update the docs immediately. Documentation is not a follow-up task; it's part of the definition of done.

### Testing — Mandatory for every session

Every feature or change **MUST** include tests before being considered complete:

1. **Unit tests** for all services, guards, interceptors, and pipes.
2. **Component tests** for every component (using `TestBed`, verify rendering, user interactions, and edge cases).
3. **Minimum 90% code coverage** — enforced by CI via Karma coverage reporter. PRs below threshold are blocked.

Test naming convention: `should <expected behavior> when <condition>` (e.g., `should navigate to login when not authenticated`).

Mock external dependencies (`HttpClient`, `KeycloakService`, etc.) — tests must be fast and isolated.

### Clean Code & Best Practices

Follow these principles in every session:

- **Single Responsibility** — each component/service does one thing well.
- **Meaningful names** — no abbreviations; variables, methods, and components reveal intent.
- **Small components** — extract shared UI into `shared/components/`; keep templates readable.
- **DRY** — reuse services and utility functions; don't duplicate logic across components.
- **YAGNI** — implement what's needed now, not speculative features.
- **Refactor continuously** — every session should leave the codebase cleaner than it was found.

### Security First & Shift Left

Security is built into every step of development, not added at the end:

- **Sanitize user input** — never trust or render raw user input. Use Angular's built-in XSS protection (avoid `bypassSecurityTrust*` unless absolutely necessary and documented).
- **No secrets in code** — API keys, tokens, and credentials go in environment files (never committed) or backend-only.
- **CSP compliance** — avoid inline scripts/styles. All new code must work with Content Security Policy headers.
- **Auth checks everywhere** — every route must be explicitly guarded or explicitly public. Default is deny via `authGuard`.
- **Dependency scanning** — CI runs `npm audit` or equivalent on every PR. Known CVEs block merge.
- **HTTPS only** — never make HTTP calls in production. Environment URLs must use `https://`.
- **Minimal data exposure** — only request and store what's needed. Don't log sensitive data (tokens, passwords, PII).
- **Shift left** — security checks (lint rules, audit, SAST) run on every push, not just before release.

### TDD Workflow

When implementing new features, follow the Red-Green-Refactor cycle:

1. **Red** — Write a failing test for the expected behavior.
2. **Green** — Write the minimum code to make it pass.
3. **Refactor** — Clean up while keeping tests green.

## Deploy

`vercel.json` rewrites everything to `/index.html` for SPA routing. CI (`.github/workflows/ci.yml`) runs `lint`, `build:prod`, and `test` with coverage enforcement on push/PR to `main` and `develop`. Coverage thresholds (90% statements/functions/lines, 80% branches) are enforced by Karma — builds fail if thresholds aren't met.
