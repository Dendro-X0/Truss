function isLocalAppUrl(): boolean {
  const appUrl: string = String(process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
  if (!appUrl) {
    return process.env.NODE_ENV !== "production";
  }
  try {
    const hostname: string = new URL(appUrl).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

/** When true, `/user` routes require a session (unless DISABLE_AUTH_GUARD=1). */
export function isAuthGuardEnabled(): boolean {
  const enabled: boolean = String(process.env.AUTH_GUARD_ENABLED ?? "").trim() === "1";
  const disabled: boolean = String(process.env.DISABLE_AUTH_GUARD ?? "").trim() === "1";
  return enabled && !disabled;
}

/** Dev-only: serve synthetic dashboard data without signing in. */
export function isAuthBypassEnabled(): boolean {
  const disabled: boolean = String(process.env.DISABLE_AUTH_GUARD ?? "").trim() === "1";
  if (!disabled) {
    return false;
  }
  return process.env.NODE_ENV !== "production" || isLocalAppUrl();
}

export function isDashboardAuthBypassEnabled(): boolean {
  return isAuthBypassEnabled();
}
