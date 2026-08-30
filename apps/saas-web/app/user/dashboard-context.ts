import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import OrgRoleHelpers from "@saas-starter-open/rbac/org-role-helpers";
import type { PlanName } from "../_plans";
import { normalizePlanName } from "../_plans";
import { isAuthBypassEnabled, isAuthGuardEnabled } from "@/saas-lib/auth-guard";
import type {
  InvitationSummary,
  OrganizationSummary,
  OrgMemberSummary,
  ProjectSummary,
  UserProfileResponse,
} from "./dashboard-data";
import {
  fetchBilling,
  fetchInvitations,
  fetchOrganizations,
  fetchOrgMembers,
  fetchProfile,
  fetchProjects,
  fetchWhoAmI,
} from "./dashboard-data";

export type DashboardMetrics = {
  readonly memberCount: number | null;
  readonly projectCount: number;
  readonly pendingInviteCount: number;
};

export type DashboardContext = {
  readonly organizations: readonly OrganizationSummary[];
  readonly activeOrg: OrganizationSummary | null;
  readonly profile: UserProfileResponse | null;
  readonly activePlanName: PlanName;
  readonly billingStatus: string;
  readonly projects: readonly ProjectSummary[];
  readonly metrics: DashboardMetrics;
  readonly canManageOrg: boolean;
  readonly isDemo: boolean;
};

const DEMO_USER_ID = "demo_user_1";

function createDemoContext(): DashboardContext {
  const organizations: readonly OrganizationSummary[] = [
    { id: "demo_org_1", name: "Demo workspace", slug: "demo-workspace", role: "owner" },
  ];
  const activeOrg: OrganizationSummary = organizations[0];
  const profile: UserProfileResponse = {
    id: DEMO_USER_ID,
    email: "demo@example.com",
    name: "Demo User",
    username: "demo",
    displayUsername: "Demo",
  };
  const projects: readonly ProjectSummary[] = [
    { id: "demo_project_1", name: "Onboarding flow", status: "active" },
    { id: "demo_project_2", name: "Billing integration", status: "planned" },
    { id: "demo_project_3", name: "Analytics dashboard", status: "paused" },
  ];
  const invitations: readonly InvitationSummary[] = [
    {
      id: "demo_invite_1",
      email: "teammate@example.com",
      role: "member",
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
  ];
  return {
    organizations,
    activeOrg,
    profile,
    activePlanName: "free",
    billingStatus: "active",
    projects,
    metrics: { memberCount: 3, projectCount: projects.length, pendingInviteCount: invitations.length },
    canManageOrg: true,
    isDemo: true,
  };
}

function isDemoProfile(profile: UserProfileResponse | null): boolean {
  return profile?.id === DEMO_USER_ID;
}

function buildCookieHeader(rawHeader: string | null, cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  if (rawHeader && rawHeader.trim().length > 0) {
    return rawHeader;
  }
  const serialized: string = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
  return serialized.length > 0 ? serialized : null;
}

async function loadLiveDashboardContext(): Promise<DashboardContext | null> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const cookieHeader: string | null = buildCookieHeader(headerStore.get("cookie"), cookieStore);
  const orgIdFromCookie: string | null = cookieStore.get("ORG_ID")?.value ?? null;
  const whoami = await fetchWhoAmI(cookieHeader);
  const [organizations, profile] = await Promise.all([
    fetchOrganizations(cookieHeader),
    fetchProfile(cookieHeader),
  ]);

  if (!profile) {
    if (isAuthBypassEnabled() && !whoami.authenticated) {
      return createDemoContext();
    }
    return null;
  }

  const activeOrg: OrganizationSummary | null =
    organizations.find((org) => org.id === orgIdFromCookie) ?? organizations[0] ?? null;

  let activePlanName: PlanName = "free";
  let billingStatus = "unknown";
  let projects: readonly ProjectSummary[] = [];
  let metrics: DashboardMetrics = { memberCount: null, projectCount: 0, pendingInviteCount: 0 };

  if (cookieHeader && activeOrg) {
    const [billing, members, fetchedProjects, invitations] = await Promise.all([
      fetchBilling(cookieHeader, activeOrg.id),
      fetchOrgMembers(cookieHeader, activeOrg.id),
      fetchProjects(cookieHeader, activeOrg.id),
      fetchInvitations(cookieHeader, activeOrg.id),
    ]);
    if (billing?.plan) {
      activePlanName = normalizePlanName(billing.plan);
    }
    if (billing?.status) {
      billingStatus = billing.status;
    }
    projects = fetchedProjects;
    metrics = {
      memberCount: members ? members.length : null,
      projectCount: fetchedProjects.length,
      pendingInviteCount: invitations.filter((inv) => inv.status === "pending").length,
    };
  }

  return {
    organizations,
    activeOrg,
    profile,
    activePlanName,
    billingStatus,
    projects,
    metrics,
    canManageOrg: activeOrg ? OrgRoleHelpers.isManager(activeOrg.role) : false,
    isDemo: isDemoProfile(profile),
  };
}

export const getDashboardContext = cache(async function getDashboardContext(): Promise<DashboardContext> {
  const context = await loadLiveDashboardContext();
  if (!context) {
    if (isAuthGuardEnabled()) {
      redirect("/auth/login");
    }
    return createDemoContext();
  }
  return context;
});
