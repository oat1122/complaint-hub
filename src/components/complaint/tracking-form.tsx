"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

export default function TrackingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [complaint, setComplaint] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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

  const onSubmit = async (data: TrackingFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setComplaint(null);

      const response = await fetch(
        `/api/tracking?trackingNumber=${encodeURIComponent(
          data.trackingNumber
        )}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("No complaint found with this tracking number");
        } else {
          const errorData = await response.json();
          setError(
            errorData.error || "An error occurred while tracking your complaint"
          );
        }
        return;
      }

      const complaintData = await response.json();
      setComplaint(complaintData);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Track Your Complaint</h2>

      {/* Tracking Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow">
            <label htmlFor="trackingNumber" className="sr-only">
              Tracking Number
            </label>
            <input
              id="trackingNumber"
              type="text"
              {...register("trackingNumber")}
              placeholder="Enter your tracking number (e.g. CMP-20250623-1234)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.trackingNumber && (
              <p className="text-red-600 text-sm mt-1">
                {errors.trackingNumber.message}
              </p>
            )}
          </div>{" "}
          <Button
            type="submit"
            variant="secondary"
            className="md:w-32 bg-black text-white hover:bg-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Track"}
          </Button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}
      </form>

      {/* Complaint Details */}
      {complaint && (
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Complaint Details</h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="font-medium">{complaint.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted On</p>
                <p className="font-medium">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">
                  {getCategoryLabel(complaint.category)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(
                    complaint.priority
                  )}`}
                >
                  {complaint.priority.charAt(0).toUpperCase() +
                    complaint.priority.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{complaint.subject}</p>
            </div>

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Attachments</p>
                <p className="font-medium">
                  {complaint.attachments.length} file(s) attached
                </p>
              </div>
            )}

            <div className="bg-white p-4 rounded border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="font-medium">
                  {complaint.status === "new" ? "Submitted" : "Archived"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
