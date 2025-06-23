import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// API route for exporting complaints as CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all complaints with their attachments
    const complaints = await prisma.complaint.findMany({
      include: {
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Generate CSV headers
    const headers = [
      "ID",
      "Tracking Number",
      "Category",
      "Priority",
      "Status",
      "Subject",
      "Description",
      "Created At",
      "Attachments Count",
    ].join(",");

    // Generate CSV rows
    const rows = complaints.map((complaint) => {
      // Sanitize fields to handle commas and quotes in CSV
      const sanitize = (text: string) => {
        if (!text) return "";
        // If text contains commas or quotes, wrap it in quotes
        // and escape any quotes already in the text
        if (text.includes(",") || text.includes('"')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };

      return [
        complaint.id,
        complaint.trackingNumber,
        complaint.category,
        complaint.priority,
        complaint.status,
        sanitize(complaint.subject),
        sanitize(complaint.description),
        complaint.createdAt.toISOString(),
        complaint.attachments.length.toString(),
      ].join(",");
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows].join("\n");

    // Create a new response with CSV content
    const response = new NextResponse(csvContent);

    // Set appropriate headers for downloading a CSV file
    response.headers.set("Content-Type", "text/csv; charset=utf-8");
    response.headers.set("Content-Disposition", `attachment; filename="complaints-export-${new Date().toISOString().slice(0, 10)}.csv"`);

    return response;
  } catch (error) {
    console.error("Error exporting complaints:", error);
    return NextResponse.json(
      { error: "Failed to export complaints" },
      { status: 500 }
    );
  }
}
