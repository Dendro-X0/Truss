import type { JSX } from "react";
import Link from "next/link";
import type { PlanDefinition } from "../_plans";
import { PLANS } from "../_plans";
import type { OrganizationSummary, ProjectSummary } from "./dashboard-data";
import { getDashboardContext } from "./dashboard-context";
import ActivityCard from "./_activity-card";
import BillingCard from "./_billing-card";
import CreateProjectForm from "./_create-project-form";
import DevModeBanner from "./_dev-mode-banner";
import InviteForm from "./_invite-form";
import OrgSwitcher from "./_org-switcher";
import ProfileForm from "./_profile-form";
import ProjectStatusSelect from "./_project-status-select";
import SignOutButton from "./_sign-out-button";
import UsageCard from "./_usage-card";
import Badge from "@/modules/ui/badge";
import Card from "@/modules/ui/card";

export default async function UserDashboardPage(): Promise<JSX.Element> {
  const context = await getDashboardContext();
  const activePlanDefinition: PlanDefinition | undefined = PLANS.find((plan: PlanDefinition): boolean => plan.id === context.activePlanName);
  const activePlanLabel: string = activePlanDefinition?.label ?? "Free";
  const activeOrg: OrganizationSummary | null = context.activeOrg;

  return (
    <main className="page-gradient min-h-screen">
      <div className="page-container flex flex-col gap-8 py-10 sm:py-14">
        <section className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{context.isDemo ? "Preview workspace" : "Your workspace"}</span>
          {context.profile && !context.isDemo ? <SignOutButton /> : null}
        </section>

        <section className="space-y-6">
          {context.isDemo ? <DevModeBanner /> : null}

          <div className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
                  <Badge variant="neutral" className="border border-border/60 text-xs">
                    {activePlanLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Profile, organizations, projects, invites, billing, and activity in one place.
                </p>
              </div>
              {activeOrg ? (
                <OrgSwitcher
                  organizations={context.organizations.map((org: OrganizationSummary) => ({ id: org.id, name: org.name }))}
                  activeOrgId={activeOrg.id}
                />
              ) : null}
            </div>
          </div>

          {!activeOrg ? (
            <Card className="surface-panel rounded-2xl p-6">
              <h2 className="text-base font-semibold">No organization selected</h2>
              <p className="mt-2 text-sm text-muted-foreground">Once an organization exists, projects and billing will appear here.</p>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card className="surface-panel rounded-2xl p-6">
                  <div className="mb-4">
                    <h2 className="text-sm font-medium text-muted-foreground">Profile</h2>
                    <p className="text-xs text-muted-foreground">Update your user details.</p>
                  </div>
                  {context.profile ? (
                    <ProfileForm
                      name={context.profile.name}
                      email={context.profile.email}
                      username={context.profile.username ?? null}
                      displayUsername={context.profile.displayUsername ?? null}
                    />
                  ) : null}
                </Card>

                <Card className="surface-panel rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
                      <p className="text-xs text-muted-foreground">Projects are scoped to the active organization.</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{context.metrics.projectCount.toString()} total</div>
                  </div>
                  {!context.isDemo ? <CreateProjectForm orgId={activeOrg.id} /> : null}
                  <div className="mt-4 space-y-3">
                    {context.projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No projects yet. Create your first project above.</p>
                    ) : (
                      <ol className="space-y-2">
                        {context.projects.map((project: ProjectSummary) => (
                          <li
                            key={project.id}
                            className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium">{project.name}</p>
                              <p className="text-xs text-muted-foreground">{project.id}</p>
                            </div>
                            {context.isDemo ? (
                              <span className="text-xs capitalize text-muted-foreground">{project.status}</span>
                            ) : (
                              <ProjectStatusSelect orgId={activeOrg.id} projectId={project.id} status={project.status} />
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <UsageCard
                  plan={context.activePlanName}
                  memberCount={context.metrics.memberCount}
                  projectCount={context.metrics.projectCount}
                />
                <Card className="surface-panel rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium text-muted-foreground">Invitations</h2>
                      <p className="text-xs text-muted-foreground">Invite teammates to your organization.</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{context.metrics.pendingInviteCount.toString()} pending</span>
                  </div>
                  {context.canManageOrg && !context.isDemo ? (
                    <InviteForm orgId={activeOrg.id} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {context.isDemo
                        ? "Sign in to send real invitations."
                        : "Only org owners/admins can send invitations."}
                    </p>
                  )}
                </Card>
                <Card className="surface-panel rounded-2xl p-6">
                  <BillingCard
                    orgId={activeOrg.id}
                    orgName={activeOrg.name}
                    plan={context.activePlanName}
                    status={context.billingStatus}
                    canManageBilling={context.canManageOrg && !context.isDemo}
                  />
                </Card>
                <ActivityCard />
              </div>
            </div>
          )}

          {context.isDemo ? (
            <p className="text-center text-xs text-muted-foreground">
              Ready for the full stack?{" "}
              <Link href="/auth/signup" className="font-medium text-foreground hover:underline">
                Create an account
              </Link>{" "}
              or{" "}
              <Link href="/auth/login" className="font-medium text-foreground hover:underline">
                sign in
              </Link>
              .
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
