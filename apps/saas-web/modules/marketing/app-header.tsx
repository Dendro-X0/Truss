import type { ReactElement } from "react";
import Link from "next/link";
import Logo from "../../app/_logo";
import ThemeToggle from "../../app/_theme-toggle";

const navLinkClass =
  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

export default function AppHeader(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Logo className="h-5 w-5 text-foreground" />
          <span>Truss</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/user" className={navLinkClass}>
            Dashboard
          </Link>
          <Link href="/pricing" className={navLinkClass}>
            Pricing
          </Link>
          <Link href="/auth/login" className={`${navLinkClass} hidden sm:inline-flex`}>
            Sign in
          </Link>
          <ThemeToggle variant="inline" />
        </nav>
      </div>
    </header>
  );
}
