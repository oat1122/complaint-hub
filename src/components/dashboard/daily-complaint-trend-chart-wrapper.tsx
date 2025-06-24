"use client";

import dynamic from "next/dynamic";

// Dynamically import the chart component with no SSR
const DailyComplaintTrendChart = dynamic(
  () => import("@/components/dashboard/daily-complaint-trend-chart"),
  { ssr: false }
);

export default function DailyComplaintTrendChartWrapper() {
  return <DailyComplaintTrendChart />;
}
