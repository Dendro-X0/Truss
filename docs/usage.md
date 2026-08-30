# Usage

This document covers how to run Truss locally and how to work with the main flows.

## Prerequisites

- Node.js >= 20.19.0
- pnpm
- Postgres instance (local or remote) for full-stack local development

## 1. Install dependencies

From the repo root:

```bash
pnpm install
```

## Demo mode (UI-only deployments)

For a hosted demo or a UI-only run, you can skip backend configuration:

- Do not set `DATABASE_URL` / `BETTER_AUTH_SECRET`.
- Set `NEXT_PUBLIC_TRUSS_DEMO_MODE=1` (optional) to show a demo banner on the landing page.

In this configuration, pages render as a realistic product surface, but actions that depend on the API may fail or be disabled.

### Dev mode (local dashboard without sign-in)

Set `DISABLE_AUTH_GUARD=1` in `.env` or `apps/saas-web/.env.local` to browse `/user` with synthetic demo data while developing the UI. This only applies on localhost or in non-production environments.

Optional: set `AUTH_GUARD_ENABLED=1` in production and omit `DISABLE_AUTH_GUARD` to require a session on `/user` routes.

If Next.js picks a port other than 3000, align these URLs with the port shown in the terminal:

- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3002`)
- `AUTH_SESSION_URL` (e.g. `http://localhost:3002/api/auth/get-session`)

## 2. Configure environment variables (full-stack local)

Create a `.env` file at the repo root based on `.env.example` (or use `apps/saas-web/.env.local` — the API loads both). Set at least:

- `DATABASE_URL` – Postgres connection string
- `BETTER_AUTH_SECRET` – secret for Better Auth
- `NEXT_PUBLIC_API_URL` – base URL for the Hono API (default `http://localhost:8787`)
- `AUTH_SESSION_URL` – URL of the Next.js session endpoint (default `http://localhost:3000/api/auth/get-session`)

Optional (as you integrate providers):

- `NEXT_PUBLIC_APP_URL`
- Stripe keys (billing is scaffolded)
- OAuth provider credentials
- Email provider credentials

## 3. Database setup (full-stack local)

Truss uses Drizzle. Database scripts live in `packages/db`:

```bash
pnpm --filter @saas-starter-open/db db:push
pnpm --filter @saas-starter-open/db db:seed
```

## 4. Run in development

From the repo root:

```bash
pnpm dev
```

This starts:

- `apps/api` (Hono) on `http://localhost:8787`
- `apps/saas-web` (Next.js) on `http://localhost:3000`

Open:

- `http://localhost:3000/auth/signup` to create an account
- `http://localhost:3000/user` to explore the dashboard

> If port 3000 is busy, Next.js may use another port (e.g. 3002). Update `NEXT_PUBLIC_APP_URL` and `AUTH_SESSION_URL` to match.

## Development shortcuts

- `DISABLE_AUTH_GUARD=1` — open `/user` with synthetic demo data without signing in (localhost / non-production only).
- `pnpm test:e2e:smoke` — fast UI smoke tests (no database required).
- `pnpm test:e2e:golden` — full-stack golden path (requires `DATABASE_URL` and `pnpm dev`).

## 4. Typical flows

### Authentication

- Better Auth handles signup/login and sessions.
- Next.js exposes `/api/auth/*` routes (e.g. session, sign-in, sign-out).

### User profile

- Backend: `GET /user/profile`, `PATCH /user/profile`.
- Frontend: profile form on `/user`.

### Organizations and projects

- Multi-tenant via `organization` and `organization_member`.
- Projects are always scoped to an organization.
- Org switcher and project table live on `/user`.

### Billing (skeleton)

- `GET /billing/:orgId/summary` returns plan and status.
- Checkout/portal endpoints return placeholder URLs ready to be wired to Stripe.

### Contact, invites, and activity

- Contact/feedback endpoint for user messages.
- Org invitations for team onboarding.
- Activity feed for basic audit trail.

Use these building blocks as a reference and extend Truss to match your product’s domain model and UX.
