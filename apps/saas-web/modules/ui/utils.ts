import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values));
}

export default cn;
