/** Canonical public URLs for the product suite (override via NEXT_PUBLIC_* in deploy env). */
export const TRUSS_WEB_URL = "https://truss-web-omega.vercel.app/";
export const TRUSS_GITHUB_URL = "https://github.com/Dendro-X0/Truss";
export const STRATA_WEB_URL = "https://strata-web-ivory.vercel.app/";

export type ProductSuiteTier = "open" | "pro" | "modular";

export type ProductSuiteProduct = {
  readonly id: "truss" | "strata" | "velocity";
  readonly name: string;
  readonly tagline: string;
  readonly href: string;
  readonly tier: ProductSuiteTier;
  readonly isCurrent: boolean;
};

function readEnv(name: string): string {
  return String(process.env[name] ?? "").trim();
}

/** Cross-product links for the Truss / Strata / Velocity suite. */
export function getProductSuiteProducts(): readonly ProductSuiteProduct[] {
  const trussUrl: string = readEnv("NEXT_PUBLIC_TRUSS_URL") || readEnv("NEXT_PUBLIC_APP_URL") || TRUSS_WEB_URL;
  const strataUrl: string = readEnv("NEXT_PUBLIC_STRATA_URL") || STRATA_WEB_URL;
  const velocityUrl: string = readEnv("NEXT_PUBLIC_VELOCITY_URL");
  const trussGithub: string = readEnv("NEXT_PUBLIC_TRUSS_GITHUB_URL") || TRUSS_GITHUB_URL;

  const products: ProductSuiteProduct[] = [
    {
      id: "truss",
      name: "Truss",
      tagline: "Open-source SaaS core — premium scaffolding you own",
      href: trussGithub,
      tier: "open",
      isCurrent: true,
    },
    {
      id: "strata",
      name: "Strata Pro",
      tagline: "Complete boilerplate — billing, AI Studio, admin tools",
      href: strataUrl,
      tier: "pro",
      isCurrent: false,
    },
  ];

  if (velocityUrl) {
    products.push({
      id: "velocity",
      name: "Velocity Stack",
      tagline: "Modular SaaS platform — compose and swap integrations",
      href: velocityUrl,
      tier: "modular",
      isCurrent: false,
    });
  }

  return products;
}

export function getStrataUpgradeUrl(): string {
  return readEnv("NEXT_PUBLIC_STRATA_URL") || STRATA_WEB_URL;
}

export function getTrussWebUrl(): string {
  return readEnv("NEXT_PUBLIC_TRUSS_URL") || TRUSS_WEB_URL;
}
