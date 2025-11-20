# Architecture

Truss is organized as a pnpm monorepo with a clear separation between apps and shared packages.

## Monorepo layout

- **apps/api**
  - Hono server exposing endpoints such as:
    - `GET /health`
    - `GET /auth/whoami`
    - `GET /user/profile`, `PATCH /user/profile`
    - `GET /orgs`
    - `GET /orgs/:orgId/projects`
    - `POST /orgs/:orgId/projects`, `PATCH /orgs/:orgId/projects/:projectId`
    - `GET /billing/:orgId/summary`
    - `POST /billing/:orgId/checkout`, `POST /billing/:orgId/portal`
    - Contact/feedback, org invitations, and activity feed endpoints
  - Uses the shared Drizzle schema from `@saas-starter-open/db` for schema and queries
  - Uses Better Auth session (via `AUTH_SESSION_URL`) to derive the current user

- **apps/saas-web**
  - Next.js App Router frontend
  - Tailwind CSS v4 plus Truss UI primitives for buttons, inputs, cards, and badges
  - Auth flows under `/auth` (login/signup, magic link, 2FA hooks)
  - Auth-protected dashboard at `/user` with:
    - Session + profile card
    - Organization list and org switcher
    - Project table (create/update)
    - Billing card (Stripe-ready skeleton)
    - Invitations, activity, and feedback sections
  - TanStack Query (`@tanstack/react-query`) for client-side widgets such as the recent activity feed

- **packages/db**
  - Drizzle schema and DB helper for:
    - `user`, `session`, `account`, `verification`, `two_factor`
    - `organization`, `organization_member`, `organization_invite`
    - `project`, `activity`
  - `getDb()` returns a typed `PostgresJsDatabase`

- **packages/auth**
  - Better Auth server configuration using the shared Drizzle schema
  - Pluggable social providers (GitHub, Google) via env vars

## Data flow

- Next.js server components and server actions call the Hono API for data and mutations.
- The Hono API uses Better Auth to resolve the current user based on the session endpoint configured by `AUTH_SESSION_URL`.
- Database reads and writes go through the Drizzle schema in `packages/db`.
- Activity logging is performed on key events (e.g., project created/updated, invitations accepted) to populate an activity feed.

## Multi-tenancy model

- Users belong to organizations via the `organization_member` table.
- Projects are always scoped to an organization.
- The dashboard uses an organization switcher and an `ORG_ID` cookie to determine the active organization.
- If a user has no organizations, the API can lazily create a personal workspace and demo projects to make onboarding smoother.
