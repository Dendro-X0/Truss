"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { SignupFormState } from "../../../actions/signup";
import { signupAction } from "../../../actions/signup";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

export default function SignupForm(): ReactElement {
  const [state, formAction] = useActionState<SignupFormState, FormData>(signupAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">
          Username
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          size="lg"
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
          autoComplete="email"
          required
          size="lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          size="lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          size="lg"
        />
      </div>
      {state?.error?.message && (
        <p className="text-sm text-destructive">{state.error.message}</p>
      )}
      {state?.success && state.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      <Button type="submit" size="lg" className="w-full">
        Create account
      </Button>
    </form>
  );
}
