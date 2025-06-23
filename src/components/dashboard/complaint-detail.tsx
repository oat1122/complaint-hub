"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface ComplaintDetailProps {
  complaint: any;
}

export default function ComplaintDetail({ complaint }: ComplaintDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = session?.user?.role === "admin";
  if (!complaint) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">ไม่พบคำร้องเรียน</p>
        <Button
          onClick={() => router.push("/dashboard/complaints")}
          variant="secondary"
          className="mt-4"
        >
          กลับไปยังคำร้องเรียน
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (
      !window.confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการลบคำร้องเรียนนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/complaint/${complaint.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete complaint");
      }

      router.push("/dashboard/complaints");
      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to delete complaint"}`);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryLabel = (category: string) => {
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
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // File type icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "📷";
    } else if (mimeType === "application/pdf") {
      return "📄";
    } else if (mimeType.includes("word")) {
      return "📝";
    } else {
      return "📎";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Complaint Details</h2>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/complaints")}
          >
            Back to Complaints
          </Button>
          {isAdmin && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Complaint"}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-sm text-gray-500">Tracking Number</span>
              <h3 className="text-xl font-semibold">
                {complaint.trackingNumber}
              </h3>
            </div>
            <div className="mt-2 lg:mt-0 flex flex-wrap gap-2 lg:gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Submitted On</span>
                <span className="font-medium">
                  {formatDate(complaint.createdAt)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Category</span>
                <span className="font-medium">
                  {getCategoryLabel(complaint.category)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Priority</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(
                    complaint.priority
                  )}`}
                >
                  {complaint.priority.charAt(0).toUpperCase() +
                    complaint.priority.slice(1)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Status</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    complaint.status === "new"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {complaint.status === "new" ? "New" : "Archived"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject & Description */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Subject</h3>
            <p className="text-gray-800">{complaint.subject}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <div className="bg-gray-50 p-4 rounded-md text-gray-800 whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>
        </div>

        {/* Attachments */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">
              Attachments ({complaint.attachments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaint.attachments.map((attachment: any) => (
                <div
                  key={attachment.id}
                  className="bg-gray-50 rounded-md p-3 border border-gray-200 flex items-start"
                >
                  <div className="text-2xl mr-3">
                    {getFileIcon(attachment.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachment.fileSize / 1024).toFixed(1)} KB •{" "}
                      {attachment.mimeType.split("/")[1]}
                    </p>
                  </div>
                  <a
                    href={attachment.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 text-sm ml-2"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
