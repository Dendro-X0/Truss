"use client";

import type { ReactElement, MouseEvent } from "react";
import { useTransition } from "react";
import { signOutAction } from "../../actions/sign-out";

export default function SignOutButton(): ReactElement {
  const [pending, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    startTransition(() => {
      void signOutAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
