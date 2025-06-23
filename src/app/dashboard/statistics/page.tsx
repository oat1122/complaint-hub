import { Metadata } from "next";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export const metadata: Metadata = {
  title: "Statistics - Complaint Hub",
  description: "Analytics and statistics for submitted complaints",
};

export default async function StatisticsPage() {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Statistics & Analytics</h1>
        {role === "viewer" && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-semibold">
            Read-Only Mode
          </div>
        )}
      </div>

      {/* We do not pass initialStats here to force the component to fetch fresh data */}
      <DashboardStats />
    </div>
  );
}
