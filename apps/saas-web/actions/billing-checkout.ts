"use server";

import { headers } from "next/headers";

export interface BillingCheckoutState {
  readonly success?: boolean;
  readonly error?: string;
  readonly url?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function billingCheckoutAction(
  _prev: BillingCheckoutState | null,
  formData: FormData,
): Promise<BillingCheckoutState> {
  const orgIdRaw: string = String(formData.get("orgId") ?? "");
  const planRaw: string = String(formData.get("plan") ?? "");
  const orgId: string = orgIdRaw.trim();
  const plan: string = planRaw.trim() || "pro";
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
  const url: string = `${baseUrl}/billing/${encodeURIComponent(orgId)}/checkout`;

  const response: Response = await fetch(url, {
    method: "POST",
    headers: headersInit,
    body: JSON.stringify({ plan }),
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
    return { error: "Failed to start checkout" };
  }

  const data = (await response.json()) as { readonly checkoutUrl?: string };
  if (!data.checkoutUrl) {
    return { error: "Checkout URL missing" };
  }

  return { success: true, url: data.checkoutUrl };
}
