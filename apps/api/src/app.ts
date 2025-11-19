import { createHash, randomUUID } from "crypto";
import { and, desc, eq, ne } from "drizzle-orm";
import type { Hono } from "hono";
import { Hono as HonoApp } from "hono";
import getDb, { schema } from "@saas-starter-open/db";
import type { Db } from "@saas-starter-open/db";

type OrgRole = "owner" | "admin" | "member";

export interface AuthInfo {
  readonly authenticated: boolean;
  readonly userId?: string;
  readonly apiTokenId?: string;
  readonly apiTokenOrgId?: string | null;
}

function normalizeOrgRole(role: string | undefined): OrgRole {
  const value: string = (role ?? ORG_ROLE_MEMBER).toLowerCase();
  if (value === ORG_ROLE_OWNER || value === ORG_ROLE_ADMIN || value === ORG_ROLE_MEMBER) {
    return value;
  }
  return ORG_ROLE_MEMBER;
}

function isOwnerRole(role: string | undefined): boolean {
  const normalized: OrgRole = normalizeOrgRole(role);
  return normalized === ORG_ROLE_OWNER;
}

function isManagerRole(role: string | undefined): boolean {
  const normalized: OrgRole = normalizeOrgRole(role);
  return normalized === ORG_ROLE_OWNER || normalized === ORG_ROLE_ADMIN;
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

export interface OrganizationMemberSummary {
  readonly id: string;
  readonly userId: string;
  readonly role: string;
  readonly createdAt: Date;
  readonly userName?: string | null;
  readonly userEmail: string;
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

interface PlanLimits {
  readonly maxMembers?: number;
  readonly maxProjects?: number;
}

const ORG_ROLE_OWNER: OrgRole = "owner";
const ORG_ROLE_ADMIN: OrgRole = "admin";
const ORG_ROLE_MEMBER: OrgRole = "member";

const FREE_PLAN_MAX_MEMBERS: number = 3;
const FREE_PLAN_MAX_PROJECTS: number = 5;
const PRO_PLAN_MAX_MEMBERS: number = 25;
const PRO_PLAN_MAX_PROJECTS: number = 50;

const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: { maxMembers: FREE_PLAN_MAX_MEMBERS, maxProjects: FREE_PLAN_MAX_PROJECTS },
  pro: { maxMembers: PRO_PLAN_MAX_MEMBERS, maxProjects: PRO_PLAN_MAX_PROJECTS },
  enterprise: {},
};

const DEFAULT_PROJECT_STATUS: string = "active";
const DEFAULT_ORG_ROLE_OWNER: OrgRole = ORG_ROLE_OWNER;
const DEFAULT_PLAN: PlanName = "free";
const DEFAULT_BILLING_STATUS: BillingStatus = "active";
const DEFAULT_TOKEN_TTL_DAYS: number = 365;

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

interface OrgBilling {
  readonly plan: PlanName;
  readonly status: BillingStatus;
}

async function getOrgBilling(orgId: string): Promise<OrgBilling | null> {
  const rows = await db
    .select({
      plan: schema.organization.plan,
      billingStatus: schema.organization.billingStatus,
    })
    .from(schema.organization)
    .where(eq(schema.organization.id, orgId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return null;
  }
  const plan: PlanName = normalizePlan(row.plan);
  const status: BillingStatus = normalizeBillingStatus(row.billingStatus);
  const billing: OrgBilling = { plan, status };
  return billing;
}

async function getOrgMemberCount(orgId: string): Promise<number> {
  const rows = await db
    .select({ id: schema.organizationMember.id })
    .from(schema.organizationMember)
    .where(eq(schema.organizationMember.orgId, orgId));
  return rows.length;
}

async function getOrgProjectCount(orgId: string): Promise<number> {
  const rows = await db
    .select({ id: schema.project.id })
    .from(schema.project)
    .where(eq(schema.project.orgId, orgId));
  return rows.length;
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

function extractBearerToken(headers: Headers): string | null {
  const authorization: string | null = headers.get("authorization");
  if (!authorization) {
    return null;
  }
  const value: string = authorization.trim();
  if (!value.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  const token: string = value.slice(7).trim();
  if (!token) {
    return null;
  }
  return token;
}

function hashToken(rawToken: string): string {
  const hash = createHash("sha256");
  hash.update(rawToken);
  const digest: string = hash.digest("hex");
  return digest;
}

async function deriveAuthFromApiToken(headers: Headers): Promise<AuthInfo | null> {
  const rawToken: string | null = extractBearerToken(headers);
  if (!rawToken) {
    return null;
  }
  const tokenHash: string = hashToken(rawToken);
  const rows = await db
    .select({
      id: schema.apiToken.id,
      userId: schema.apiToken.userId,
      orgId: schema.apiToken.orgId,
      expiresAt: schema.apiToken.expiresAt,
      revokedAt: schema.apiToken.revokedAt,
    })
    .from(schema.apiToken)
    .where(eq(schema.apiToken.tokenHash, tokenHash))
    .limit(1);
  const token = rows[0];
  if (!token) {
    return null;
  }
  const nowMs: number = Date.now();
  if ((token.expiresAt && token.expiresAt.getTime() <= nowMs) || (token.revokedAt && token.revokedAt.getTime() <= nowMs)) {
    return null;
  }
  const auth: AuthInfo = {
    authenticated: true,
    userId: token.userId,
    apiTokenId: token.id,
    apiTokenOrgId: token.orgId ?? null,
  };
  return auth;
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
    if (sessionAuth?.authenticated) {
      context.set("auth", sessionAuth);
      await next();
      return;
    }
    const tokenAuth: AuthInfo | null = await deriveAuthFromApiToken(headers);
    const fallbackAuth: AuthInfo = deriveAuthFromHeaders(context.req.raw);
    const auth: AuthInfo = tokenAuth ?? fallbackAuth;
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
    if (!membership || !isManagerRole(membership.role)) {
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
    if (!membership || !isManagerRole(membership.role)) {
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
    const existingUsers = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);
    const existingUser = existingUsers[0];
    if (existingUser) {
      const existingMembership: OrgMembership | null = await getOrgMembership(existingUser.id, orgId);
      if (existingMembership) {
        return context.json({ alreadyMember: true } as const);
      }
    }
    const requestedRole: string = (body.role ?? "").trim().toLowerCase();
    const normalizedRole: OrgRole = normalizeOrgRole(requestedRole);
    if (normalizedRole === ORG_ROLE_OWNER) {
      return context.json({ error: "Owner role cannot be granted via invitation" } as const, 400);
    }
    const role: OrgRole = normalizedRole;
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

  app.delete("/orgs/:orgId/invitations/:invitationId", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const invitationId: string = context.req.param("invitationId");
    const membership: OrgMembership | null = await getOrgMembership(userId, orgId);
    if (!membership || !isManagerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const rows = await db
      .select()
      .from(schema.organizationInvite)
      .where(
        and(
          eq(schema.organizationInvite.id, invitationId),
          eq(schema.organizationInvite.orgId, orgId),
        ),
      )
      .limit(1);
    const invite = rows[0];
    if (!invite) {
      return context.json({ error: "Invitation not found" } as const, 404);
    }
    const expired: boolean = invite.expiresAt.getTime() < Date.now();
    if (expired || invite.acceptedAt) {
      return context.json({ error: "Invitation is no longer valid" } as const, 400);
    }
    await db.delete(schema.organizationInvite).where(eq(schema.organizationInvite.id, invitationId));
    await logActivity({
      userId,
      orgId,
      type: "org.invitation.revoked",
      description: `Revoked invitation for ${invite.email}`,
    });
    return context.json({ ok: true } as const);
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
      const existingMemberships = await db
        .select({ id: schema.organizationMember.id })
        .from(schema.organizationMember)
        .where(eq(schema.organizationMember.userId, userId));
      const isFirstMembership: boolean = existingMemberships.length === 0;

      const billing: OrgBilling | null = await getOrgBilling(invite.orgId);
      if (!billing) {
        return context.json({ error: "Organization not found" } as const, 404);
      }
      const limits: PlanLimits = PLAN_LIMITS[billing.plan];
      const maxMembers: number | undefined = limits.maxMembers;
      if (maxMembers !== undefined) {
        const memberCount: number = await getOrgMemberCount(invite.orgId);
        if (memberCount >= maxMembers) {
          return context.json({ error: "Member limit reached for current plan" } as const, 403);
        }
      }
      await db.insert(schema.organizationMember).values({
        id: randomUUID(),
        orgId: invite.orgId,
        userId,
        role: invite.role,
        createdAt: new Date(),
      });

      if (isFirstMembership) {
        await db
          .update(schema.user)
          .set({ onboardingComplete: true })
          .where(eq(schema.user.id, userId));
      }
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

  app.get("/orgs/:orgId/members", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const membership: OrgMembership | null = await getOrgMembership(userId, orgId);
    if (!membership || !isManagerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const rows = await db
      .select({
        id: schema.organizationMember.id,
        userId: schema.organizationMember.userId,
        role: schema.organizationMember.role,
        createdAt: schema.organizationMember.createdAt,
        userName: schema.user.name,
        userEmail: schema.user.email,
      })
      .from(schema.organizationMember)
      .innerJoin(schema.user, eq(schema.organizationMember.userId, schema.user.id))
      .where(eq(schema.organizationMember.orgId, orgId));
    const members: readonly OrganizationMemberSummary[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      role: row.role,
      createdAt: row.createdAt,
      userName: row.userName,
      userEmail: row.userEmail,
    }));
    return context.json({ members });
  });

  app.patch("/orgs/:orgId/members/:memberId", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const memberId: string = context.req.param("memberId");
    const membership: OrgMembership | null = await getOrgMembership(userId, orgId);
    if (!membership || !isOwnerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }

    interface UpdateMemberRoleBody {
      readonly role?: string;
    }

    let body: UpdateMemberRoleBody;
    try {
      body = (await context.req.json()) as UpdateMemberRoleBody;
    } catch {
      return context.json({ error: "Invalid JSON body" } as const, 400);
    }

    const rawRole: string = (body.role ?? "").trim().toLowerCase();
    if (!rawRole) {
      return context.json({ error: "Role is required" } as const, 400);
    }
    const newRole: OrgRole = normalizeOrgRole(rawRole);

    const rows = await db
      .select({
        id: schema.organizationMember.id,
        userId: schema.organizationMember.userId,
        role: schema.organizationMember.role,
      })
      .from(schema.organizationMember)
      .where(
        and(
          eq(schema.organizationMember.id, memberId),
          eq(schema.organizationMember.orgId, orgId),
        ),
      )
      .limit(1);
    const target = rows[0];
    if (!target) {
      return context.json({ error: "Member not found" } as const, 404);
    }

    const targetRole: OrgRole = normalizeOrgRole(target.role);
    if (targetRole === ORG_ROLE_OWNER && newRole !== ORG_ROLE_OWNER) {
      const ownerRows = await db
        .select({ id: schema.organizationMember.id })
        .from(schema.organizationMember)
        .where(
          and(
            eq(schema.organizationMember.orgId, orgId),
            eq(schema.organizationMember.role, ORG_ROLE_OWNER),
          ),
        );
      const ownerCount: number = ownerRows.length;
      if (ownerCount <= 1) {
        return context.json({ error: "Cannot change role of the last owner" } as const, 400);
      }
    }

    await db
      .update(schema.organizationMember)
      .set({ role: newRole })
      .where(eq(schema.organizationMember.id, memberId));

    await logActivity({
      userId,
      orgId,
      type: "org.member.role_changed",
      description: `Changed role for member ${target.userId} to ${newRole}`,
    });

    return context.json({ ok: true } as const);
  });

  app.delete("/orgs/:orgId/members/:memberId", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const memberId: string = context.req.param("memberId");
    const membership: OrgMembership | null = await getOrgMembership(userId, orgId);
    if (!membership || !isManagerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }

    const rows = await db
      .select({
        id: schema.organizationMember.id,
        userId: schema.organizationMember.userId,
        role: schema.organizationMember.role,
      })
      .from(schema.organizationMember)
      .where(
        and(
          eq(schema.organizationMember.id, memberId),
          eq(schema.organizationMember.orgId, orgId),
        ),
      )
      .limit(1);
    const target = rows[0];
    if (!target) {
      return context.json({ error: "Member not found" } as const, 404);
    }

    const targetRole: OrgRole = normalizeOrgRole(target.role);
    const callerRole: OrgRole = normalizeOrgRole(membership.role);
    if (targetRole === ORG_ROLE_OWNER) {
      if (callerRole !== ORG_ROLE_OWNER) {
        return context.json({ error: "Only an owner can remove another owner" } as const, 403);
      }
      const ownerRows = await db
        .select({ id: schema.organizationMember.id })
        .from(schema.organizationMember)
        .where(
          and(
            eq(schema.organizationMember.orgId, orgId),
            eq(schema.organizationMember.role, ORG_ROLE_OWNER),
          ),
        );
      const ownerCount: number = ownerRows.length;
      if (ownerCount <= 1) {
        return context.json({ error: "Cannot remove the last owner" } as const, 400);
      }
    }

    await db.delete(schema.organizationMember).where(eq(schema.organizationMember.id, memberId));

    await logActivity({
      userId,
      orgId,
      type: "org.member.removed",
      description: `Removed member ${target.userId}`,
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
    const billing: OrgBilling | null = await getOrgBilling(orgId);
    if (!billing) {
      return context.json({ error: "Organization not found" } as const, 404);
    }
    const summary: BillingSummary = { plan: billing.plan, status: billing.status };
    return context.json({ billing: summary });
  });

  app.post("/billing/:orgId/checkout", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const orgId: string = context.req.param("orgId");
    const membership: OrgMembership | null = await getOrgMembership(userId, orgId);
    if (!membership || !isManagerRole(membership.role)) {
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
    const membership: OrgMembership | null = await getOrgMembership(userId, orgId);
    if (!membership || !isManagerRole(membership.role)) {
      return context.json({ error: "Forbidden" } as const, 403);
    }
    const portalUrl: string = "#billing-portal-not-configured";
    return context.json({ portalUrl } as const);
  });

  app.get("/tokens", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const rows = await db
      .select({
        id: schema.apiToken.id,
        name: schema.apiToken.name,
        orgId: schema.apiToken.orgId,
        createdAt: schema.apiToken.createdAt,
        expiresAt: schema.apiToken.expiresAt,
        revokedAt: schema.apiToken.revokedAt,
      })
      .from(schema.apiToken)
      .where(eq(schema.apiToken.userId, userId));
    const tokens = rows.map((row) => ({
      id: row.id,
      name: row.name,
      orgId: row.orgId,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt ?? null,
      revokedAt: row.revokedAt ?? null,
    }));
    return context.json({ tokens } as const);
  });

  app.post("/tokens", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }

    interface CreateTokenBody {
      readonly name?: string;
      readonly orgId?: string;
      readonly expiresInDays?: number;
    }

    let body: CreateTokenBody;
    try {
      body = (await context.req.json()) as CreateTokenBody;
    } catch {
      body = {} as CreateTokenBody;
    }

    const nameRaw: string = (body.name ?? "").trim();
    const name: string = nameRaw || "Personal access token";
    const orgIdRaw: string = (body.orgId ?? "").trim();
    const orgId: string | null = orgIdRaw || null;
    if (orgId) {
      const member: boolean = await isUserOrgMember(userId, orgId);
      if (!member) {
        return context.json({ error: "Forbidden" } as const, 403);
      }
    }

    const expiresInDays: number = typeof body.expiresInDays === "number" && body.expiresInDays > 0 ? body.expiresInDays : DEFAULT_TOKEN_TTL_DAYS;
    const now: Date = new Date();
    const expiresAt: Date = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

    const id: string = randomUUID();
    const rawToken: string = randomUUID().replace(/-/g, "");
    const tokenHash: string = hashToken(rawToken);

    await db.insert(schema.apiToken).values({
      id,
      userId,
      orgId,
      name,
      tokenHash,
      createdAt: now,
      expiresAt,
    });

    await logActivity({
      userId,
      orgId,
      type: "api_token.created",
      description: `Created API token ${name}`,
    });

    return context.json({
      token: rawToken,
      tokenId: id,
      name,
      orgId,
      expiresAt,
    } as const, 201);
  });

  app.delete("/tokens/:tokenId", async (context) => {
    const auth: AuthInfo | undefined = context.get("auth");
    const userId: string | undefined = auth?.authenticated ? auth.userId : undefined;
    if (!userId) {
      return context.json({ error: "Unauthorized" } as const, 401);
    }
    const tokenId: string = context.req.param("tokenId");
    const rows = await db
      .select({
        id: schema.apiToken.id,
        userId: schema.apiToken.userId,
        orgId: schema.apiToken.orgId,
        revokedAt: schema.apiToken.revokedAt,
      })
      .from(schema.apiToken)
      .where(eq(schema.apiToken.id, tokenId))
      .limit(1);
    const token = rows[0];
    if (!token || token.userId !== userId) {
      return context.json({ error: "Token not found" } as const, 404);
    }
    const now: Date = new Date();
    if (!token.revokedAt) {
      await db
        .update(schema.apiToken)
        .set({ revokedAt: now })
        .where(eq(schema.apiToken.id, tokenId));
      await logActivity({
        userId,
        orgId: token.orgId ?? null,
        type: "api_token.revoked",
        description: `Revoked API token ${token.id}`,
      });
    }
    return context.json({ ok: true } as const);
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
