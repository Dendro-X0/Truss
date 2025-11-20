import type { ReactElement } from "react";
import SignupForm from "./_form";
import SocialButtons from "../login/_social-buttons";
import Card from "@/modules/ui/card";

export const runtime = "nodejs";

export default function SignupPage(): ReactElement {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-12">
      <div className="w-full space-y-4">
        <div className="text-center text-xs text-muted-foreground">
          <a href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
            <span aria-hidden="true">←</span>
            Back to homepage
          </a>
        </div>
        <Card className="p-8">
          <div className="mb-6 space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details to get started.</p>
          </div>
          <div className="space-y-6">
            <SignupForm />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>Or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <SocialButtons />
          </div>
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
  );
}
