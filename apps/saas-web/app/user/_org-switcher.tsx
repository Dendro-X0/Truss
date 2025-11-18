"use client";

import type { ReactElement, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveOrgAction } from "../../actions/set-active-org";

export interface OrgSwitcherProps {
  readonly organizations: readonly OrgSwitcherOrg[];
  readonly activeOrgId: string | null;
}

export interface OrgSwitcherOrg {
  readonly id: string;
  readonly name: string;
}

export default function OrgSwitcher({ organizations, activeOrgId }: OrgSwitcherProps): ReactElement | null {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (organizations.length === 0) {
    return null;
  }

  function onChange(event: ChangeEvent<HTMLSelectElement>): void {
    const value: string = event.target.value;
    if (!value) {
      return;
    }
    startTransition(() => {
      void setActiveOrgAction(value).then(() => {
        router.refresh();
      });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="org-switcher" className="text-xs font-medium text-muted-foreground">
        Organization
      </label>
      <select
        id="org-switcher"
        className="h-8 min-w-[8rem] rounded-md border bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={activeOrgId ?? organizations[0]?.id}
        onChange={onChange}
        disabled={pending}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
