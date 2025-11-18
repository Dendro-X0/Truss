"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { UpdateProfileState } from "../../actions/update-profile";
import { updateProfileAction } from "../../actions/update-profile";

export interface ProfileFormProps {
  readonly name: string;
  readonly email: string;
  readonly username?: string | null;
  readonly displayUsername?: string | null;
}

export default function ProfileForm({ name, email, username, displayUsername }: ProfileFormProps): ReactElement {
  const [state, formAction] = useActionState<UpdateProfileState | null, FormData>(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={name}
            className="flex h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            readOnly
            className="flex h-9 w-full rounded-md border bg-muted px-3 text-sm text-muted-foreground shadow-sm"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={username ?? ""}
            className="flex h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Used for URLs and mentions. Must be unique.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="displayUsername" className="text-sm font-medium">Display name</label>
          <input
            id="displayUsername"
            name="displayUsername"
            type="text"
            defaultValue={displayUsername ?? ""}
            className="flex h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Shown in the UI instead of your full name, if set.</p>
        </div>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && state.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Save changes
      </button>
    </form>
  );
}
