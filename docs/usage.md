# Usage

This document covers how to run Truss locally and how to work with the main flows.

## Prerequisites

- Node.js >= 20.19.0
- pnpm
- Postgres instance (local or remote)

## 1. Install dependencies

From the repo root:

```bash
pnpm install
```

## 2. Configure environment variables

Create a `.env` file based on `.env.example` and set at least:

- `DATABASE_URL` – Postgres connection string
- `BETTER_AUTH_SECRET` – secret for Better Auth
- `NEXT_PUBLIC_API_URL` – base URL for the Hono API (e.g. `http://localhost:8787`)
- `AUTH_SESSION_URL` – URL of the Next.js session endpoint (e.g. `http://localhost:3000/api/auth/get-session`)

Additional variables (Stripe keys, social providers, app URL, etc.) can be configured later as you integrate real billing and OAuth.

## 3. Run in development

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
