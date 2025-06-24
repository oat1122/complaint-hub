"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, "กรุณากรอกหมายเลขติดตาม"),
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
    return new Intl.DateTimeFormat("th-TH", {
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

  const getPriorityLabel = (priority: string) => {
    const priorities: Record<string, string> = {
      low: "ต่ำ",
      medium: "ปานกลาง",
      high: "สูง",
      urgent: "เร่งด่วน",
    };
    return priorities[priority] || priority;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      technical: "ปัญหาด้านเทคนิค",
      environment: "สิ่งแวดล้อม",
      hr: "ทรัพยากรบุคคล",
      equipment: "อุปกรณ์",
      safety: "ความปลอดภัยและการรักษาความปลอดภัย",
      financial: "การเงิน",
      others: "อื่น ๆ",
    };
    return categories[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      new: "ส่งแล้ว",
      received: "รับเรื่องแล้ว",
      discussing: "กำลังพิจารณา",
      processing: "กำลังดำเนินการ",
      resolved: "แก้ไขแล้ว",
      archived: "จัดเก็บ",
    };
    return statuses[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500 text-white";
      case "received":
        return "bg-indigo-500 text-white";
      case "discussing":
        return "bg-purple-500 text-white";
      case "processing":
        return "bg-yellow-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      case "archived":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "received":
        return "bg-indigo-500";
      case "discussing":
        return "bg-purple-500";
      case "processing":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
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
          setError("ไม่พบคำร้องเรียนที่ตรงกับหมายเลขติดตามนี้");
        } else {
          const errorData = await response.json();
          setError(
            errorData.error || "เกิดข้อผิดพลาดระหว่างการติดตามคำร้องเรียนของคุณ"
          );
        }
        return;
      }

      const complaintData = await response.json();
      setComplaint(complaintData);
    } catch (error) {
      setError("เกิดข้อผิดพลาด โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusProgress = (status: string) => {
    switch (status) {
      case "new":
        return 0;
      case "received":
        return 25;
      case "discussing":
        return 50;
      case "processing":
        return 75;
      case "resolved":
      case "archived":
        return 100;
      default:
        return 0;
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  return (
    <>
      {/* Tracking Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="mb-4">
          <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
            หมายเลขติดตาม *
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <input
                id="trackingNumber"
                type="text"
                {...register("trackingNumber")}
                placeholder="กรอกหมายเลขติดตามของคุณ (เช่น CMP-20250623-1234)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.trackingNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.trackingNumber.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="md:w-36 bg-black text-white hover:bg-gray-800 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-1">
          <svg
            className="w-4 h-4 inline-block mr-1"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          หมายเลขติดตามจะอยู่ในหน้ายืนยันหลังจากที่คุณส่งคำร้องเรียนเสร็จสมบูรณ์
        </p>

        {error && (
          <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </form>

      {/* Complaint Details */}
      {complaint && (
        <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
          {/* Status Header */}
          <div className={`p-4 ${getStatusBadgeClass(complaint.status)}`}>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <h3 className="text-lg font-bold">
                สถานะคำร้องเรียน: {getStatusLabel(complaint.status)}
              </h3>
            </div>
          </div>

          {/* Status Progress Bar */}
          <div className="px-4 py-6 border-b border-gray-200">
            <div className="mb-2 flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">ความคืบหน้า</h4>
              <span className="text-sm font-medium text-primary-600">{getStatusProgress(complaint.status)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{
                  width: `${getStatusProgress(complaint.status)}%`,
                  backgroundColor: complaint.status === "resolved" || complaint.status === "archived" ? "#22c55e" : 
                                 complaint.status === "processing" ? "#eab308" : 
                                 complaint.status === "discussing" ? "#a855f7" : 
                                 complaint.status === "received" ? "#6366f1" : "#3b82f6"
                }}
              ></div>
            </div>
            
            {/* Status Timeline */}
            <div className="mt-5 grid grid-cols-5 text-xs">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${complaint.status ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
                  <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-center font-medium text-blue-800">ส่งแล้ว</span>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${["received", "discussing", "processing", "resolved", "archived"].includes(complaint.status) ? "bg-indigo-500 text-white" : "bg-gray-300"}`}>
                  {["received", "discussing", "processing", "resolved", "archived"].includes(complaint.status) && (
                    <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className={`text-center font-medium ${["received", "discussing", "processing", "resolved", "archived"].includes(complaint.status) ? "text-indigo-800" : "text-gray-500"}`}>รับเรื่องแล้ว</span>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${["discussing", "processing", "resolved", "archived"].includes(complaint.status) ? "bg-purple-500 text-white" : "bg-gray-300"}`}>
                  {["discussing", "processing", "resolved", "archived"].includes(complaint.status) && (
                    <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className={`text-center font-medium ${["discussing", "processing", "resolved", "archived"].includes(complaint.status) ? "text-purple-800" : "text-gray-500"}`}>กำลังพิจารณา</span>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${["processing", "resolved", "archived"].includes(complaint.status) ? "bg-yellow-500 text-white" : "bg-gray-300"}`}>
                  {["processing", "resolved", "archived"].includes(complaint.status) && (
                    <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className={`text-center font-medium ${["processing", "resolved", "archived"].includes(complaint.status) ? "text-yellow-800" : "text-gray-500"}`}>กำลังดำเนินการ</span>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${["resolved", "archived"].includes(complaint.status) ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                  {["resolved", "archived"].includes(complaint.status) && (
                    <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className={`text-center font-medium ${["resolved", "archived"].includes(complaint.status) ? "text-green-800" : "text-gray-500"}`}>แก้ไขแล้ว</span>
              </div>
            </div>
          </div>          {/* Complaint Information */}
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">รายละเอียดคำร้องเรียน</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">หมายเลขติดตาม</p>
                <p className="font-medium text-base">{complaint.trackingNumber}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">วันที่ส่งคำร้องเรียน</p>
                <p className="font-medium text-base">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">หมวดหมู่</p>
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm font-medium">
                    {getCategoryLabel(complaint.category)}
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">ระดับความสำคัญ</p>
                <div className="flex items-center">
                  <span 
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${getPriorityBadgeClass(complaint.priority)}`}
                  >
                    {getPriorityLabel(complaint.priority)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">หัวข้อ</p>
              <p className="font-medium text-base bg-gray-50 p-4 rounded-lg">
                {complaint.subject}
              </p>
            </div>

            {complaint.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">รายละเอียด</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-base whitespace-pre-wrap">{complaint.description}</p>
                </div>
              </div>
            )}

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">ไฟล์แนบ</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {complaint.attachments.map((attachment: any, index: number) => (
                      <div key={attachment.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <div>
                            <p className="font-medium text-sm">{attachment.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.fileSize || 0)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                          {getFileExtension(attachment.originalName)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
