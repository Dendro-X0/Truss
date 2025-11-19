import type { ReactElement } from "react";
import AcceptInviteForm from "./_form";

export const runtime = "nodejs";

export interface AcceptInvitePageProps {
  readonly searchParams: { readonly token?: string };
}

export default function AcceptInvitePage({ searchParams }: AcceptInvitePageProps): ReactElement {
  const token: string = searchParams?.token ?? "";
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
            <h1 className="text-2xl font-semibold tracking-tight">Accept invitation</h1>
            <p className="text-sm text-muted-foreground">Join the organization associated with this invite.</p>
          </div>
          <AcceptInviteForm token={token} />
        </div>
      </div>
    </div>
  );
}
