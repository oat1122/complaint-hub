import { NextResponse } from "next/server";
import { saveFile } from "@/lib/utils/file-upload";
import { prisma } from "@/lib/db/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const complaintId = formData.get("complaintId") as string;

    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    // Check if complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { attachments: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Check if max files reached
    if (complaint.attachments.length >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 files allowed per complaint" },
        { status: 400 }
      );
    }

    const files: File[] = [];
    formData.forEach((value, key) => {
      if (value instanceof File && key.startsWith("file")) {
        files.push(value);
      }
    });

    // Check if max files would be exceeded
    if (complaint.attachments.length + files.length > 5) {
      return NextResponse.json(
        {
          error: `Only ${5 - complaint.attachments.length} more files allowed`,
        },
        { status: 400 }
      );
    }

    const savedFiles = [];

    for (const file of files) {
      try {
        // Use secure file validator before saving
        const { validateFileSecurely } = await import('@/lib/security/file-validator');
        await validateFileSecurely(file);
        
        const savedFile = await saveFile(file);

        // Save file info to database
        const attachment = await prisma.attachment.create({
          data: {
            complaintId,
            originalName: savedFile.originalName,
            fileName: savedFile.fileName,
            fileSize: savedFile.fileSize,
            mimeType: savedFile.mimeType,
            filePath: savedFile.filePath,
          },
        });

        savedFiles.push(attachment);
      } catch (error: any) {
        // Use standardized error response
        const { createErrorResponse } = await import('@/lib/api/response-formatter');
        return NextResponse.json(
          createErrorResponse(error.message, 'FILE_VALIDATION_ERROR'),
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        files: savedFiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
