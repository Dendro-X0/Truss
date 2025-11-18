"use server";

import { headers } from "next/headers";

export interface CreateOrgInviteState {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function createOrgInviteAction(
  _prev: CreateOrgInviteState | null,
  formData: FormData,
): Promise<CreateOrgInviteState> {
  const orgIdRaw: string = String(formData.get("orgId") ?? "");
  const emailRaw: string = String(formData.get("email") ?? "");
  const roleRaw: string = String(formData.get("role") ?? "member");

  const orgId: string = orgIdRaw.trim();
  const email: string = emailRaw.trim();
  const role: string = (roleRaw.trim() || "member").toLowerCase();

  if (!orgId) {
    return { error: "Organization is required" };
  }
  if (!email) {
    return { error: "Email is required" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/${encodeURIComponent(orgId)}/invitations`;
  const body: { readonly email: string; readonly role: string } = { email, role };

  const response: Response = await fetch(url, {
    method: "POST",
    headers: headersInit,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    try {
      const data = (await response.json()) as { readonly error?: string };
      if (data.error) {
        return { error: data.error };
      }
    } catch {
      // ignore parse errors
    }
    return { error: "Failed to create invitation" };
  }

  return { success: true, message: "Invitation created" };
}
