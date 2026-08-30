"use client";

import type { ReactElement } from "react";
import { useActionState, useEffect } from "react";
import type { BillingCheckoutState } from "../../actions/billing-checkout";
import { billingCheckoutAction } from "../../actions/billing-checkout";
import type { BillingPortalState } from "../../actions/billing-portal";
import { billingPortalAction } from "../../actions/billing-portal";
import Button from "@/modules/ui/button";
import Badge from "@/modules/ui/badge";
import { getStrataUpgradeUrl } from "@/modules/marketing/product-suite";

export interface BillingCardProps {
  readonly orgId: string;
  readonly orgName: string;
  readonly plan: string;
  readonly status: string;
  readonly canManageBilling: boolean;
}

export default function BillingCard({ orgId, orgName, plan, status, canManageBilling }: BillingCardProps): ReactElement {
  const [checkoutState, checkoutAction] = useActionState<BillingCheckoutState | null, FormData>(
    billingCheckoutAction,
    null,
  );
  const [portalState, portalAction] = useActionState<BillingPortalState | null, FormData>(billingPortalAction, null);

  useEffect(() => {
    if (checkoutState?.success && checkoutState.url) {
      // In a real app, this would redirect to Stripe checkout.
      // For this starter, we keep the URL visible instead of navigating away.
    }
  }, [checkoutState?.success, checkoutState?.url]);

  useEffect(() => {
    if (portalState?.success && portalState.url) {
      // In a real app, this would redirect to Stripe billing portal.
    }
  }, [portalState?.success, portalState?.url]);

  const disabled: boolean = !canManageBilling;

  function onStartCheckout(): void {
    const formData: FormData = new FormData();
    formData.set("orgId", orgId);
    formData.set("plan", "pro");
    void checkoutAction(formData);
  }

  function onOpenPortal(): void {
    const formData: FormData = new FormData();
    formData.set("orgId", orgId);
    void portalAction(formData);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Billing</h2>
          <p className="text-xs text-muted-foreground">Plan and billing status for {orgName}.</p>
        </div>
        <Badge variant="neutral" className="border border-border text-xs capitalize">
          {plan}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1 text-xs">
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize">{status}</span>
          </p>
          <p className="text-muted-foreground">
            Billing is scaffolded in Truss — checkout returns placeholder URLs until you wire a provider or graduate to{" "}
            <a
              href={getStrataUpgradeUrl()}
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Strata Pro
            </a>
            .
          </p>
          {checkoutState?.url && (
            <p className="text-[11px] text-muted-foreground">Checkout URL: {checkoutState.url}</p>
          )}
          {portalState?.url && (
            <p className="text-[11px] text-muted-foreground">Portal URL: {portalState.url}</p>
          )}
          {checkoutState?.error && <p className="text-[11px] text-destructive">{checkoutState.error}</p>}
          {portalState?.error && <p className="text-[11px] text-destructive">{portalState.error}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" size="sm" onClick={onStartCheckout} className="text-xs" disabled={disabled}>
            Upgrade to Pro
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenPortal}
            className="text-xs"
            disabled={disabled}
          >
            Manage billing
          </Button>
        </div>
      </div>
    </div>
  );
}
