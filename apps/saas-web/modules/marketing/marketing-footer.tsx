import type { ReactElement } from "react";
import { getProductSuiteProducts } from "./product-suite";

export default function MarketingFooter(): ReactElement {
  const year: number = new Date().getFullYear();
  const products = getProductSuiteProducts();

  return (
    <footer className="border-t border-accent/60">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Truss</p>
            <p className="text-xs text-muted-foreground">Open multi-tenant SaaS starter — premium scaffolding, MIT licensed.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product suite</p>
            <ul className="grid gap-2 text-sm">
              {products.map((product) => (
                <li key={product.id}>
                  {product.isCurrent ? (
                    <span className="text-muted-foreground">{product.name} (current)</span>
                  ) : (
                    <a
                      href={product.href}
                      className="text-muted-foreground transition hover:text-foreground"
                      target={product.href.startsWith("http") ? "_blank" : undefined}
                      rel={product.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {product.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-accent/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Truss. MIT License.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="/#product-suite" className="hover:text-foreground">
              Suite
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
