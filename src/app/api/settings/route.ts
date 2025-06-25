import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET /api/settings - Get current settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Try to get settings from database
    let settings = await prisma.settings.findUnique({
      where: { id: "singleton" }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "singleton",
          itemsPerPage: 10,
          autoArchiveDays: 90,
          enableAutoArchive: false,
        }
      });
    }

    return NextResponse.json({
      itemsPerPage: settings.itemsPerPage,
      autoArchiveDays: settings.autoArchiveDays,
      enableAutoArchive: settings.enableAutoArchive,
      lastUpdated: settings.lastUpdated,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    
    // Return error with default settings
    return NextResponse.json(
      { 
        error: "Failed to fetch settings from database",
        itemsPerPage: 10,
        autoArchiveDays: 90,
        enableAutoArchive: false,
      },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (
      typeof data.itemsPerPage !== "number" ||
      typeof data.autoArchiveDays !== "number" ||
      typeof data.enableAutoArchive !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid request data - missing or incorrect fields" },
        { status: 400 }
      );
    }

    // Validate ranges
    if (data.itemsPerPage < 5 || data.itemsPerPage > 100) {
      return NextResponse.json(
        { error: "Items per page must be between 5 and 100" },
        { status: 400 }
      );
    }

    if (data.autoArchiveDays < 1 || data.autoArchiveDays > 365) {
      return NextResponse.json(
        { error: "Auto archive days must be between 1 and 365" },
        { status: 400 }
      );
    }

    // Upsert settings in database
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {
        itemsPerPage: data.itemsPerPage,
        autoArchiveDays: data.autoArchiveDays,
        enableAutoArchive: data.enableAutoArchive,
        lastUpdated: new Date(),
      },
      create: {
        id: "singleton",
        itemsPerPage: data.itemsPerPage,
        autoArchiveDays: data.autoArchiveDays,
        enableAutoArchive: data.enableAutoArchive,
      }
    });

    return NextResponse.json({
      success: true,
      itemsPerPage: settings.itemsPerPage,
      autoArchiveDays: settings.autoArchiveDays,
      enableAutoArchive: settings.enableAutoArchive,
      lastUpdated: settings.lastUpdated,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings in database" },
      { status: 500 }
    );
  }
}

// POST /api/settings - Process settings actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === "archiveOld") {
      // Get current settings to determine archive threshold
      let settings = await prisma.settings.findUnique({
        where: { id: "singleton" }
      });

      if (!settings) {
        settings = await prisma.settings.create({
          data: {
            id: "singleton",
            itemsPerPage: 10,
            autoArchiveDays: 90,
            enableAutoArchive: false,
          }
        });
      }

      const daysToArchive = settings.autoArchiveDays;
      
      // Calculate the date threshold
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysToArchive);
      
      // Archive old complaints (only those not already archived)
      const result = await prisma.complaint.updateMany({
        where: {
          createdAt: { lt: thresholdDate },
          status: { not: "archived" }
        },
        data: {
          status: "archived"
        }
      });

      return NextResponse.json({ 
        success: true, 
        count: result.count,
        message: `Successfully archived ${result.count} complaint(s) older than ${daysToArchive} days`
      });

    } else if (action === "deleteArchived") {
      // Count first for reporting
      const count = await prisma.complaint.count({
        where: { status: "archived" }
      });

      if (count === 0) {
        return NextResponse.json({ 
          success: true, 
          count: 0,
          message: "No archived complaints found to delete"
        });
      }

      // Delete all archived complaints and their attachments
      // Prisma will handle cascade deletion of attachments due to our schema
      const result = await prisma.complaint.deleteMany({
        where: { status: "archived" }
      });

      return NextResponse.json({ 
        success: true, 
        count: result.count,
        message: `Successfully deleted ${result.count} archived complaint(s) and their attachments`
      });

    } else {
      return NextResponse.json(
        { error: "Invalid action. Supported actions: 'archiveOld', 'deleteArchived'" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error processing settings action:", error);
    return NextResponse.json(
      { error: "Failed to process action - database error" },
      { status: 500 }
    );
  }
}
