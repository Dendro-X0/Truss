import { cookies, headers } from "next/headers";
import type { ReactElement } from "react";
import SignOutButton from "./_sign-out-button";
import ProfileForm from "./_profile-form";
import OrgSwitcher from "./_org-switcher";
import CreateProjectForm from "./_create-project-form";
import ProjectStatusSelect from "./_project-status-select";
import BillingCard from "./_billing-card";
import InviteForm from "./_invite-form";
import UsageCard from "./_usage-card";
import { normalizePlanName, type PlanName } from "../_plans";
import FeedbackForm from "../_feedback-form";

interface WhoAmIResponse {
  readonly authenticated: boolean;
  readonly userId?: string;
}

async function fetchInvitations(cookieHeader: string | null, orgId: string): Promise<readonly InvitationSummary[]> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/${encodeURIComponent(orgId)}/invitations`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as InvitationsResponse;
    return data.invitations;
  } catch (error) {
    console.error("Failed to fetch invitations", error);
    return [];
  }
}

async function fetchActivity(cookieHeader: string | null): Promise<readonly ActivityEntry[]> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/activity`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as ActivityResponse;
    return data.activity;
  } catch (error) {
    console.error("Failed to fetch activity", error);
    return [];
  }
}

interface UserProfileResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly username?: string | null;
  readonly displayUsername?: string | null;
}

interface OrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly role: string;
}

interface OrgsResponse {
  readonly organizations: readonly OrganizationSummary[];
}

interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

interface ProjectsResponse {
  readonly projects: readonly ProjectSummary[];
}

interface InvitationSummary {
  readonly id: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly expiresAt: string;
}

interface InvitationsResponse {
  readonly invitations: readonly InvitationSummary[];
}

interface ActivityEntry {
  readonly id: string;
  readonly type: string;
  readonly description?: string | null;
  readonly createdAt: string;
  readonly orgName?: string | null;
}

interface ActivityResponse {
  readonly activity: readonly ActivityEntry[];
}

interface BillingSummary {
  readonly plan: string;
  readonly status: string;
}

interface BillingResponse {
  readonly billing: BillingSummary;
}

interface OrgMemberSummary {
  readonly id: string;
  readonly userId: string;
  readonly role: string;
  readonly createdAt: string;
  readonly userName?: string | null;
  readonly userEmail: string;
}

interface MembersResponse {
  readonly members: readonly OrgMemberSummary[];
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

async function fetchWhoAmI(cookieHeader: string | null): Promise<WhoAmIResponse> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/auth/whoami`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return { authenticated: false };
    }
    const data = (await response.json()) as WhoAmIResponse;
    return data;
  } catch (error) {
    console.error("Failed to fetch whoami", error);
    return { authenticated: false };
  }
}

async function fetchProfile(cookieHeader: string | null): Promise<UserProfileResponse | null> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/user/profile`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as UserProfileResponse;
    return data;
  } catch (error) {
    console.error("Failed to fetch profile", error);
    return null;
  }
}

async function fetchOrganizations(cookieHeader: string | null): Promise<readonly OrganizationSummary[]> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as OrgsResponse;
    return data.organizations;
  } catch (error) {
    console.error("Failed to fetch organizations", error);
    return [];
  }
}

async function fetchProjects(cookieHeader: string | null, orgId: string): Promise<readonly ProjectSummary[]> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/${encodeURIComponent(orgId)}/projects`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as ProjectsResponse;
    return data.projects;
  } catch (error) {
    console.error("Failed to fetch projects", error);
    return [];
  }
}

async function fetchBilling(cookieHeader: string | null, orgId: string): Promise<BillingSummary | null> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/billing/${encodeURIComponent(orgId)}/summary`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as BillingResponse;
    return data.billing;
  } catch (error) {
    console.error("Failed to fetch billing", error);
    return null;
  }
}

async function fetchOrgMembers(
  cookieHeader: string | null,
  orgId: string,
): Promise<readonly OrgMemberSummary[] | null> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/${encodeURIComponent(orgId)}/members`;
  const requestHeaders: HeadersInit = {};
  if (cookieHeader) {
    requestHeaders["cookie"] = cookieHeader;
  }
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as MembersResponse;
    return data.members;
  } catch (error) {
    console.error("Failed to fetch organization members", error);
    return null;
  }
}

export default async function UserPage(): Promise<ReactElement> {
  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie") ?? null;
  const cookieStore = await cookies();
  const cookieOrgId: string | null = cookieStore.get("ORG_ID")?.value ?? null;

  const organizations: readonly OrganizationSummary[] = await fetchOrganizations(cookieHeader);
  const fallbackOrgId: string | null = organizations.length > 0 ? organizations[0]!.id : null;
  const activeOrgId: string | null =
    cookieOrgId && organizations.some((org) => org.id === cookieOrgId) ? cookieOrgId : fallbackOrgId;
  const activeOrg: OrganizationSummary | null =
    activeOrgId ? organizations.find((org) => org.id === activeOrgId) ?? null : null;

  const [whoami, profile, projects, billing, invitations, activity, members] = await Promise.all([
    fetchWhoAmI(cookieHeader),
    fetchProfile(cookieHeader),
    activeOrgId ? fetchProjects(cookieHeader, activeOrgId) : Promise.resolve<readonly ProjectSummary[]>([]),
    activeOrgId ? fetchBilling(cookieHeader, activeOrgId) : Promise.resolve<BillingSummary | null>(null),
    activeOrgId ? fetchInvitations(cookieHeader, activeOrgId) : Promise.resolve<readonly InvitationSummary[]>([]),
    fetchActivity(cookieHeader),
    activeOrgId
      ? fetchOrgMembers(cookieHeader, activeOrgId)
      : Promise.resolve<readonly OrgMemberSummary[] | null>(null),
  ]);

  const planName: PlanName = normalizePlanName(billing?.plan ?? "free");
  const memberCount: number | null = members ? members.length : null;
  const projectCount: number = projects.length;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-12">
      <div className="text-center text-xs text-muted-foreground">
        <a href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
          <span aria-hidden="true">←</span>
          Back to homepage
        </a>
      </div>

      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">User dashboard</h1>
          <p className="text-sm text-muted-foreground">Authenticated view backed by Better Auth and the Hono API.</p>
        </div>
        <SignOutButton />
      </header>

      <section className="rounded-lg border bg-background p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Session</h2>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Authenticated:</span>{" "}
            {whoami.authenticated ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">User ID:</span>{" "}
            {whoami.userId ?? "—"}
          </p>
        </div>
      </section>

      {activeOrg && (
        <UsageCard plan={planName} memberCount={memberCount} projectCount={projectCount} />
      )}

      {activeOrg && (
        <section className="rounded-lg border bg-background p-6 shadow-sm">
          <BillingCard
            orgId={activeOrg.id}
            orgName={activeOrg.name}
            plan={billing?.plan ?? "free"}
            status={billing?.status ?? "active"}
          />
        </section>
      )}

      {profile && (
        <section className="rounded-lg border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Profile</h2>
          <ProfileForm
            name={profile.name}
            email={profile.email}
            username={profile.username ?? null}
            displayUsername={profile.displayUsername ?? null}
          />
        </section>
      )}

      <section className="rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Organizations</h2>
          <OrgSwitcher
            organizations={organizations.map((org) => ({ id: org.id, name: org.name }))}
            activeOrgId={activeOrgId}
          />
        </div>
        {organizations.length === 0 ? (
          <p className="text-sm text-muted-foreground">You are not a member of any organizations yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {organizations.map((org) => (
              <li key={org.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs text-muted-foreground">Slug: {org.slug}</p>
                </div>
                <span className="rounded-full border px-2 py-0.5 text-xs capitalize text-muted-foreground">
                  {org.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {activeOrg && (
        <section className="rounded-lg border bg-background p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
              <p className="text-xs text-muted-foreground">Org: {activeOrg.name}</p>
            </div>
            <CreateProjectForm orgId={activeOrg.id} />
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects found for this organization.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b last:border-none">
                      <td className="py-2 pr-4 align-top">{project.name}</td>
                      <td className="py-2 pr-4 align-top">
                        <ProjectStatusSelect orgId={activeOrg.id} projectId={project.id} status={project.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeOrg && (
        <section className="rounded-lg border bg-background p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Organization invitations</h2>
              <p className="text-xs text-muted-foreground">Invite teammates and track pending status.</p>
            </div>
            <span className="text-xs text-muted-foreground">Org: {activeOrg.name}</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <InviteForm orgId={activeOrg.id} />
            <div className="space-y-3 text-sm">
              {invitations.length === 0 ? (
                <p className="text-muted-foreground">No invitations yet. Send one using the form.</p>
              ) : (
                invitations.map((invite) => (
                  <div key={invite.id} className="rounded-md border px-3 py-2">
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">Role: {invite.role}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {invite.status} · Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Recent activity</h2>
            <p className="text-xs text-muted-foreground">Latest project + invite events logged by the API.</p>
          </div>
          <span className="text-xs text-muted-foreground">Showing {activity.length} entries</span>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet. Create a project or send an invite.</p>
        ) : (
          <ol className="space-y-3 text-sm">
            {activity.map((entry) => (
              <li key={entry.id} className="rounded-md border px-3 py-2">
                <p className="font-medium">{entry.type}</p>
                {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                <p className="text-xs text-muted-foreground">
                  {entry.orgName ?? "Personal org"} · {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">Feedback</h2>
          <p className="text-xs text-muted-foreground">Send thoughts about the dashboard experience.</p>
        </div>
        <FeedbackForm context="dashboard" />
      </section>
    </main>
  );
}
