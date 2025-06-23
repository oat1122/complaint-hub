import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema
const complaintSchema = z.object({
  category: z.enum([
    "technical",
    "environment",
    "hr",
    "equipment",
    "safety",
    "financial",
    "others",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  subject: z.string().min(3).max(255),
  description: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    // Parse the complaint data
    const data = await request.json();

    // Validate the data
    const validatedData = complaintSchema.parse(data);

    // Generate a tracking number
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const trackingNumber = `CMP-${dateString}-${random}`;

    // Create the complaint
    const complaint = await prisma.complaint.create({
      data: {
        trackingNumber,
        ...validatedData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        trackingNumber: complaint.trackingNumber,
        id: complaint.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating complaint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create complaint",
      },
      { status: 500 }
    );
  }
}
