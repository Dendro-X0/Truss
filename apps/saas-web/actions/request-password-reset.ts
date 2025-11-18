"use server";

import auth from "../lib/auth/server";

export type RequestResetState = {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: { readonly message?: string };
} | null;

export async function requestPasswordResetAction(_prev: RequestResetState, formData: FormData): Promise<RequestResetState> {
  try {
    const email: string = String(formData.get("email") ?? "");
    if (!email) {
      return { error: { message: "Email is required" } };
    }
    const baseUrl: string = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await auth.api.requestPasswordReset({ body: { email, redirectTo: `${baseUrl}/auth/reset-password` } });
    return { success: true, message: "If the email exists, a reset link has been sent" };
  } catch (cause: unknown) {
    const message: string = cause instanceof Error ? cause.message : "Failed to request password reset";
    return { error: { message } };
  }
}
