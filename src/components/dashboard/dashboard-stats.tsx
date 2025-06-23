"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStatsProps {
  initialStats?: any;
}

export default function DashboardStats({ initialStats }: DashboardStatsProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState(initialStats || null);
  const [isLoading, setIsLoading] = useState(!initialStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [initialStats]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      setError(error.message || "An error occurred while fetching statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Error loading statistics</p>
        <p>{error}</p>
        <Button onClick={fetchStats} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return <div>No statistics available</div>;
  }

  // Prepare data for charts
  const categoryData =
    stats.complaintsByCategory?.map((item: any) => ({
      name: formatCategoryName(item.category),
      value: item._count,
    })) || [];

  const priorityData =
    stats.complaintsByPriority?.map((item: any) => ({
      name: formatPriorityName(item.priority),
      value: item._count,
    })) || [];

  const dailyData =
    stats.dailyComplaints?.map((item: any) => ({
      date: formatDate(item.date),
      count: item.count,
    })) || [];

  // Colors for pie charts
  const CATEGORY_COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
  ];
  const PRIORITY_COLORS = ["#54B4D3", "#FFCA28", "#FF9800", "#F44336"];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          description="All time"
        />
        <StatCard
          title="Today's Complaints"
          value={stats.todaysComplaints}
          description="Last 24 hours"
        />
        <StatCard
          title="File Attachments"
          value={stats.attachments?.total || 0}
          description={`Avg. ${
            stats.attachments?.avgPerComplaint.toFixed(1) || 0
          } per complaint`}
        />
        <StatCard
          title="Top Category"
          value={
            stats.topCategories?.[0]?.category
              ? formatCategoryName(stats.topCategories[0].category)
              : "N/A"
          }
          description={
            stats.topCategories?.[0]?.count
              ? `${stats.topCategories[0].count} complaints`
              : ""
          }
        />
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Complaints by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Complaints by Priority</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white p-5 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Daily Complaint Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline">
        <p className="text-3xl font-semibold">{value}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function formatCategoryName(category: string): string {
  const categories: Record<string, string> = {
    technical: "Technical Issues",
    environment: "Environment",
    hr: "Human Resources",
    equipment: "Equipment",
    safety: "Safety & Security",
    financial: "Financial",
    others: "Others",
  };
  return categories[category] || category;
}

function formatPriorityName(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
