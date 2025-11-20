import type { HTMLAttributes, ReactElement } from "react";
import cn from "./utils";

type BadgeVariant = "neutral" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
}

function getBadgeClasses(variant: BadgeVariant): string {
  if (variant === "success") {
    return "bg-emerald-100 text-emerald-900";
  }
  if (variant === "warning") {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-muted text-foreground";
}

/**
 * Badge component used for small status labels.
 */
export default function Badge({ variant = "neutral", className, ...props }: BadgeProps): ReactElement {
  const variantClasses: string = getBadgeClasses(variant);
  const mergedClassName: string = cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
    variantClasses,
    className,
  );
  return <span className={mergedClassName} {...props} />;
}
