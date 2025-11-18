import { randomUUID } from "crypto";
import { and, desc, eq, ne } from "drizzle-orm";
import type { Hono } from "hono";
import { Hono as HonoApp } from "hono";
import getDb, { schema } from "@saas-starter-open/db";
import type { Db } from "@saas-starter-open/db";

export interface AuthInfo {
  readonly authenticated: boolean;
  readonly userId?: string;
}

function isOwnerRole(role: string | undefined): boolean {
  const normalized: string = (role ?? "").toLowerCase();
  return normalized === DEFAULT_ORG_ROLE_OWNER;
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly username?: string | null;
  readonly displayUsername?: string | null;
  readonly twoFactorEnabled?: boolean | null;
  readonly onboardingComplete?: boolean | null;
}

export interface OrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly role: string;
}

export interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

interface InvitationRecord {
  readonly id: string;
  readonly orgId: string;
  readonly email: string;
  readonly role: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly acceptedAt?: Date | null;
}

interface ActivityRow {
  readonly id: string;
  readonly type: string;
  readonly description?: string | null;
  readonly createdAt: Date;
  readonly orgName?: string | null;
}

type InvitationStatus = "pending" | "accepted" | "expired";

interface InvitationSummaryResponse {
  readonly id: string;
  readonly email: string;
  readonly role: string;
  readonly token: string;
  readonly status: InvitationStatus;
  readonly expiresAt: Date;
}

export type PlanName = "free" | "pro" | "enterprise";
export type BillingStatus = "active" | "trialing" | "past_due" | "canceled";

export interface BillingSummary {
  readonly plan: PlanName;
  readonly status: BillingStatus;
}

const DEFAULT_PROJECT_STATUS: string = "active";
const DEFAULT_ORG_ROLE_OWNER: string = "owner";
const DEFAULT_PLAN: PlanName = "free";
const DEFAULT_BILLING_STATUS: BillingStatus = "active";

function normalizePlan(input: string | null | undefined): PlanName {
	const value: string = (input ?? DEFAULT_PLAN).toLowerCase();
	if (value === "free" || value === "pro" || value === "enterprise") {
		return value;
	}
	return DEFAULT_PLAN;
}

function normalizeBillingStatus(input: string | null | undefined): BillingStatus {
	const value: string = (input ?? DEFAULT_BILLING_STATUS).toLowerCase();
	if (value === "active" || value === "trialing" || value === "past_due" || value === "canceled") {
		return value;
	}
	return DEFAULT_BILLING_STATUS;
}

export type AppBindings = {
  readonly Bindings: Record<string, never>;
  readonly Variables: {
    auth?: AuthInfo;
  };
};

export type AppInstance = Hono<AppBindings>;

const db: Db = getDb();
const INVITE_TTL_MS: number = 1000 * 60 * 60 * 24 * 7;
const ACTIVITY_LIMIT: number = 10;

interface OrgMembership {
  readonly id: string;
  readonly role: string;
}

interface LogActivityInput {
  readonly userId: string;
  readonly orgId?: string | null;
  readonly type: string;
  readonly description?: string | null;
}

async function getOrgMembership(userId: string, orgId: string): Promise<OrgMembership | null> {
  const rows = await db
    .select({ id: schema.organizationMember.id, role: schema.organizationMember.role })
    .from(schema.organizationMember)
    .where(and(eq(schema.organizationMember.orgId, orgId), eq(schema.organizationMember.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

async function logActivity(input: LogActivityInput): Promise<void> {
  const now: Date = new Date();
  await db.insert(schema.activity).values({
    id: randomUUID(),
    userId: input.userId,
    orgId: input.orgId ?? null,
    type: input.type,
    description: input.description ?? null,
    createdAt: now,
  });
}

function getInvitationStatus(record: InvitationRecord): InvitationStatus {
  if (record.acceptedAt) {
    return "accepted";
  }
  const expired: boolean = record.expiresAt.getTime() < Date.now();
  return expired ? "expired" : "pending";
}

function toInvitationSummary(record: InvitationRecord): InvitationSummaryResponse {
  return {
    id: record.id,
    email: record.email,
    role: record.role,
    token: record.token,
    status: getInvitationStatus(record),
    expiresAt: record.expiresAt,
  };
}

async function isUserOrgMember(userId: string, orgId: string): Promise<boolean> {
  const membership = await db
    .select({ id: schema.organizationMember.id })
    .from(schema.organizationMember)
    .where(
      and(
        eq(schema.organizationMember.orgId, orgId),
        eq(schema.organizationMember.userId, userId),
      ),
    )
    .limit(1);
  return Boolean(membership[0]);
}

async function createDemoProjectsForOrg(orgId: string): Promise<void> {
  const now: Date = new Date();
  const demoProjects: readonly { readonly name: string; readonly status: string }[] = [
    { name: "Onboarding flow", status: DEFAULT_PROJECT_STATUS },
    { name: "Billing integration", status: "planned" },
    { name: "Analytics dashboard", status: "paused" },
  ];
  const rows = demoProjects.map((project) => ({
    id: randomUUID(),
    orgId,
    name: project.name,
    status: project.status,
    createdAt: now,
    updatedAt: now,
  }));
  await db.insert(schema.project).values(rows);
}

async function createDefaultOrgForUser(userId: string): Promise<OrganizationSummary> {
  const id: string = randomUUID();
  const now: Date = new Date();
  const name: string = "Personal workspace";
  const slug: string = `personal-${id.slice(0, 8)}`;

  await db.insert(schema.organization).values({
    id,
    name,
    slug,
    plan: "free",
    billingStatus: "active",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.organizationMember).values({
    id: randomUUID(),
    orgId: id,
    userId,
    role: DEFAULT_ORG_ROLE_OWNER,
    createdAt: now,
  });

  await createDemoProjectsForOrg(id);

  const organization: OrganizationSummary = { id, name, slug, role: DEFAULT_ORG_ROLE_OWNER };
  return organization;
}

function getAuthSessionUrl(): string | undefined {
  const url: string | undefined = process.env.AUTH_SESSION_URL;
  return url;
}

async function fetchAuthFromSession(headers: Headers): Promise<AuthInfo | undefined> {
  const sessionUrl: string | undefined = getAuthSessionUrl();
  if (!sessionUrl) {
    return undefined;
  }
  try {
    const response: Response = await fetch(sessionUrl, { headers });
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as { readonly user?: { readonly id?: string } } | null;
    const userId: string | undefined = data?.user?.id;
    if (!userId) {
      return { authenticated: false };
    }
    return { authenticated: true, userId };
  } catch {
    return undefined;
  }
}

function deriveAuthFromHeaders(request: Request): AuthInfo {
  const bearer: string | undefined = request.headers.get("authorization") ?? undefined;
  const headerUserId: string | undefined = request.headers.get("x-user-id") ?? undefined;
  const userId: string | undefined = headerUserId ?? (bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : undefined);
  if (!userId) {
    return { authenticated: false };
  }
  return { authenticated: true, userId };
}

export function createApp(): AppInstance {
  const app: AppInstance = new HonoApp<AppBindings>();

  app.use("/*", async (context, next) => {
    const headers: Headers = new Headers();
    const cookie: string | undefined = context.req.header("cookie") ?? undefined;
    if (cookie) {
      headers.set("cookie", cookie);
    }
    const authorization: string | undefined = context.req.header("authorization") ?? undefined;
    if (authorization) {
      headers.set("authorization", authorization);
    }
    const sessionAuth: AuthInfo | undefined = await fetchAuthFromSession(headers);
    const auth: AuthInfo = sessionAuth ?? deriveAuthFromHeaders(context.req.raw);
    context.set("auth", auth);
    await next();
  });

  app.get("/health", (context) => {
    return context.json({ ok: true });
  });

  app.get("/auth/whoami", (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const authenticated: boolean = auth?.authenticated ?? false;
    const userId: string | undefined = auth?.userId;
    return context.json({ authenticated, userId } as const);
  });

  app.post("/contact", async (context) => {
    interface ContactBody {
      readonly email?: string;
      readonly message?: string;
      readonly context?: string;
    }

    let body: ContactBody;
    try {
      body = (await context.req.json()) as ContactBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }

    const message: string = (body.message ?? "").trim();
    if (!message) {
      return context.json({ error: "Message is required" } as const, 400);
    }
    const email: string | undefined = (body.email ?? "").trim() || undefined;
    const submissionContext: string | undefined = (body.context ?? "").trim() || undefined;

    // eslint-disable-next-line no-console
    console.log("contact submission", { email, message, context: submissionContext });
    return context.json({ ok: true } as const, 201);
  });

  app.get("/user/profile", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const rows = await db.select().from(schema.user).where(eq(schema.user.id, userId)).limit(1);
    const row = rows[0];
    if (!row) {
      return context.json({ error: "User not found" } as const, 404);
    }
    const profile: UserProfile = {
      id: row.id,
      email: row.email,
      name: row.name,
      username: row.username ?? null,
      displayUsername: row.displayUsername ?? null,
      twoFactorEnabled: row.twoFactorEnabled ?? null,
      onboardingComplete: row.onboardingComplete ?? null,
    };
    return context.json(profile);
  });

  app.patch("/user/profile", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }

    interface UpdateBody {
      readonly name?: string;
      readonly username?: string;
      readonly displayUsername?: string;
    }

    let body: UpdateBody;
    try {
      body = (await context.req.json()) as UpdateBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }

    const updates: { name?: string; username?: string | null; displayUsername?: string | null } = {};
    if (body.name && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (body.displayUsername !== undefined) {
      const trimmed: string = body.displayUsername.trim();
      updates.displayUsername = trimmed || null;
    }
    if (body.username !== undefined) {
      const trimmed: string = body.username.trim();
      updates.username = trimmed || null;
      if (trimmed) {
        const existing = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(and(eq(schema.user.username, trimmed), ne(schema.user.id, userId)))
          .limit(1);
        if (existing[0]) {
          return context.json({ error: "Username is already taken" } as const, 409);
        }
      }
    }

    if (!updates.name && updates.username === undefined && updates.displayUsername === undefined) {
      return context.json({ error: "Nothing to update" } as const, 400);
    }

    await db.update(schema.user).set(updates).where(eq(schema.user.id, userId));
    return context.json({ ok: true } as const);
  });

  app.get("/orgs", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const rows = await db
      .select({
        id: schema.organization.id,
        name: schema.organization.name,
        slug: schema.organization.slug,
        role: schema.organizationMember.role,
      })
      .from(schema.organizationMember)
      .innerJoin(schema.organization, eq(schema.organizationMember.orgId, schema.organization.id))
      .where(eq(schema.organizationMember.userId, userId));

    if (!rows[0]) {
      const organization: OrganizationSummary = await createDefaultOrgForUser(userId);
      return context.json({ organizations: [organization] as const });
    }

    const organizations: readonly OrganizationSummary[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      role: row.role,
    }));

    return context.json({ organizations });
  });

  app.get("/orgs/:orgId/invitations", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const membership = await getOrgMembership(userId, orgId);
    if (!membership || !isOwnerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const rows = await db
      .select()
      .from(schema.organizationInvite)
      .where(eq(schema.organizationInvite.orgId, orgId))
      .orderBy(desc(schema.organizationInvite.createdAt));
    const invitations: readonly InvitationSummaryResponse[] = rows.map((row) =>
      toInvitationSummary({
        id: row.id,
        orgId: row.orgId,
        email: row.email,
        role: row.role,
        token: row.token,
        expiresAt: row.expiresAt,
        acceptedAt: row.acceptedAt,
      }),
    );
    return context.json({ invitations });
  });

  app.post("/orgs/:orgId/invitations", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const membership = await getOrgMembership(userId, orgId);
    if (!membership || !isOwnerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }

    interface CreateInviteBody {
      readonly email?: string;
      readonly role?: string;
    }

    let body: CreateInviteBody;
    try {
      body = (await context.req.json()) as CreateInviteBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }

    const email: string = (body.email ?? "").trim();
    if (!email) {
      return context.json({ error: "Email is required" } as const, 400);
    }
    const role: string = (body.role ?? "member").trim().toLowerCase() || "member";
    const now: Date = new Date();
    const token: string = randomUUID();
    const expiresAt: Date = new Date(now.getTime() + INVITE_TTL_MS);
    const id: string = randomUUID();

    await db.insert(schema.organizationInvite).values({
      id,
      orgId,
      email,
      role,
      token,
      expiresAt,
      createdAt: now,
    });

    await logActivity({
      userId,
      orgId,
      type: "org.invitation.created",
      description: `Invited ${email} as ${role}`,
    });

    const invitation = toInvitationSummary({ id, orgId, email, role, token, expiresAt, acceptedAt: null });
    return context.json({ invitation }, 201);
  });

  app.post("/orgs/invitations/accept", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }

    interface AcceptInviteBody {
      readonly token?: string;
    }

    let body: AcceptInviteBody;
    try {
      body = (await context.req.json()) as AcceptInviteBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }
    const token: string = (body.token ?? "").trim();
    if (!token) {
      return context.json({ error: "Token is required" } as const, 400);
    }

    const rows = await db
      .select()
      .from(schema.organizationInvite)
      .where(eq(schema.organizationInvite.token, token))
      .limit(1);
    const invite = rows[0];
    if (!invite) {
      return context.json({ error: "Invitation not found" } as const, 404);
    }
    const expired: boolean = invite.expiresAt.getTime() < Date.now();
    if (expired || invite.acceptedAt) {
      return context.json({ error: "Invitation is no longer valid" } as const, 400);
    }

    const membership = await getOrgMembership(userId, invite.orgId);
    if (!membership) {
      await db.insert(schema.organizationMember).values({
        id: randomUUID(),
        orgId: invite.orgId,
        userId,
        role: invite.role,
        createdAt: new Date(),
      });
    }

    await db
      .update(schema.organizationInvite)
      .set({ acceptedAt: new Date() })
      .where(eq(schema.organizationInvite.id, invite.id));

    await logActivity({
      userId,
      orgId: invite.orgId,
      type: "org.invitation.accepted",
      description: `Accepted invitation for ${invite.email}`,
    });

    return context.json({ ok: true } as const);
  });

  app.get("/orgs/:orgId/projects", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const member: boolean = await isUserOrgMember(userId, orgId);
    if (!member) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const rows = await db
      .select({
        id: schema.project.id,
        name: schema.project.name,
        status: schema.project.status,
      })
      .from(schema.project)
      .where(eq(schema.project.orgId, orgId));

    const projects: readonly ProjectSummary[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
    }));

    return context.json({ projects });
  });

  app.post("/orgs/:orgId/projects", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const member: boolean = await isUserOrgMember(userId, orgId);
    if (!member) {
      return context.json({ error: "Forbidden" } as const, 403);
    }

    interface CreateProjectBody {
      readonly name?: string;
      readonly status?: string;
    }

    let body: CreateProjectBody;
    try {
      body = (await context.req.json()) as CreateProjectBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }

    const nameValue: string = (body.name ?? "").trim();
    if (!nameValue) {
      return context.json({ error: "Project name is required" } as const, 400);
    }
    const statusValueRaw: string = (body.status ?? DEFAULT_PROJECT_STATUS).trim();
    const statusValue: string = statusValueRaw || DEFAULT_PROJECT_STATUS;

    const now: Date = new Date();
    const id: string = randomUUID();
    await db.insert(schema.project).values({
      id,
      orgId,
      name: nameValue,
      status: statusValue,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity({
      userId,
      orgId,
      type: "project.created",
      description: `Created project ${nameValue}`,
    });

    const project: ProjectSummary = { id, name: nameValue, status: statusValue };
    return context.json({ project }, 201);
  });

  app.patch("/orgs/:orgId/projects/:projectId", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const projectId: string = context.req.param("projectId");
    const member: boolean = await isUserOrgMember(userId, orgId);
    if (!member) {
      return context.json({ error: "Forbidden" } as const, 403);
    }

    interface UpdateProjectBody {
      readonly name?: string;
      readonly status?: string;
    }

    let body: UpdateProjectBody;
    try {
      body = (await context.req.json()) as UpdateProjectBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }

    const mutableUpdates: { name?: string; status?: string; updatedAt: Date } = { updatedAt: new Date() };
    const hasName: boolean = typeof body.name === "string" && body.name.trim().length > 0;
    const hasStatus: boolean = typeof body.status === "string" && body.status.trim().length > 0;
    if (!hasName && !hasStatus) {
      return context.json({ error: "Nothing to update" } as const, 400);
    }
    if (hasName) {
      mutableUpdates.name = body.name!.trim();
    }
    if (hasStatus) {
      mutableUpdates.status = body.status!.trim();
    }

    await db
      .update(schema.project)
      .set(mutableUpdates)
      .where(and(eq(schema.project.id, projectId), eq(schema.project.orgId, orgId)));

    await logActivity({
      userId,
      orgId,
      type: "project.updated",
      description: `Updated project ${projectId}`,
    });

    return context.json({ ok: true } as const);
  });

  app.get("/billing/:orgId/summary", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const member: boolean = await isUserOrgMember(userId, orgId);
    if (!member) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const rows = await db
      .select({ plan: schema.organization.plan, billingStatus: schema.organization.billingStatus })
      .from(schema.organization)
      .where(eq(schema.organization.id, orgId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return context.json({ error: "Organization not found" } as const, 404);
    }
    const plan: PlanName = normalizePlan(row.plan);
    const status: BillingStatus = normalizeBillingStatus(row.billingStatus);
    const summary: BillingSummary = { plan, status };
    return context.json({ billing: summary });
  });

  app.post("/billing/:orgId/checkout", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const member: boolean = await isUserOrgMember(userId, orgId);
    if (!member) {
      return context.json({ error: "Forbidden" } as const, 403);
    }

    interface CheckoutBody {
      readonly plan?: string;
    }

    let body: CheckoutBody;
    try {
      body = (await context.req.json()) as CheckoutBody;
    } catch {
      body = {};
    }
    const plan: string = (body.plan ?? "pro").trim() || "pro";
    const checkoutUrl: string = `#checkout-not-configured-${encodeURIComponent(plan)}`;
    return context.json({ checkoutUrl } as const);
  });

  app.post("/billing/:orgId/portal", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const member: boolean = await isUserOrgMember(userId, orgId);
    if (!member) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const portalUrl: string = "#billing-portal-not-configured";
    return context.json({ portalUrl } as const);
  });

  app.get("/activity", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const rows = await db
      .select({
        id: schema.activity.id,
        type: schema.activity.type,
        description: schema.activity.description,
        createdAt: schema.activity.createdAt,
        orgName: schema.organization.name,
      })
      .from(schema.activity)
      .leftJoin(schema.organization, eq(schema.activity.orgId, schema.organization.id))
      .where(eq(schema.activity.userId, userId))
      .orderBy(desc(schema.activity.createdAt))
      .limit(ACTIVITY_LIMIT);
    return context.json({ activity: rows });
  });

  return app;
}
