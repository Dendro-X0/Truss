"use server";

import { headers } from "next/headers";

export interface SendFeedbackInput {
  readonly email?: string;
  readonly message: string;
  readonly context?: string;
}

export interface SendFeedbackState {
  readonly success?: boolean;
  readonly message?: string;
  readonly error?: string;
}

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

export async function sendFeedbackAction(
  _prev: SendFeedbackState | null,
  formData: FormData,
): Promise<SendFeedbackState> {
  const emailRaw: string = String(formData.get("email") ?? "");
  const messageRaw: string = String(formData.get("message") ?? "");
  const contextRaw: string = String(formData.get("context") ?? "");

  const email: string | undefined = emailRaw.trim() || undefined;
  const message: string = messageRaw.trim();
  const context: string | undefined = contextRaw.trim() || undefined;

  if (!message) {
    return { error: "Message is required" };
  }

  const headerStore = await headers();
  const cookieHeader: string | null = headerStore.get("cookie");
  const headersInit: HeadersInit = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headersInit["cookie"] = cookieHeader;
  }

  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/contact`;
  const body: SendFeedbackInput = { email, message, context };

  const response: Response = await fetch(url, {
    method: "POST",
    headers: headersInit,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return { error: "Failed to send feedback" };
  }

  return { success: true, message: "Feedback sent. Thank you!" };
}
