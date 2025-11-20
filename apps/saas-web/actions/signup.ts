"use server";

import auth from "../lib/auth/server";

export type SignupFormState = {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: { readonly message?: string; readonly fields?: { readonly email?: string[]; readonly password?: string[] } };
} | null;

export async function signupAction(_prev: SignupFormState, formData: FormData): Promise<SignupFormState> {
  try {
    const username: string = String(formData.get("username") ?? "");
    const email: string = String(formData.get("email") ?? "");
    const password: string = String(formData.get("password") ?? "");
    const confirmPassword: string = String(formData.get("confirmPassword") ?? "");
    if (!email || !password || !confirmPassword) {
      return { error: { message: "Email, password, and confirmation are required" } };
    }
    if (password !== confirmPassword) {
      return { error: { message: "Passwords do not match" } };
    }
    const displayName: string = username || (email.includes("@") ? email.split("@")[0] : "User");
    await auth.api.signUpEmail({ body: { email, password, name: displayName } });
    return { success: true, message: "Check your email to verify your account" };
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Sign up failed";
    return { error: { message } };
  }
}
