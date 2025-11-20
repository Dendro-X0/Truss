"use client";

import type { ReactElement, FormEvent } from "react";
import { useActionState, useState } from "react";
import type { SendFeedbackState } from "../actions/send-feedback";
import { sendFeedbackAction } from "../actions/send-feedback";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

export interface FeedbackFormProps {
  readonly context?: string;
}

export default function FeedbackForm({ context }: FeedbackFormProps): ReactElement {
  const [state, formAction] = useActionState<SendFeedbackState | null, FormData>(sendFeedbackAction, null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    setSubmitting(true);
    try {
      void event;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3 text-sm">
      <input type="hidden" name="context" value={context ?? ""} />
      <div className="space-y-1">
        <Label htmlFor="feedback-email" className="text-xs font-medium text-muted-foreground">
          Email (optional)
        </Label>
        <Input
          id="feedback-email"
          name="email"
          type="email"
          size="sm"
          className="text-xs"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground">
          Message
        </Label>
        <textarea
          id="feedback-message"
          name="message"
          required
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Share feedback about the starter or demo."
        />
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state?.success && state.message && (
        <p className="text-xs text-emerald-600">{state.message}</p>
      )}
      <Button type="submit" size="sm" disabled={submitting} className="px-3 text-xs">
        Send feedback
      </Button>
    </form>
  );
}
