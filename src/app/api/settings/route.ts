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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get settings from database
    let settings = await prisma.settings.findUnique({
      where: { id: "singleton" }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "singleton",
          itemsPerPage: 10,
          autoArchiveDays: 90,
          enableAutoArchive: false
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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
        { error: "Unauthorized" },
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
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Update settings in database
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {
        itemsPerPage: data.itemsPerPage,
        autoArchiveDays: data.autoArchiveDays,
        enableAutoArchive: data.enableAutoArchive,
        lastUpdated: new Date()
      },
      create: {
        id: "singleton",
        itemsPerPage: data.itemsPerPage,
        autoArchiveDays: data.autoArchiveDays,
        enableAutoArchive: data.enableAutoArchive
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === "archiveOld") {
      // Get settings from database
      const settings = await prisma.settings.findUnique({
        where: { id: "singleton" }
      });
      
      const daysToArchive = settings?.autoArchiveDays || 90;
      
      // Calculate the date threshold
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysToArchive);
      
      // Archive old complaints
      const result = await prisma.complaint.updateMany({
        where: {
          createdAt: { lt: thresholdDate },
          status: { in: ["new", "received", "discussing", "processing", "resolved"] }
        },
        data: {
          status: "archived"
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: `${result.count} complaints archived` 
      });
    } else if (action === "deleteArchived") {
      // Delete all archived complaints
      const result = await prisma.complaint.deleteMany({
        where: { status: "archived" }
      });

      return NextResponse.json({ 
        success: true, 
        message: `${result.count} archived complaints deleted` 
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
