"use client";

import type { ReactElement, ChangeEvent } from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UpdateProjectStatusState } from "../../actions/update-project-status";
import { updateProjectStatusAction } from "../../actions/update-project-status";

export interface ProjectStatusSelectProps {
  readonly orgId: string;
  readonly projectId: string;
  readonly status: string;
}

export default function ProjectStatusSelect({ orgId, projectId, status }: ProjectStatusSelectProps): ReactElement {
  const router = useRouter();
  const [state, formAction] = useActionState<UpdateProjectStatusState | null, FormData>(
    updateProjectStatusAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  function onChange(event: ChangeEvent<HTMLSelectElement>): void {
    const value: string = event.target.value;
    if (!value) {
      return;
    }
    const formData: FormData = new FormData();
    formData.set("orgId", orgId);
    formData.set("projectId", projectId);
    formData.set("status", value);
    // Trigger server action via useActionState
    void formAction(formData);
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={status}
        onChange={onChange}
        className="h-8 min-w-[6rem] rounded-md border bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="active">Active</option>
        <option value="planned">Planned</option>
        <option value="paused">Paused</option>
        <option value="archived">Archived</option>
      </select>
      {state?.error && <span className="text-[10px] text-destructive">{state.error}</span>}
    </div>
  );
}
