interface MagicLinkTemplateInput {
  readonly email: string;
  readonly url: string;
  readonly appName?: string;
}

interface MagicLinkEmailContent {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

function getAppNameOverride(value: string | undefined): string {
  const envName: string | undefined = process.env.APP_NAME;
  const fallback: string = "SaaS Starter Open";
  if (value && value.trim()) {
    return value.trim();
  }
  if (envName && envName.trim()) {
    return envName.trim();
  }
  return fallback;
}

/**
 * Build email content for a sign-in magic link.
 */
export default function buildMagicLinkEmail(input: MagicLinkTemplateInput): MagicLinkEmailContent {
  const appName: string = getAppNameOverride(input.appName);
  const url: string = input.url;
  const subject: string = `Sign in to ${appName}`;
  const text: string =
    `Use the following link to sign in to ${appName}:\n\n` +
    `${url}\n\n` +
    "If you did not request this email, you can ignore it.";
  const html: string =
    `<p>Use the following link to sign in to ${appName}:</p>` +
    `<p><a href="${url}">${url}</a></p>` +
    "<p>If you did not request this email, you can ignore it.</p>";
  return { subject, text, html };
}
