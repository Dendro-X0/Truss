"use server";

import { headers } from "next/headers";

export interface AcceptInviteState {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function acceptInviteAction(
  _prev: AcceptInviteState | null,
  formData: FormData,
): Promise<AcceptInviteState> {
  const tokenRaw: string = String(formData.get("token") ?? "");
  const token: string = tokenRaw.trim();
  if (!token) {
    return { error: "Invitation token is required" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/invitations/accept`;

  const response: Response = await fetch(url, {
    method: "POST",
    headers: headersInit,
    body: JSON.stringify({ token }),
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
    return { error: "Failed to accept invitation" };
  }

  return { success: true, message: "Invitation accepted" };
}
