import type { ReactElement } from "react";
import { getProductSuiteProducts, type ProductSuiteProduct } from "./product-suite";

const tierLabel: Record<ProductSuiteProduct["tier"], string> = {
  open: "Open core",
  pro: "Commercial",
  modular: "Modular",
};

export default function ProductSuiteSection(): ReactElement {
  const products: readonly ProductSuiteProduct[] = getProductSuiteProducts();
  const upgradeTarget: ProductSuiteProduct | undefined = products.find((product) => product.id === "strata");

  return (
    <section id="product-suite" className="space-y-6 border-t border-accent bg-surface/95 pt-8 animate-fade-up">
      <div className="space-y-2 text-center">
        <p className="mx-auto inline-flex max-w-fit items-center rounded-full border px-4 py-1 text-xs font-medium text-muted-foreground">
          Truss product suite
        </p>
        <h2 className="text-2xl font-semibold">Start open. Graduate when revenue needs more surface area.</h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Truss is the free, premium-quality core — same architectural DNA as Strata Pro. Stay on Truss while you
          customize; move to Strata when you want production billing, AI Studio, and admin diagnostics without assembly.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.id}
            className={`surface-card rounded-2xl p-5 text-sm shadow-sm ${product.isCurrent ? "ring-1 ring-primary/30" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tierLabel[product.tier]}</p>
                <h3 className="text-base font-semibold">{product.name}</h3>
              </div>
              {product.isCurrent ? (
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">You are here</span>
              ) : null}
            </div>
            <p className="mt-2 text-muted-foreground">{product.tagline}</p>
            {!product.isCurrent ? (
              <a
                href={product.href}
                className="mt-4 inline-flex text-xs font-medium text-primary hover:underline"
                target={product.href.startsWith("http") ? "_blank" : undefined}
                rel={product.href.startsWith("http") ? "noreferrer" : undefined}
              >
                Explore {product.name} →
              </a>
            ) : null}
          </article>
        ))}
      </div>
      {upgradeTarget ? (
        <p className="text-center text-xs text-muted-foreground">
          Need Polar/Stripe billing, showcase dashboards, or in-app docs?{" "}
          <a href={upgradeTarget.href} className="font-medium text-primary hover:underline">
            Compare Strata Pro
          </a>
          .
        </p>
      ) : null}
    </section>
  );
}
