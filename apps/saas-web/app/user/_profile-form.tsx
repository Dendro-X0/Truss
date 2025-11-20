"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { UpdateProfileState } from "../../actions/update-profile";
import { updateProfileAction } from "../../actions/update-profile";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

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
          <Label htmlFor="name">
            Full name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={name}
            size="md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            readOnly
            size="md"
            className="bg-muted text-muted-foreground"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            defaultValue={username ?? ""}
            size="md"
          />
          <p className="text-xs text-muted-foreground">Used for URLs and mentions. Must be unique.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayUsername">
            Display name
          </Label>
          <Input
            id="displayUsername"
            name="displayUsername"
            type="text"
            defaultValue={displayUsername ?? ""}
            size="md"
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
      <Button type="submit" size="md">
        Save changes
      </Button>
    </form>
  );
}
