import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get days parameter from query string (default to 30)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);
    
    // Calculate the date range
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1); // -1 because we want to include today
      // Get complaints created within the range, grouped by date using Prisma's findMany and group by
    const startDateObj = startOfDay(startDate);
    const endDateObj = endOfDay(endDate);    // Get all complaints within the date range
    const complaints = await prisma.complaint.findMany({
      where: {
        createdAt: {
          gte: startDateObj,
          lte: endDateObj
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date manually since Prisma doesn't support grouping by date format
    const dateGroups: Record<string, number> = {};
    
    // Initialize all dates in range with zero
    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateKey = format(tempDate, 'yyyy-MM-dd');
      dateGroups[dateKey] = 0;
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Count complaints by date
    complaints.forEach(complaint => {
      const dateKey = format(complaint.createdAt, 'yyyy-MM-dd');
      dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1;
    });
    
    // Transform the grouped data to the expected format
    const transformedComplaints = Object.entries(dateGroups).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));    // We no longer need fillMissingDates since we initialize all dates
    return NextResponse.json({ 
      data: transformedComplaints,
      range: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
        days
      }
    });  } catch (error) {
    console.error("Error retrieving daily complaint trends:", error);
    return NextResponse.json({ error: "Failed to fetch daily trends" }, { status: 500 });
  }
}
