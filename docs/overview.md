# Truss Documentation

This directory contains documentation for Truss, a multi-tenant SaaS starter kit.

## Index

- [Stack](./stack.md)
- [Architecture](./architecture.md)
- [Usage](./usage.md)

## Customization & Roadmap

Truss is intentionally small and opinionated. Common ways to customize it include:

- **Landing and marketing**
  - Replace the default landing page with your own marketing layout and branding.

- **Domain model**
  - Extend the Drizzle schema in `packages/db` with fields specific to your product.
  - Add new endpoints in `apps/api` and surface them in the Next.js app.

- **Team features**
  - Build on the existing organizations and invitations model for richer roles/permissions.

- **Billing**
  - Connect the billing endpoints to Stripe (or another provider) instead of placeholder URLs.

- **Testing & CI**
  - Introduce end-to-end tests (e.g. Playwright) for auth and dashboard flows.
  - Wire typecheck, lint, and tests into your CI pipeline.

Use these docs as a starting point and shape Truss to match your product and team.
