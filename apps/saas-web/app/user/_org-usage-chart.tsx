"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PlanName } from "../_plans";

interface OrgUsageChartItem {
  readonly label: string;
  readonly used: number | null;
  readonly limit?: number;
}

interface OrgUsageChartProps {
  readonly planName: PlanName;
  readonly items: readonly OrgUsageChartItem[];
}

interface OrgUsageChartDataPoint {
  readonly label: string;
  readonly used: number;
  readonly remaining: number;
  readonly hasLimit: boolean;
}

function buildChartData(items: readonly OrgUsageChartItem[]): OrgUsageChartDataPoint[] {
  return items.map((item: OrgUsageChartItem): OrgUsageChartDataPoint => {
    const safeUsed: number = item.used ?? 0;
    const limit: number | undefined = item.limit;
    if (limit === undefined || limit <= 0) {
      return { label: item.label, used: safeUsed, remaining: 0, hasLimit: false };
    }
    const remaining: number = Math.max(limit - safeUsed, 0);
    return { label: item.label, used: safeUsed, remaining, hasLimit: true };
  });
}

export default function OrgUsageChart({ planName, items }: OrgUsageChartProps): ReactElement {
  const data: OrgUsageChartDataPoint[] = buildChartData(items);
  const hasAnyLimit: boolean = data.some((item: OrgUsageChartDataPoint): boolean => item.hasLimit);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={32} barSize={24}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
          <Legend />
          <Bar dataKey="used" name="Used" stackId="usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar
            dataKey="remaining"
            name="Remaining"
            stackId="usage"
            fill="hsl(var(--muted-foreground))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      {!hasAnyLimit && (
        <p className="mt-2 text-xs text-muted-foreground">
          Usage is shown without plan limits. Upgrade plans can configure member and project caps.
        </p>
      )}
      {hasAnyLimit && (
        <p className="mt-2 text-xs text-muted-foreground">
          Plan {planName} usage compared to allowed members and projects.
        </p>
      )}
    </div>
  );
}
