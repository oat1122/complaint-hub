"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";

interface ComplaintData {
  date: string;
  count: number;
}

export default function DailyComplaintTrendChart() {
  const [data, setData] = useState<ComplaintData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  const fetchData = async (days: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call your API here
      const response = await fetch(`/api/statistics/daily-trends?days=${days}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
        const result = await response.json();
      console.log("API Response:", result);
      setData(result.data);
    } catch (err) {
      console.error("Error fetching daily complaint trend data:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      
      // Generate dummy data for development if API fails
      generateDummyData(days);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate dummy data for development
  const generateDummyData = (days: number) => {
    const dummyData: ComplaintData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      dummyData.push({
        date: format(date, "yyyy-MM-dd"),
        count: Math.floor(Math.random() * 10) + 1, // Random count between 1-10
      });
    }

    setData(dummyData);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "d MMM", { locale: th });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "d MMM yyyy", { locale: th });
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(parseInt(e.target.value));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
          <p className="text-sm font-medium">{formatTooltipDate(label)}</p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">จำนวน: </span> 
            {payload[0].value} คำร้องเรียน
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">แนวโน้มคำร้องเรียนรายวัน</h3>
        <select 
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
          value={timeRange}
          onChange={handleTimeRangeChange}
        >
          <option value={30}>30 วัน</option>
          <option value={60}>60 วัน</option>
          <option value={90}>90 วัน</option>
        </select>
      </div>
      
      <div className="h-80">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
