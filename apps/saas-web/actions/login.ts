"use server";

import auth from "../lib/auth/server";

interface UsernameSignInApi {
	readonly signInUsername: (input: { readonly body: { readonly username: string; readonly password: string } }) => Promise<unknown>;
}

const authApi: typeof auth.api & UsernameSignInApi = auth.api as typeof auth.api & UsernameSignInApi;

export type LoginFormState = {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: { readonly message?: string; readonly fields?: { readonly identifier?: string[]; readonly password?: string[] } };
} | null;

export async function loginAction(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  try {
    const identifier: string = String(formData.get("email") ?? "");
    const password: string = String(formData.get("password") ?? "");
    if (!identifier || !password) {
      return { error: { message: "Email/username and password are required" } };
    }
    const isEmail: boolean = /.+@.+\..+/.test(identifier);
    if (isEmail) {
      await authApi.signInEmail({ body: { email: identifier, password } });
    } else {
      await authApi.signInUsername({ body: { username: identifier, password } });
    }
    return { success: true, message: "Logged in" };
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Login failed";
    return { error: { message } };
  }
}
