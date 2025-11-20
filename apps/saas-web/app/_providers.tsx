"use client";

import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface AppProvidersProps {
  readonly children: ReactNode;
}

const queryClient: QueryClient = new QueryClient();

/**
 * AppProviders wraps the React tree with shared client-side providers such as TanStack Query.
 */
export default function AppProviders({ children }: AppProvidersProps): ReactElement {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
