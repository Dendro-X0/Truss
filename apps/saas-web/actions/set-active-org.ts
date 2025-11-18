"use server";

import { cookies } from "next/headers";

export interface SetActiveOrgState {
  readonly success?: boolean;
  readonly error?: string;
}

export async function setActiveOrgAction(orgId: string): Promise<SetActiveOrgState> {
  const trimmed: string = orgId.trim();
  if (!trimmed) {
    return { error: "Organization id is required" };
  }
  const cookieStore = await cookies();
  cookieStore.set("ORG_ID", trimmed, { path: "/", sameSite: "lax" });
  return { success: true };
}
