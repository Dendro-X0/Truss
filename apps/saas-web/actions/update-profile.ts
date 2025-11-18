"use server";

import { headers } from "next/headers";

export interface UpdateProfileInput {
  readonly name?: string;
  readonly username?: string;
  readonly displayUsername?: string;
}

export interface UpdateProfileState {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

function buildPayload(formData: FormData): UpdateProfileInput {
  const nameValue: string = String(formData.get("name") ?? "").trim();
  const usernameValue: string = String(formData.get("username") ?? "").trim();
  const displayUsernameValue: string = String(formData.get("displayUsername") ?? "").trim();
  const mutable: { name?: string; username?: string; displayUsername?: string } = {};
  if (nameValue) {
    mutable.name = nameValue;
  }
  if (usernameValue) {
    mutable.username = usernameValue;
  }
  if (displayUsernameValue) {
    mutable.displayUsername = displayUsernameValue;
  }
  const payload: UpdateProfileInput = mutable;
  return payload;
}

export async function updateProfileAction(
  _prev: UpdateProfileState | null,
  formData: FormData,
): Promise<UpdateProfileState> {
  const payload: UpdateProfileInput = buildPayload(formData);
  if (!payload.name && !payload.username && !payload.displayUsername) {
    return { error: "Nothing to update" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/user/profile`;

  const response: Response = await fetch(url, {
    method: "PATCH",
    headers: headersInit,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message: string = "Failed to update profile";
    try {
      const data = (await response.json()) as { readonly error?: string };
      if (data.error) {
        message = data.error;
      }
    } catch {
      // ignore parse errors
    }
    return { error: message };
  }

  return { success: true, message: "Profile updated" };
}
