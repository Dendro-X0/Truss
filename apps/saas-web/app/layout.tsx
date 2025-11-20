import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import AppProviders from "./_providers";
import ThemeToggle from "./_theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truss",
  description: "Open multi-tenant SaaS starter.",
};

export interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): ReactElement {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <ThemeToggle />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
