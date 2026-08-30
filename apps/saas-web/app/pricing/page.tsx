import type { ReactElement } from "react";
import { PLANS, type PlanDefinition } from "../_plans";
import PricingPlanCard from "./_plan-card";
import MarketingFooter from "@/modules/marketing/marketing-footer";
import { getStrataUpgradeUrl } from "@/modules/marketing/product-suite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <main className="page-gradient min-h-screen">
      <div className="page-container flex min-h-[calc(100vh-3.5rem)] flex-col gap-12 py-10 sm:py-14">
        <section className="space-y-4 text-center">
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
          <Table className="min-w-[480px] text-left">
            <TableHeader>
              <TableRow className="text-xs text-muted-foreground">
                <TableHead className="w-40" />
                {PLANS.map((plan: PlanDefinition) => (
                  <TableHead key={plan.id} className="pr-4 font-medium">
                    {plan.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row: ComparisonRow) => (
                <TableRow key={row.label}>
                  <TableCell className="py-3 pr-4 text-xs font-medium text-muted-foreground">
                    {row.label}
                  </TableCell>
                  {PLANS.map((plan: PlanDefinition) => (
                    <TableCell key={plan.id} className="py-3 pr-4 align-top">
                      {row.getValue(plan)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="surface-card rounded-2xl border border-dashed p-6 text-center text-sm">
          <p className="font-medium">Shipping a real product with billing?</p>
          <p className="mt-2 text-muted-foreground">
            Truss plans are scaffolding demos. Strata Pro includes Polar/Stripe billing, AI Studio, admin diagnostics, and
            showcase dashboards — same architecture, commercial depth.
          </p>
          <a
            href={getStrataUpgradeUrl()}
            className="mt-4 inline-flex text-xs font-medium text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Explore Strata Pro →
          </a>
        </section>
      </div>
      <MarketingFooter />
    </main>
  );
}
