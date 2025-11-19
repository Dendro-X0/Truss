import type { ReactElement } from "react";
import { PLAN_LIMITS, type PlanName } from "../_plans";

export interface UsageCardProps {
  readonly plan: PlanName;
  readonly memberCount: number | null;
  readonly projectCount: number;
}

function formatUsageLabel(used: number | null, max: number | undefined): string {
  if (max === undefined) {
    if (used === null) {
      return "Unknown / Unlimited";
    }
    return `${used.toString()} / Unlimited`;
  }
  if (used === null) {
    return `? / ${max.toString()}`;
  }
  return `${used.toString()} / ${max.toString()}`;
}

export default function UsageCard({ plan, memberCount, projectCount }: UsageCardProps): ReactElement {
  const limits = PLAN_LIMITS[plan];
  const maxMembers: number | undefined = limits.maxMembers;
  const maxProjects: number | undefined = limits.maxProjects;

  const membersLabel: string = formatUsageLabel(memberCount, maxMembers);
  const projectsLabel: string = formatUsageLabel(projectCount, maxProjects);

  return (
    <section className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Usage</h2>
          <p className="text-xs text-muted-foreground">Track how this organization is using its current plan.</p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-xs capitalize text-muted-foreground">{plan}</span>
      </div>
      <dl className="grid gap-4 text-sm md:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs text-muted-foreground">Members</dt>
          <dd className="text-base font-medium">{membersLabel}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs text-muted-foreground">Projects</dt>
          <dd className="text-base font-medium">{projectsLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
