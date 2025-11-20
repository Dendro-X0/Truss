"use client";

import type { ButtonHTMLAttributes, ReactElement } from "react";
import cn from "./utils";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

function getVariantClasses(variant: ButtonVariant): string {
  if (variant === "outline") {
    return "border-border bg-transparent text-foreground hover:bg-muted";
  }
  if (variant === "ghost") {
    return "border-transparent bg-transparent text-muted-foreground hover:bg-muted/70";
  }
  return "border-primary bg-primary text-primary-foreground hover:opacity-90";
}

function getSizeClasses(size: ButtonSize): string {
  if (size === "sm") {
    return "h-8 px-3";
  }
  if (size === "lg") {
    return "h-11 px-5";
  }
  return "h-10 px-4";
}

/**
 * Primary button component for Truss UI.
 */
export default function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps): ReactElement {
  const variantClasses: string = getVariantClasses(variant);
  const sizeClasses: string = getSizeClasses(size);
  const mergedClassName: string = cn(
    "inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 transition",
    variantClasses,
    sizeClasses,
    className,
  );
  return <button className={mergedClassName} {...props} />;
}
