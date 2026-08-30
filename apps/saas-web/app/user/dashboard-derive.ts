import type { PlanLimits, PlanName } from "../_plans";
import type { OrgMemberSummary, ProjectSummary } from "./dashboard-data";

export interface OrgUsageChartItem {
  readonly label: string;
  readonly used: number | null;
  readonly limit?: number;
}

export interface ProjectStatusItem {
  readonly status: string;
  readonly count: number;
}

export interface BuildUsageInput {
  readonly planName: PlanName;
  readonly memberCount: number | null;
  readonly projectCount: number;
  readonly planLimits: Readonly<Record<PlanName, PlanLimits>>;
}

/**
 * Build chart-ready usage items for members and projects based on plan limits.
 */
export function buildOrgUsageChartItems(input: BuildUsageInput): readonly OrgUsageChartItem[] {
  const limits: PlanLimits = input.planLimits[input.planName];
  const maxMembers: number | undefined = limits.maxMembers;
  const maxProjects: number | undefined = limits.maxProjects;
  const memberItem: OrgUsageChartItem = {
    label: "Members",
    used: input.memberCount,
    limit: maxMembers,
  };
  const projectItem: OrgUsageChartItem = {
    label: "Projects",
    used: input.projectCount,
    limit: maxProjects,
  };
  return [memberItem, projectItem];
}

/**
 * Summarize projects by status for charts and badges.
 */
export function buildProjectStatusItems(
  projects: readonly ProjectSummary[],
): readonly ProjectStatusItem[] {
  const counts: Map<string, number> = new Map<string, number>();
  projects.forEach((project: ProjectSummary): void => {
    const key: string = project.status || "unknown";
    const previous: number = counts.get(key) ?? 0;
    counts.set(key, previous + 1);
  });
  const items: ProjectStatusItem[] = [];
  counts.forEach((value: number, key: string): void => {
    items.push({ status: key, count: value });
  });
  return items;
}
