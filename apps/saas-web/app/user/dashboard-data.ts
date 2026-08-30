export interface WhoAmIResponse {
  readonly authenticated: boolean;
  readonly userId?: string;
}

export interface UserProfileResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly username?: string | null;
  readonly displayUsername?: string | null;
}

export interface OrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly role: string;
}

interface OrgsResponse {
  readonly organizations: readonly OrganizationSummary[];
}

export interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

interface ProjectsResponse {
  readonly projects: readonly ProjectSummary[];
}

export interface BillingSummary {
  readonly plan: string;
  readonly status: string;
}

interface BillingResponse {
  readonly billing: BillingSummary;
}

export interface InvitationSummary {
  readonly id: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly expiresAt: string;
}

interface InvitationsResponse {
  readonly invitations: readonly InvitationSummary[];
}

export interface OrgMemberSummary {
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

export async function fetchWhoAmI(cookieHeader: string | null): Promise<WhoAmIResponse> {
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

export async function fetchProfile(cookieHeader: string | null): Promise<UserProfileResponse | null> {
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

export async function fetchOrganizations(cookieHeader: string | null): Promise<readonly OrganizationSummary[]> {
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

export async function fetchProjects(
  cookieHeader: string | null,
  orgId: string,
): Promise<readonly ProjectSummary[]> {
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

export async function fetchBilling(cookieHeader: string | null, orgId: string): Promise<BillingSummary | null> {
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

export async function fetchInvitations(
  cookieHeader: string | null,
  orgId: string,
): Promise<readonly InvitationSummary[]> {
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

export async function fetchOrgMembers(
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
