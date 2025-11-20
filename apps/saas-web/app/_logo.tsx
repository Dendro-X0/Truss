import type { ReactElement } from "react";

export interface LogoProps {
  readonly className?: string;
}

export default function Logo({ className }: LogoProps): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        rx="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11 13h10M16 13v9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
