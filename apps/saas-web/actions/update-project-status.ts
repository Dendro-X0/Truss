"use server";

import { headers } from "next/headers";

export interface UpdateProjectStatusState {
  readonly success?: boolean;
  readonly error?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function updateProjectStatusAction(
  _prev: UpdateProjectStatusState | null,
  formData: FormData,
): Promise<UpdateProjectStatusState> {
  const orgIdRaw: string = String(formData.get("orgId") ?? "");
  const projectIdRaw: string = String(formData.get("projectId") ?? "");
  const statusRaw: string = String(formData.get("status") ?? "");
  const orgId: string = orgIdRaw.trim();
  const projectId: string = projectIdRaw.trim();
  const status: string = statusRaw.trim();

  if (!orgId || !projectId || !status) {
    return { error: "Organization, project, and status are required" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}`;

  const response: Response = await fetch(url, {
    method: "PATCH",
    headers: headersInit,
    body: JSON.stringify({ status }),
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
    return { error: "Failed to update project" };
  }

  return { success: true };
}
