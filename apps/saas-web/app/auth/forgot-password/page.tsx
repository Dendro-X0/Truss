import type { ReactElement } from "react";
import ForgotPasswordForm from "./_form";
import Card from "@/modules/ui/card";

export const runtime = "nodejs";

export default function ForgotPasswordPage(): ReactElement {
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
            <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
            <p className="text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
          </div>
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}
