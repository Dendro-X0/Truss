import type { ComponentProps, ReactElement } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";

type CardProps = ComponentProps<typeof ShadcnCard>;

export default function Card({ className, ...props }: CardProps): ReactElement {
  return <ShadcnCard className={className} {...props} />;
}
