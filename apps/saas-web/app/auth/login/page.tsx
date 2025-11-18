import type { ReactElement } from "react";
import LoginForm from "./_form";
import SocialButtons from "./_social-buttons";
import MagicLinkForm from "./_magic-link-form";

export const runtime = "nodejs";

export interface LoginPageProps {
  readonly searchParams: Promise<{ readonly message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<ReactElement> {
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-12">
      <div className="w-full space-y-4">
        <div className="text-center text-xs text-muted-foreground">
          <a href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
            <span aria-hidden="true">←</span>
            Back to homepage
          </a>
        </div>
        <div className="rounded-lg border bg-background p-8 shadow-sm">
          <div className="mb-6 space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to continue.</p>
            {params?.message && (
              <p className="text-xs text-emerald-600">{params.message}</p>
            )}
          </div>
          <div className="space-y-6">
            <LoginForm />
            <p className="text-xs text-muted-foreground">
              Forgot your password?{" "}
              <a href="/auth/forgot-password" className="font-medium text-primary hover:underline">
                Reset it
              </a>
              .
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>Or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <SocialButtons />
            <MagicLinkForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Do not have an account?{" "}
          <a href="/auth/signup" className="font-medium text-primary hover:underline">
            Create one
          </a>
          .
        </p>
      </div>
    </div>
  );
}
