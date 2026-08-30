import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

interface EmailPayload {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly user?: string;
  readonly password?: string;
}

interface ProviderContext {
  readonly from: string;
  readonly resendApiKey?: string;
  readonly smtpConfig?: SmtpConfig;
}

function getFromAddress(): string {
  const value: string | undefined = process.env.EMAIL_FROM;
  if (value && value.trim()) {
    return value.trim();
  }
  return "SaaS Starter <no-reply@example.com>";
}

function getSmtpConfigFromEnv(): SmtpConfig | undefined {
  const host: string | undefined = process.env.SMTP_HOST;
  const portRaw: string | undefined = process.env.SMTP_PORT;
  if (!host || !portRaw) {
    return undefined;
  }
  const trimmedHost: string = host.trim();
  const parsedPort: number = Number.parseInt(portRaw, 10);
  if (!trimmedHost || Number.isNaN(parsedPort)) {
    return undefined;
  }
  const user: string | undefined = process.env.SMTP_USER;
  const password: string | undefined = process.env.SMTP_PASSWORD;
  return { host: trimmedHost, port: parsedPort, user, password };
}

function getProviderContext(): ProviderContext {
  const from: string = getFromAddress();
  const resendApiKeyRaw: string | undefined = process.env.RESEND_API_KEY;
  const resendApiKey: string | undefined = resendApiKeyRaw && resendApiKeyRaw.trim() ? resendApiKeyRaw.trim() : undefined;
  const smtpConfig: SmtpConfig | undefined = getSmtpConfigFromEnv();
  return { from, resendApiKey, smtpConfig };
}

async function sendWithResend(payload: EmailPayload, context: ProviderContext): Promise<void> {
  const apiKey: string | undefined = context.resendApiKey;
  if (!apiKey) {
    return;
  }
  const resend: Resend = new Resend(apiKey);
  await resend.emails.send({
    from: context.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

async function sendWithSmtp(payload: EmailPayload, context: ProviderContext): Promise<void> {
  const config: SmtpConfig | undefined = context.smtpConfig;
  if (!config) {
    return;
  }
  const hasAuth: boolean = Boolean(config.user && config.password);
  const transporter: Transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: hasAuth
      ? {
          user: config.user as string,
          pass: config.password as string,
        }
      : undefined,
  });
  await transporter.sendMail({
    from: context.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

/**
 * Send an email using the configured provider.
 *
 * Order of precedence:
 * 1. Resend when RESEND_API_KEY is set.
 * 2. SMTP when SMTP_HOST and SMTP_PORT are set (e.g. Mailhog).
 * 3. Console logging fallback when no provider is configured.
 */
export default async function sendEmail(payload: EmailPayload): Promise<void> {
  const context: ProviderContext = getProviderContext();
  if (context.resendApiKey) {
    await sendWithResend(payload, context);
    return;
  }
  if (context.smtpConfig) {
    await sendWithSmtp(payload, context);
    return;
  }
  // eslint-disable-next-line no-console
  console.log("email.send.fallback", {
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
