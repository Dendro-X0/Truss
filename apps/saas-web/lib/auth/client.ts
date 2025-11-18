"use client";

import { createAuthClient } from "better-auth/client";
import { magicLinkClient, usernameClient, twoFactorClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    magicLinkClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/verify-2fa";
      },
    }),
  ],
});

export default authClient;
