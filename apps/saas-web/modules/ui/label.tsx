import type { LabelHTMLAttributes, ReactElement } from "react";
import cn from "./utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export default function Label({ className, ...props }: LabelProps): ReactElement {
  const mergedClassName: string = cn("text-sm font-medium", className);
  return <label className={mergedClassName} {...props} />;
}
