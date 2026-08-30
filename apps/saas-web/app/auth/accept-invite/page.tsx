import type { ReactElement } from "react";
import AcceptInviteForm from "./_form";
import Card from "@/modules/ui/card";
import { CardContent, CardHeader } from "@/components/ui/card";

export const runtime = "nodejs";

export interface AcceptInvitePageProps {
  readonly searchParams: { readonly token?: string };
}

export default function AcceptInvitePage({ searchParams }: AcceptInvitePageProps): ReactElement {
  const token: string = searchParams?.token ?? "";
  return (
    <main className="landing-gradient relative min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-12">
        <div className="w-full space-y-4">
          <div className="text-center text-xs text-muted-foreground">
            <a href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
              <span aria-hidden="true">←</span>
              Back to homepage
            </a>
          </div>
          <Card className="px-8 py-6">
            <CardHeader className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Accept invitation</h1>
              <p className="text-sm text-muted-foreground">Join the organization associated with this invite.</p>
            </CardHeader>
            <CardContent>
              <AcceptInviteForm token={token} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
