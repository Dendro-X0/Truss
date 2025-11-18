"use server";

import { headers } from "next/headers";

export interface BillingPortalState {
  readonly success?: boolean;
  readonly error?: string;
  readonly url?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function billingPortalAction(
  _prev: BillingPortalState | null,
  formData: FormData,
): Promise<BillingPortalState> {
  const orgIdRaw: string = String(formData.get("orgId") ?? "");
  const orgId: string = orgIdRaw.trim();
  if (!orgId) {
    return { error: "Organization is required" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/billing/${encodeURIComponent(orgId)}/portal`;

  const response: Response = await fetch(url, {
    method: "POST",
    headers: headersInit,
  });

  if (!response.ok) {
    try {
      const data = (await response.json()) as { readonly error?: string };
      if (data.error) {
        return { error: data.error };
      }
    } catch {
      // ignore
    }
    return { error: "Failed to open billing portal" };
  }

  const data = (await response.json()) as { readonly portalUrl?: string };
  if (!data.portalUrl) {
    return { error: "Portal URL missing" };
  }

  return { success: true, url: data.portalUrl };
}
