import type { ReactElement } from "react";

const highlights: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: "Authentication",
    body: "Password + username flows, social, magic links, and Better Auth 2FA glued together with Next.js.",
  },
  {
    title: "Multi-tenant model",
    body: "Organizations, members, and projects backed by Drizzle ORM and a schema you can understand.",
  },
  {
    title: "Billing-ready",
    body: "Plans, status, and Stripe-ready endpoints so you can start charging as soon as you're ready.",
  },
];

const timeline: readonly { readonly label: string; readonly detail: string }[] = [
  { label: "Provision org", detail: "Auto-create personal org + demo projects on first login." },
  { label: "Collaborate", detail: "Invite teammates, manage roles, and update project states." },
  { label: "Ship", detail: "Connect billing, enable 2FA, and deploy with confidence." },
];

const isDemo: boolean = process.env.NEXT_PUBLIC_TRUSS_DEMO_MODE === "1";

export default function HomePage(): ReactElement {
  return (
    <main className="landing-gradient relative min-h-screen">
      {isDemo && (
        <div className="border-b bg-amber-50/80 text-amber-900 dark:bg-amber-950/70 dark:text-amber-50">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2 text-xs sm:text-sm">
            <p className="text-left">
              This deployment runs Truss in demo mode. The UI is live, but auth, database, and subscriptions are disabled.
            </p>
            <span className="hidden whitespace-nowrap text-[0.7rem] font-medium sm:inline">
              Clone the repo and configure environment variables to enable the full stack.
            </span>
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16">
        <section className="space-y-8 text-center animate-fade-up">
          <p className="mx-auto inline-flex max-w-fit items-center rounded-full border px-4 py-1 text-xs font-medium text-muted-foreground">
            Multi-tenant SaaS starter · UI-first demo
          </p>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Launch-ready SaaS scaffolding without committing to a full stack.
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground">
              Preview realistic auth, organizations, projects, and pricing screens today, then wire Truss into your own
              infrastructure when you are ready.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/auth/signup"
              className="inline-flex h-11 items-center justify-center rounded-full border border-primary bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:translate-y-px hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Preview auth UI
            </a>
            <a
              href="/user"
              className="inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium shadow-sm transition hover:translate-y-px hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore dashboard UI
            </a>
            <a
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium shadow-sm transition hover:translate-y-px hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View pricing layout
            </a>
          </div>
        </section>

        <section className="space-y-6 animate-fade-up animate-delay-1">
          <div className="surface-shell rounded-3xl p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Realtime dashboard</span>
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">Multi-tenant</span>
            </div>
            <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
              <div className="surface-card rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xs font-medium text-muted-foreground">Profile</p>
                <div className="mt-2 flex items-center justify-between rounded-xl border px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold">acme.dev</p>
                    <p className="text-xs text-muted-foreground">Authenticated via Better Auth</p>
                  </div>
                  <span className="rounded-full border px-3 py-0.5 text-xs">You</span>
                </div>
              </div>
              <div className="surface-card rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xs font-medium text-muted-foreground">Organizations</p>
                <div className="mt-2 space-y-2">
                  <div className="rounded-xl border px-3 py-2 text-xs">
                    <p className="font-semibold">Personal workspace</p>
                    <p className="text-muted-foreground">Owner · Free plan</p>
                  </div>
                  <div className="rounded-xl border px-3 py-2 text-xs">
                    <p className="font-semibold">Client project</p>
                    <p className="text-muted-foreground">Member · Pro plan</p>
                  </div>
                </div>
              </div>
              <div className="surface-card rounded-2xl p-4 md:col-span-2 transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xs font-medium text-muted-foreground">Projects</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Onboarding flow</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Billing integration</span>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Planned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 border-t border-accent bg-surface/95 pt-8 animate-fade-up animate-delay-2">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">What you get out of the box</h2>
            <p className="text-sm text-muted-foreground">Every block is intentionally unfinished so you can mold it fast.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="surface-card rounded-2xl p-4 text-sm shadow-sm transition hover:-translate-y-1 hover:border-primary/40"
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 animate-fade-up" style={{ animationDelay: "0.45s" }}>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Ship in calm, vertical slices</h2>
            <p className="text-sm text-muted-foreground">Each step is ready for live demos or real customers.</p>
          </div>
          <ol className="space-y-4 border-l border-accent pl-6 text-sm dark:border-dashed">
            {timeline.map((step, index) => (
              <li key={step.label} className="relative surface-card rounded-2xl p-4 shadow-sm dark:bg-background/70">
                <span className="absolute -left-3.5 mt-1 h-3 w-3 rounded-full border border-primary bg-surface dark:bg-background" />
                <p className="text-xs font-semibold text-muted-foreground">Step {index + 1}</p>
                <p className="text-base font-medium">{step.label}</p>
                <p className="text-muted-foreground">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
