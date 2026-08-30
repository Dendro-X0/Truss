# Truss Documentation

This directory contains documentation for Truss, a multi-tenant SaaS starter kit.

## Index

- [Stack](./stack.md)
- [Architecture](./architecture.md)
- [Usage](./usage.md)

## Free release scope

The Free release focuses on:

- A consistent, modern UI surface (landing, auth, pricing, dashboard)
- A realistic multi-tenant domain (organizations + projects)
- Full-stack scaffolding (API, auth, database) that you can enable locally

## Demo mode (UI-only deployments)

For a public demo (for example, a web-only deployment), you can run Truss in UI-only mode:

- Do not configure backend environment variables (no database, auth secrets, or billing keys).
- Set `NEXT_PUBLIC_TRUSS_DEMO_MODE=1` to show a dismissible banner on the landing page.

In UI-only mode, pages render as a realistic product surface, but actions that depend on the API may fail or be disabled.

## Full-stack local development

To run Truss with real data locally, follow [`usage.md`](./usage.md):

- Configure `.env` from `.env.example`.
- Run `pnpm dev` from the repo root.

## Extending Truss

Truss is intentionally small and opinionated. Common ways to customize it include:

- **Product UI and branding**
  - Replace the landing page, tweak the theme, and evolve the UI primitives.

- **Domain model**
  - Extend the Drizzle schema in `packages/db`.
  - Add API endpoints in `apps/api` and consume them from the Next.js app.

- **Organizations, roles, and invites**
  - Build on the existing org + membership model and RBAC helpers.

- **Billing**
  - Wire the billing skeleton to Stripe (or another provider) when you are ready.

Use these docs as a starting point and shape Truss to match your product.
