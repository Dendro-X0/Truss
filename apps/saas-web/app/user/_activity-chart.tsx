"use client";

import type { ReactElement } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ActivityEntry {
  readonly id: string;
  readonly type: string;
  readonly description?: string | null;
  readonly createdAt: string;
  readonly orgName?: string | null;
}

interface ActivityChartProps {
  readonly entries: readonly ActivityEntry[];
  readonly days?: number;
}

interface ActivityChartDatum {
  readonly dateLabel: string;
  readonly count: number;
}

function formatDateLabel(date: Date): string {
  const month: number = date.getMonth() + 1;
  const day: number = date.getDate();
  return `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
}

function toDayKey(date: Date): string {
  const year: number = date.getFullYear();
  const month: number = date.getMonth() + 1;
  const day: number = date.getDate();
  return `${year.toString()}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function buildActivityChartData(entries: readonly ActivityEntry[], days: number): ActivityChartDatum[] {
  const now: Date = new Date();
  const counts: Map<string, number> = new Map<string, number>();
  entries.forEach((entry: ActivityEntry): void => {
    const created: Date = new Date(entry.createdAt);
    const key: string = toDayKey(created);
    const previous: number = counts.get(key) ?? 0;
    counts.set(key, previous + 1);
  });
  const data: ActivityChartDatum[] = [];
  for (let i: number = days - 1; i >= 0; i -= 1) {
    const date: Date = new Date(now);
    date.setDate(now.getDate() - i);
    const key: string = toDayKey(date);
    const count: number = counts.get(key) ?? 0;
    data.push({ dateLabel: formatDateLabel(date), count });
  }
  return data;
}

export default function ActivityChart({ entries, days = 14 }: ActivityChartProps): ReactElement {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet. Create a project or send an invite.</p>;
  }
  const data: ActivityChartDatum[] = buildActivityChartData(entries, days);
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={24} />
          <Tooltip cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-muted-foreground">Events per day over the last {days.toString()} days.</p>
    </div>
  );
}
