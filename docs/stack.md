# Stack

Truss is built on a modern TypeScript-first stack that emphasizes type safety, clear boundaries, and a realistic SaaS domain.

## Frontend

- **Framework**: Next.js 16 App Router (`apps/saas-web`)
- **Rendering model**:
  - React Server Components for data-heavy sections
  - Client components only where interactivity is needed
- **UI**:
  - Tailwind CSS v4
  - Minimal set of hand-rolled components
- **Forms & actions**:
  - Server actions for login/signup and dashboard forms

## API

- **Framework**: Hono (`apps/api`)
- **Responsibilities**:
  - User profile
  - Organizations and memberships
  - Projects
  - Billing summary and checkout/portal skeleton
  - Contact/feedback
  - Invitations
  - Activity (basic audit trail)

## Authentication

- **Library**: Better Auth (`packages/auth`)
- **Features**:
  - Email/password authentication
  - Optional social providers (GitHub, Google) via environment variables
  - Username plugin
  - Magic link and two-factor (2FA) support wired in

## Database

- **Database**: Postgres
- **ORM**: Drizzle ORM (`packages/db`)
- **Schema highlights**:
  - `user`, `session`, `account`, `verification`, `two_factor`
  - `organization`, `organization_member`, `organization_invite`
  - `project`, `activity`
- **Helpers**:
  - `getDb()` exposes a typed `PostgresJsDatabase<DatabaseSchema>`

## Tooling

- **Package manager**: pnpm
- **Monorepo**: pnpm workspaces + `turbo.json`
- **Language**: TypeScript in strict mode
- **Tasks**:
  - `pnpm dev` – run both API and web app
  - `pnpm typecheck` – typecheck all packages
  - `pnpm lint` – lint (when configured per app)
  - `pnpm build` – build all apps
