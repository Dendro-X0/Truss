"use client";

import type { InputHTMLAttributes, ReactElement } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import cn from "./utils";

type InputSize = "sm" | "md" | "lg";

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

interface InputProps extends BaseInputProps {
  readonly size?: InputSize;
}

function getSizeClasses(size: InputSize): string {
  if (size === "sm") {
    return "h-8 px-2 text-xs";
  }
  if (size === "lg") {
    return "h-10 px-3 py-2 text-sm";
  }
  return "h-9 px-3 text-sm";
}

export default function Input({ size = "md", className, ...props }: InputProps): ReactElement {
  const sizeClasses: string = getSizeClasses(size);
  const mergedClassName: string = cn(sizeClasses, className);
  return <ShadcnInput className={mergedClassName} {...props} />;
}
