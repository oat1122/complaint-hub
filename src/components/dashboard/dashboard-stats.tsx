"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BarChart4 } from "lucide-react";
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
  Area,
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
          <p className="mt-4 text-gray-600">กำลังโหลดสถิติ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">เกิดข้อผิดพลาดในการโหลดสถิติ</p>
        <p>{error}</p>
        <Button onClick={fetchStats} className="mt-2">
          ลองใหม่
        </Button>
      </div>
    );
  }

  if (!stats) {
    return <div>ไม่มีข้อมูลสถิติ</div>;
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
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
  ];
  const PRIORITY_COLORS = [
    "#60a5fa", // blue-400
    "#fbbf24", // amber-400
    "#f97316", // orange-500
    "#ef4444", // red-500
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <BarChart4 className="h-5 w-5 text-blue-500" />
          ภาพรวมรายงานสถิติ
        </h2>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              หมวดหมู่คำร้องเรียน
            </h3>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>ทั้งหมด</option>
              <option>30 วันล่าสุด</option>
              <option>ปีนี้</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value: any) => [`${value} คำร้อง`, "จำนวน"]}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              ระดับความสำคัญ
            </h3>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>ทั้งหมด</option>
              <option>30 วันล่าสุด</option>
              <option>ปีนี้</option>
            </select>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  label={({ name, value, percent }) =>
                    `${name}: ${Math.round(percent * 100)}%`
                  }
                >
                  {priorityData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} คำร้อง`, "จำนวน"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    border: "1px solid #e5e7eb",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center items-center gap-4 mt-2">
            {priorityData.map((entry: any, index: number) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{
                    backgroundColor:
                      PRIORITY_COLORS[index % PRIORITY_COLORS.length],
                  }}
                />
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            แนวโน้มคำร้องเรียนรายวัน
          </h3>
          <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
            <option>30 วัน</option>
            <option>60 วัน</option>
            <option>90 วัน</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: "#4b5563", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value: any) => [`${value} คำร้อง`, "จำนวน"]}
                labelFormatter={(label) => `วันที่: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 3, fill: "white", stroke: "#3b82f6", strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// StatCard component ถูกย้ายไปใช้ใน dashboard/page.tsx แล้ว

function formatCategoryName(category: string): string {
  const categories: Record<string, string> = {
    technical: "ปัญหาทางเทคนิค",
    environment: "สภาพแวดล้อม",
    hr: "ทรัพยากรบุคคล",
    equipment: "อุปกรณ์",
    safety: "ความปลอดภัย",
    financial: "การเงิน",
    others: "อื่นๆ",
  };
  return categories[category] || category;
}

function formatPriorityName(priority: string): string {
  const priorities: Record<string, string> = {
    low: "ต่ำ",
    medium: "ปานกลาง",
    high: "สูง",
    urgent: "ฉุกเฉิน",
  };
  return (
    priorities[priority] || priority.charAt(0).toUpperCase() + priority.slice(1)
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
}
