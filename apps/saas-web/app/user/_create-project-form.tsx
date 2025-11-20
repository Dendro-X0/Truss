"use client";

import type { ReactElement, FormEvent } from "react";
import { useActionState, useEffect } from "react";
import type { CreateProjectState } from "../../actions/create-project";
import { createProjectAction } from "../../actions/create-project";
import { useRouter } from "next/navigation";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

export interface CreateProjectFormProps {
  readonly orgId: string;
}

export default function CreateProjectForm({ orgId }: CreateProjectFormProps): ReactElement {
  const router = useRouter();
  const [state, formAction] = useActionState<CreateProjectState | null, FormData>(createProjectAction, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!orgId) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="orgId" value={orgId} />
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className="space-y-1">
          <Label htmlFor="project-name" className="text-xs font-medium text-muted-foreground">
            New project
          </Label>
          <Input
            id="project-name"
            name="name"
            type="text"
            placeholder="Project name"
            size="sm"
            className="px-2 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="project-status" className="text-xs font-medium text-muted-foreground">
            Status
          </Label>
          <select
            id="project-status"
            name="status"
            className="flex h-8 w-full rounded-md border bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue="active"
          >
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" className="px-3 text-xs">
        Add project
      </Button>
    </form>
  );
}
