"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import React from "react";

// React Icons
import {
  HiSearch,
  HiDocumentText,
  HiExclamationCircle,
  HiInformationCircle,
  HiClock,
  HiFolder,
  HiFlag,
  HiCheckCircle,
  HiRefresh,
  HiEye,
  HiPaperClip,
  HiPhone,
  HiDesktopComputer,
} from "react-icons/hi";

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, "กรุณากรอกหมายเลขติดตาม"),
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

// Helper function to get status progress
function getStatusProgress(status: string): number {
  const progress = {
    new: 20,
    received: 40,
    discussing: 60,
    processing: 80,
    resolved: 100,
    archived: 100,
  };
  return progress[status as keyof typeof progress] || 0;
}

export default function TrackingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [complaint, setComplaint] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
  });

  const watchedTrackingNumber = watch("trackingNumber");

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

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: { 
        class: "bg-blue-100 text-blue-800 border-blue-200", 
        label: "ต่ำ",
        icon: HiInformationCircle 
      },
      medium: { 
        class: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        label: "ปานกลาง",
        icon: HiExclamationCircle 
      },
      high: { 
        class: "bg-orange-100 text-orange-800 border-orange-200", 
        label: "สูง",
        icon: HiExclamationCircle 
      },
      urgent: { 
        class: "bg-red-100 text-red-800 border-red-200", 
        label: "ฉุกเฉิน",
        icon: HiExclamationCircle 
      },
    };
    return configs[priority as keyof typeof configs] || configs.medium;
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

  const getStatusConfig = (status: string) => {
    const configs = {
      new: { 
        class: "bg-blue-500 text-white", 
        label: "ส่งแล้ว",
        progress: 20,
        icon: HiDocumentText 
      },
      received: { 
        class: "bg-indigo-500 text-white", 
        label: "รับเรื่องแล้ว",
        progress: 40,
        icon: HiCheckCircle 
      },
      discussing: { 
        class: "bg-purple-500 text-white", 
        label: "กำลังพิจารณา",
        progress: 60,
        icon: HiRefresh 
      },
      processing: { 
        class: "bg-yellow-500 text-white", 
        label: "กำลังดำเนินการ",
        progress: 80,
        icon: HiClock 
      },
      resolved: { 
        class: "bg-green-500 text-white", 
        label: "แก้ไขแล้ว",
        progress: 100,
        icon: HiCheckCircle 
      },
      archived: { 
        class: "bg-gray-500 text-white", 
        label: "จัดเก็บ",
        progress: 100,
        icon: HiFolder 
      },
    };
    return configs[status as keyof typeof configs] || configs.new;
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

  const onSubmit = async (data: TrackingFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setComplaint(null);

      const response = await fetch(
        `/api/tracking?trackingNumber=${encodeURIComponent(data.trackingNumber)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("ไม่พบคำร้องเรียนที่ตรงกับหมายเลขติดตามนี้");
        } else {
          const errorData = await response.json();
          setError(errorData.error || "เกิดข้อผิดพลาดระหว่างการติดตามคำร้องเรียนของคุณ");
        }
        return;
      }

      const complaintData = await response.json();
      setComplaint(complaintData);

      // Save to recent searches
      const updatedSearches = [data.trackingNumber, ...recentSearches.filter(s => s !== data.trackingNumber)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentTrackingSearches", JSON.stringify(updatedSearches));
    } catch (error) {
      setError("เกิดข้อผิดพลาด โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = (trackingNumber: string) => {
    setValue("trackingNumber", trackingNumber);
    handleSubmit(onSubmit)();
  };

  // Load recent searches on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentTrackingSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const statusConfig = complaint ? getStatusConfig(complaint.status) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <HiSearch className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              ตรวจสอบสถานะคำร้องเรียน
            </h2>
            <p className="text-blue-100 text-sm md:text-base px-2">
              กรอกหมายเลขติดตามเพื่อดูสถานะล่าสุด
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="trackingNumber" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  หมายเลขติดตาม
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="trackingNumber"
                    type="text"
                    {...register("trackingNumber")}
                    placeholder="เช่น CMP-20250623-1234"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors touch-manipulation"
                  />
                </div>
                {errors.trackingNumber && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <HiExclamationCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.trackingNumber.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg sm:rounded-xl touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    กำลังค้นหา...
                  </>
                ) : (
                  <>
                    <HiSearch className="w-5 h-5 mr-2" />
                    ค้นหาสถานะ
                  </>
                )}
              </Button>

              {/* Recent Searches */}
              {recentSearches.length > 0 && !complaint && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">การค้นหาล่าสุด:</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleRecentSearchClick(search)}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4">
                <div className="flex items-start">
                  <HiInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">คำแนะนำ</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      หมายเลขติดตามจะปรากฏในหน้ายืนยันหลังจากที่คุณส่งคำร้องเรียนเสร็จสมบูรณ์ 
                      รูปแบบหมายเลขคือ CMP-YYYYMMDD-XXXX
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4">
                  <div className="flex items-start">
                    <HiExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">ไม่พบข้อมูล</h4>
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Complaint Details */}
        {complaint && statusConfig && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Status Header */}
            <div className={`p-4 sm:p-6 ${statusConfig.class}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  {React.createElement(statusConfig.icon, { className: "w-6 h-6 mr-3 flex-shrink-0" })}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">
                      สถานะ: {statusConfig.label}
                    </h3>
                    <p className="text-sm opacity-90 mt-1">
                      อัปเดตล่าสุด: {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold">{statusConfig.progress}%</div>
                  <div className="text-xs opacity-90">เสร็จสิ้น</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="mb-3">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>ความคืบหน้า</span>
                  <span>{statusConfig.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{
                      width: `${statusConfig.progress}%`,
                      backgroundColor: complaint.status === "resolved" || complaint.status === "archived" ? "#10b981" : 
                                     complaint.status === "processing" ? "#f59e0b" : 
                                     complaint.status === "discussing" ? "#8b5cf6" : 
                                     complaint.status === "received" ? "#6366f1" : "#3b82f6"
                    }}
                  />
                </div>
              </div>
              
              {/* Status Timeline */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2 text-xs">
                {[
                  { key: "new", label: "ส่งแล้ว", step: 1 },
                  { key: "received", label: "รับเรื่อง", step: 2 },
                  { key: "discussing", label: "พิจารณา", step: 3 },
                  { key: "processing", label: "ดำเนินการ", step: 4 },
                  { key: "resolved", label: "เสร็จสิ้น", step: 5 },
                ].map((step) => {
                  const isActive = getStatusProgress(complaint.status) >= (step.step * 20);
                  const isCurrent = complaint.status === step.key || 
                    (complaint.status === "archived" && step.key === "resolved");

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full mb-1 flex items-center justify-center text-xs font-bold transition-colors ${
                        isActive 
                          ? isCurrent 
                            ? "bg-blue-600 text-white" 
                            : "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-500"
                      }`}>
                        {isActive && !isCurrent ? <HiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step.step}
                      </div>
                      <span className={`text-center font-medium leading-tight text-xs ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complaint Information */}
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <HiDocumentText className="w-5 h-5 mr-2 text-blue-600" />
                รายละเอียดคำร้องเรียน
              </h3>

              {/* Basic Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <HiSearch className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">หมายเลขติดตาม</span>
                  </div>
                  <p className="font-bold text-lg text-gray-900 font-mono break-all">
                    {complaint.trackingNumber}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <HiClock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">วันที่ส่งคำร้องเรียน</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatDate(complaint.createdAt)}
                  </p>
                </div>
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <HiFolder className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">หมวดหมู่</span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-medium inline-block">
                    {getCategoryLabel(complaint.category)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <HiFlag className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">ระดับความสำคัญ</span>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-medium inline-flex items-center border ${getPriorityConfig(complaint.priority).class}`}>
                    {React.createElement(getPriorityConfig(complaint.priority).icon, { className: "w-4 h-4 mr-2" })}
                    {getPriorityConfig(complaint.priority).label}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <HiDocumentText className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600">หัวข้อ</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-gray-900 leading-relaxed">
                    {complaint.subject}
                  </p>
                </div>
              </div>

              {/* Description */}
              {complaint.description && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <HiInformationCircle className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">รายละเอียด</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <HiPaperClip className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      ไฟล์แนบ ({complaint.attachments.length} ไฟล์)
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {complaint.attachments.map((attachment: any, index: number) => (
                        <div key={attachment.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center min-w-0 flex-1">
                              <HiDocumentText className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate text-sm">
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatFileSize(attachment.fileSize || 0)}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-md ml-2 flex-shrink-0">
                              {getFileExtension(attachment.originalName)}
                            </span>
                          </div>
                          <a
                            href={attachment.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium touch-manipulation"
                          >
                            <HiEye className="w-4 h-4 mr-1" />
                            ดูไฟล์
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <HiInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">ต้องการความช่วยเหลือ?</h4>
                    <p className="text-blue-800 text-sm leading-relaxed mb-3">
                      หากคุณมีคำถามเกี่ยวกับสถานะคำร้องเรียนหรือต้องการข้อมูลเพิ่มเติม
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a 
                        href="tel:02-123-4567"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-100 transition-colors touch-manipulation"
                      >
                        <HiPhone className="w-4 h-4 mr-2" />
                        โทร 02-123-4567
                      </a>
                      <a 
                        href="/"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-100 transition-colors touch-manipulation"
                      >
                        <HiDesktopComputer className="w-4 h-4 mr-2" />
                        ส่งคำร้องเรียนใหม่
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
