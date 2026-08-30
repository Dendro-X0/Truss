import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

type ShadcnButtonProps = ComponentPropsWithoutRef<typeof ShadcnButton>;

interface ButtonProps extends Omit<ShadcnButtonProps, "variant" | "size"> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly asChild?: boolean;
}

function mapVariantToShadcn(variant: ButtonVariant): "default" | "outline" | "ghost" {
  if (variant === "outline") {
    return "outline";
  }
  if (variant === "ghost") {
    return "ghost";
  }
  return "default";
}

function mapSizeToShadcn(size: ButtonSize): "sm" | "default" | "lg" {
  if (size === "sm") {
    return "sm";
  }
  if (size === "lg") {
    return "lg";
  }
  return "default";
}

/**
 * Primary button component for Truss UI.
 */
export default function Button({ variant = "primary", size = "md", asChild = false, ...props }: ButtonProps): ReactElement {
  const shadcnVariant: "default" | "outline" | "ghost" = mapVariantToShadcn(variant);
  const shadcnSize: "sm" | "default" | "lg" = mapSizeToShadcn(size);
  return <ShadcnButton variant={shadcnVariant} size={shadcnSize} asChild={asChild} {...props} />;
}
