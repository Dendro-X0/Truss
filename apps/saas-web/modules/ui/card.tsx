import type { HTMLAttributes, ReactElement } from "react";
import cn from "./utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className, ...props }: CardProps): ReactElement {
  const mergedClassName: string = cn("rounded-lg border bg-background shadow-sm", className);
  return <div className={mergedClassName} {...props} />;
}
