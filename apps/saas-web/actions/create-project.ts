"use server";

import { headers } from "next/headers";

export interface CreateProjectInput {
  readonly orgId: string;
  readonly name: string;
  readonly status?: string;
}

export interface CreateProjectState {
  readonly success?: boolean;
  readonly error?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function createProjectAction(_prev: CreateProjectState | null, formData: FormData): Promise<CreateProjectState> {
  const orgIdRaw: string = String(formData.get("orgId") ?? "");
  const nameRaw: string = String(formData.get("name") ?? "");
  const statusRaw: string = String(formData.get("status") ?? "");
  const orgId: string = orgIdRaw.trim();
  const name: string = nameRaw.trim();
  const status: string | undefined = statusRaw.trim() || undefined;
  if (!orgId) {
    return { error: "Organization is required" };
  }
  if (!name) {
    return { error: "Project name is required" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/orgs/${encodeURIComponent(orgId)}/projects`;
  const body: CreateProjectInput = { orgId, name, status };

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
      // ignore
    }
    return { error: "Failed to create project" };
  }

  return { success: true };
}
