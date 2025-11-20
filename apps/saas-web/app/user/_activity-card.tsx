"use client";

import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/modules/ui/card";

interface ActivityEntry {
  readonly id: string;
  readonly type: string;
  readonly description?: string | null;
  readonly createdAt: string;
  readonly orgName?: string | null;
}

interface ActivityResponse {
  readonly activity: readonly ActivityEntry[];
}

const ACTIVITY_QUERY_KEY: readonly [string] = ["activity"];
const ACTIVITY_STALE_TIME_MS: number = 30000;

function getApiBaseUrl(): string {
  const baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return baseUrl ?? "http://localhost:8787";
}

async function fetchActivity(): Promise<readonly ActivityEntry[]> {
  const baseUrl: string = getApiBaseUrl();
  const url: string = `${baseUrl}/activity`;
  try {
    const response: Response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data: ActivityResponse = (await response.json()) as ActivityResponse;
    return data.activity;
  } catch {
    return [];
  }
}

export default function ActivityCard(): ReactElement {
  const queryResult = useQuery<readonly ActivityEntry[]>({
    queryKey: ACTIVITY_QUERY_KEY,
    queryFn: fetchActivity,
    staleTime: ACTIVITY_STALE_TIME_MS,
  });
  const activity: readonly ActivityEntry[] = queryResult.data ?? [];
  const isLoading: boolean = queryResult.isLoading;
  const showLoadingMessage: boolean = isLoading && activity.length === 0;
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Recent activity</h2>
          <p className="text-xs text-muted-foreground">Latest project + invite events logged by the API.</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {showLoadingMessage ? "Loading..." : `Showing ${activity.length.toString()} entries`}
        </span>
      </div>
      {showLoadingMessage ? (
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      ) : activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet. Create a project or send an invite.</p>
      ) : (
        <ol className="space-y-3 text-sm">
          {activity.map((entry: ActivityEntry) => (
            <li key={entry.id} className="rounded-md border px-3 py-2">
              <p className="font-medium">{entry.type}</p>
              {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
              <p className="text-xs text-muted-foreground">
                {entry.orgName ?? "Personal org"} · {new Date(entry.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

