import type { ReactElement } from "react";
import SignupForm from "./_form";
import SocialButtons from "../login/_social-buttons";
import Card from "@/modules/ui/card";
import { CardContent, CardHeader } from "@/components/ui/card";

export const runtime = "nodejs";

export default function SignupPage(): ReactElement {
  return (
    <main className="page-gradient min-h-screen">
      <div className="page-container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-10">
        <div className="w-full max-w-md space-y-4">
          <Card className="surface-panel rounded-2xl px-8 py-6">
            <CardHeader className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">Enter your details to get started.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <SignupForm />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>Or continue with</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <SocialButtons />
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
