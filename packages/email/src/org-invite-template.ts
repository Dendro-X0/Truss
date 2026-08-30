interface OrgInviteTemplateInput {
  readonly email: string;
  readonly inviteUrl: string;
  readonly orgName?: string;
  readonly inviterName?: string;
  readonly appName?: string;
}

interface OrgInviteEmailContent {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

function getAppNameForInvite(value: string | undefined): string {
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
 * Build email content for an organization invitation.
 */
export default function buildOrgInviteEmail(input: OrgInviteTemplateInput): OrgInviteEmailContent {
  const appName: string = getAppNameForInvite(input.appName);
  const orgLabel: string = input.orgName && input.orgName.trim() ? input.orgName.trim() : "an organization";
  const inviterLabel: string = input.inviterName && input.inviterName.trim() ? input.inviterName.trim() : "a teammate";
  const subject: string = `You are invited to ${orgLabel} in ${appName}`;
  const intro: string = `${inviterLabel} invited you to join ${orgLabel} in ${appName}.`;
  const actionLine: string = "Use the following link to accept this invitation:";
  const url: string = input.inviteUrl;
  const footer: string = "If you did not expect this invitation, you can ignore this email.";
  const text: string = `${intro}\n\n${actionLine}\n\n${url}\n\n${footer}`;
  const html: string =
    `<p>${intro}</p>` +
    `<p>${actionLine}</p>` +
    `<p><a href="${url}">${url}</a></p>` +
    `<p>${footer}</p>`;
  return { subject, text, html };
}
