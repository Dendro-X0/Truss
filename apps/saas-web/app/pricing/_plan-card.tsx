import type { ReactElement } from "react";
import Card from "@/modules/ui/card";
import Badge from "@/modules/ui/badge";
import Button from "@/modules/ui/button";
import type { PlanDefinition } from "../_plans";

interface PricingPlanCardProps {
  readonly plan: PlanDefinition;
}

function formatLimit(limit: number | undefined): string {
  if (limit === undefined) {
    return "Unlimited";
  }
  return limit.toString();
}

export default function PricingPlanCard({ plan }: PricingPlanCardProps): ReactElement {
  const hasLimits: boolean = plan.limits.maxMembers !== undefined || plan.limits.maxProjects !== undefined;
  const cardBorderClass: string = plan.highlight ? "border-primary/60" : "border-border";
  const buttonVariant: "primary" | "outline" = plan.highlight ? "primary" : "outline";
  return (
    <Card
      className={`surface-card flex flex-col justify-between rounded-2xl p-6 text-left transition hover:-translate-y-1 hover:shadow-lg ${cardBorderClass}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{plan.label}</h2>
          {plan.badge && (
            <Badge variant="neutral" className="border border-border bg-background text-muted-foreground">
              {plan.badge}
            </Badge>
          )}
        </div>
        <p className="text-3xl font-semibold">
          {plan.price}
          {plan.id !== "enterprise" && (
            <span className="text-sm font-normal text-muted-foreground"> / month</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <Button type="button" variant={buttonVariant} size="md" className="rounded-full">
          {plan.ctaLabel}
        </Button>
        {hasLimits ? (
          <p className="text-xs text-muted-foreground">
            Includes up to {formatLimit(plan.limits.maxMembers)} members and {formatLimit(plan.limits.maxProjects)} projects.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Custom member and project limits based on your needs.</p>
        )}
      </div>
    </Card>
  );
}
