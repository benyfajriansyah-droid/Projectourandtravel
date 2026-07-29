"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyPoint } from "./revenue-trend-chart";

/**
 * Recharts cukup besar; dimuat terpisah agar tidak menahan render awal
 * dashboard. Skeleton dipakai selama chunk-nya diunduh.
 */
const RevenueTrendChart = dynamic(
  () => import("./revenue-trend-chart").then((m) => m.RevenueTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-56 w-full sm:h-64" />,
  }
);

export function RevenueTrendChartLazy({ data }: { data: MonthlyPoint[] }) {
  return <RevenueTrendChart data={data} />;
}

export type { MonthlyPoint };
