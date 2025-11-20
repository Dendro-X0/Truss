import type { ReactElement } from "react";
import { PLANS, type PlanDefinition } from "../_plans";
import PricingPlanCard from "./_plan-card";

interface ComparisonRow {
  readonly label: string;
  readonly getValue: (plan: PlanDefinition) => string;
}

const comparisonRows: readonly ComparisonRow[] = [
  {
    label: "Members",
    getValue: (plan: PlanDefinition): string => formatLimit(plan.limits.maxMembers),
  },
  {
    label: "Projects",
    getValue: (plan: PlanDefinition): string => formatLimit(plan.limits.maxProjects),
  },
  {
    label: "API access",
    getValue: (plan: PlanDefinition): string => (plan.id === "free" ? "Limited" : "Full"),
  },
  {
    label: "Support",
    getValue: (plan: PlanDefinition): string => (plan.id === "enterprise" ? "Dedicated" : "Standard"),
  },
];

function formatLimit(limit: number | undefined): string {
  if (limit === undefined) {
    return "Unlimited";
  }
  return limit.toString();
}

export default function PricingPage(): ReactElement {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-16 px-4 py-16">
      <section className="text-center text-xs text-muted-foreground">
        <a href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
          <span aria-hidden="true">←</span>
          Back to homepage
        </a>
      </section>

      <section className="space-y-6 text-center">
        <p className="mx-auto inline-flex max-w-fit items-center rounded-full border px-4 py-1 text-xs font-medium text-muted-foreground">
          Plans and limits wired to the billing-ready API
        </p>
        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Pricing that matches your launch stage.</h1>
          <p className="mx-auto max-w-2xl text-balance text-sm text-muted-foreground">
            Start free, ship a real product, and wire in your own Stripe or billing provider when you are ready.
            All plans share the same code paths so you can customize quickly.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan: PlanDefinition) => (
          <PricingPlanCard key={plan.id} plan={plan} />
        ))}
      </section>

      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Compare plans</h2>
          <p className="text-sm text-muted-foreground">
            These limits match the enforcement in the Hono API so you always demo what you actually ship.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-4" />
                {PLANS.map((plan) => (
                  <th key={plan.id} className="py-2 pr-4 font-medium">
                    {plan.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b last:border-none">
                  <td className="py-3 pr-4 text-xs font-medium text-muted-foreground">{row.label}</td>
                  {PLANS.map((plan) => (
                    <td key={plan.id} className="py-3 pr-4 align-top">
                      {row.getValue(plan)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
