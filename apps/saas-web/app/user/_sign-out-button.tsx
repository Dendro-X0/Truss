"use client";

import type { ReactElement, MouseEvent } from "react";
import { useTransition } from "react";
import { signOutAction } from "../../actions/sign-out";
import Button from "@/modules/ui/button";

export default function SignOutButton(): ReactElement {
  const [pending, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    startTransition(() => {
      void signOutAction();
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={pending}
      variant="outline"
      size="sm"
      className="h-9 hover:bg-accent hover:text-accent-foreground"
    >
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
