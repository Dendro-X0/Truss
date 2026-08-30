"use client";

import type { ReactElement } from "react";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DemoMetricsPoint {
  readonly label: string;
  readonly mrr: number;
  readonly signups: number;
}

const DATA: readonly DemoMetricsPoint[] = [
  { label: "Jan", mrr: 1200, signups: 24 },
  { label: "Feb", mrr: 1500, signups: 30 },
  { label: "Mar", mrr: 1800, signups: 32 },
  { label: "Apr", mrr: 2100, signups: 36 },
  { label: "May", mrr: 2600, signups: 40 },
  { label: "Jun", mrr: 3000, signups: 44 },
] as const;

export default function DemoMetricsChart(): ReactElement {
  const data: DemoMetricsPoint[] = [...DATA];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }} />
          <Legend />
          <Line type="monotone" dataKey="mrr" name="MRR" stroke="hsl(var(--primary))" strokeWidth={2} />
          <Line type="monotone" dataKey="signups" name="Signups" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
