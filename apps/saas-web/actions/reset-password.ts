"use server";

import { redirect } from "next/navigation";
import auth from "../lib/auth/server";

export type ResetPasswordState = {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: { readonly message?: string };
} | null;

export async function resetPasswordAction(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  try {
    const token: string = String(formData.get("token") ?? "");
    const newPassword: string = String(formData.get("newPassword") ?? "");
    if (!token || !newPassword) {
      return { error: { message: "Token and new password are required" } };
    }
    await auth.api.resetPassword({ body: { token, newPassword } });
    redirect("/auth/login?message=Password%20updated");
  } catch (cause: unknown) {
    const message: string = cause instanceof Error ? cause.message : "Failed to reset password";
    return { error: { message } };
  }
}
