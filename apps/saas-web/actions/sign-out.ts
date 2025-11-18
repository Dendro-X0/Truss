"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import auth from "../lib/auth/server";

export async function signOutAction(): Promise<void> {
  const sourceHeaders = await headers();
  const currentHeaders: Headers = new Headers(sourceHeaders as HeadersInit);
  await auth.api.signOut({ headers: currentHeaders });
  redirect("/auth/login");
}
