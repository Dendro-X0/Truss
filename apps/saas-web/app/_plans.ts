export type PlanName = "free" | "pro" | "enterprise";

export interface PlanLimits {
  readonly maxMembers?: number;
  readonly maxProjects?: number;
}

export interface PlanDefinition {
  readonly id: PlanName;
  readonly label: string;
  readonly badge?: string;
  readonly price: string;
  readonly description: string;
  readonly highlight: boolean;
  readonly limits: PlanLimits;
  readonly features: readonly string[];
  readonly ctaLabel: string;
}

export const PLAN_LIMITS: Readonly<Record<PlanName, PlanLimits>> = {
  free: { maxMembers: 3, maxProjects: 5 },
  pro: { maxMembers: 25, maxProjects: 50 },
  enterprise: {},
} as const;

export function normalizePlanName(input: string | null | undefined): PlanName {
  const value: string = (input ?? "free").toLowerCase();
  if (value === "free" || value === "pro" || value === "enterprise") {
    return value;
  }
  return "free";
}

export const PLANS: readonly PlanDefinition[] = [
  {
    id: "free",
    label: "Free",
    badge: "Starter",
    price: "$0",
    description: "Perfect for experiments, prototypes, and solo projects.",
    highlight: false,
    limits: PLAN_LIMITS.free,
    features: [
      "Up to 3 members",
      "Up to 5 projects",
      "Auth, orgs, and projects",
      "Email-style support pattern",
    ],
    ctaLabel: "Start free",
  },
  {
    id: "pro",
    label: "Pro",
    badge: "Most popular",
    price: "$29/mo",
    description: "For small product teams shipping real customer features.",
    highlight: true,
    limits: PLAN_LIMITS.pro,
    features: [
      "Up to 25 members",
      "Up to 50 projects",
      "API tokens and activity feed",
      "Priority integrations path",
    ],
    ctaLabel: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    badge: "Contact us",
    price: "Custom",
    description: "For larger teams that need custom limits and workflows.",
    highlight: false,
    limits: PLAN_LIMITS.enterprise,
    features: [
      "Custom member and project limits",
      "Multiple environments and regions",
      "Dedicated integration support",
      "Security and compliance reviews",
    ],
    ctaLabel: "Talk to sales",
  },
] as const;
