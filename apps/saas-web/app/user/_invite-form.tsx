"use client";

import type { ReactElement } from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CreateOrgInviteState } from "../../actions/create-org-invite";
import { createOrgInviteAction } from "../../actions/create-org-invite";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

export interface InviteFormProps {
  readonly orgId: string;
}

export default function InviteForm({ orgId }: InviteFormProps): ReactElement {
  const router = useRouter();
  const [state, formAction] = useActionState<CreateOrgInviteState | null, FormData>(createOrgInviteAction, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    if (!orgId) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3 text-sm">
      <input type="hidden" name="orgId" value={orgId} />
      <div className="space-y-1">
        <Label htmlFor="invite-email" className="text-xs font-medium text-muted-foreground">
          Invite email
        </Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          size="sm"
          className="text-xs"
          placeholder="teammate@example.com"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-role" className="text-xs font-medium text-muted-foreground">
          Role
        </Label>
        <select
          id="invite-role"
          name="role"
          defaultValue="member"
          className="flex h-9 w-full rounded-md border bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" className="px-4 text-xs">
        Send invite
      </Button>
    </form>
  );
}
