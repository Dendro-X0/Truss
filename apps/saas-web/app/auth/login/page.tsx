import type { ReactElement } from "react";
import LoginForm from "./_form";
import SocialButtons from "./_social-buttons";
import MagicLinkForm from "./_magic-link-form";
import Card from "@/modules/ui/card";
import { CardContent, CardHeader } from "@/components/ui/card";

export const runtime = "nodejs";

export interface LoginPageProps {
  readonly searchParams: Promise<{ readonly message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<ReactElement> {
  const params = await searchParams;
  return (
    <main className="page-gradient min-h-screen">
      <div className="page-container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-10">
        <div className="w-full max-w-md space-y-4">
          <Card className="surface-panel rounded-2xl px-8 py-6">
            <CardHeader className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">Enter your credentials to continue.</p>
              {params?.message && <p className="text-xs text-emerald-600">{params.message}</p>}
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground">
            Do not have an account?{" "}
            <a href="/auth/signup" className="font-medium text-primary hover:underline">
              Create one
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
