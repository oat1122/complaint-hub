"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

// React Icons
import {
  HiDocumentText,
  HiPaperClip,
  HiX,
  HiCheck,
  HiExclamation,
  HiInformationCircle,
  HiUpload,
  HiTrash,
  HiEye,
  HiRefresh,
} from "react-icons/hi";

// Define the form schema
const complaintSchema = z.object({
  category: z.enum([
    "technical",
    "environment", 
    "hr",
    "equipment",
    "safety",
    "financial",
    "others",
  ], {
    required_error: "กรุณาเลือกหมวดหมู่",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "กรุณาเลือกระดับความสำคัญ",
  }),
  subject: z.string().min(3, "หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร"),
  description: z.string().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร"),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export default function ComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: undefined,
      priority: "medium",
      subject: "",
      description: "",
    },
  });

  const watchedValues = watch();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (selectedFiles: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    if (files.length + selectedFiles.length > 5) {
      newErrors.push("สามารถอัปโหลดได้สูงสุด 5 ไฟล์");
      setFileErrors(newErrors);
      return;
    }

    selectedFiles.forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        newErrors.push(`ไฟล์ ${file.name} มีรูปแบบที่ไม่รองรับ`);
      } else if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
      } else {
        validFiles.push(file);
      }
    });

    setFileErrors(newErrors);
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <HiEye className="w-4 h-4 text-blue-600" />;
    } else if (type === 'application/pdf') {
      return <HiDocumentText className="w-4 h-4 text-red-600" />;
    } else {
      return <HiDocumentText className="w-4 h-4 text-gray-600" />;
    }
  };

  const onSubmit = async (data: ComplaintFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const complaintResponse = await fetch("/api/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!complaintResponse.ok) {
        throw new Error("ไม่สามารถส่งคำร้องเรียนได้");
      }

      const complaintResult = await complaintResponse.json();
      const { trackingNumber, id: complaintId } = complaintResult;

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("complaintId", complaintId);

        files.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("ไม่สามารถอัปโหลดไฟล์ได้");
        }
      }

      setTrackingNumber(trackingNumber);
      reset();
      setFiles([]);
    } catch (error: any) {
      setSubmitError(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'; 
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (trackingNumber) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiCheck className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4">
            ส่งคำร้องเรียนสำเร็จแล้ว
          </h3>
          
          <p className="text-green-700 mb-6 text-sm md:text-base">
            ขอบคุณสำหรับการส่งคำร้องเรียน คำร้องของท่านถูกบันทึกโดยไม่ระบุตัวตนเรียบร้อยแล้ว
          </p>
          
          <div className="bg-white p-4 md:p-6 rounded-xl border border-green-300 mb-6">
            <p className="font-medium text-gray-700 text-sm md:text-base">หมายเลขติดตามของคุณ:</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2 break-all">
              {trackingNumber}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-3">
              กรุณาบันทึกหมายเลขติดตามนี้เพื่อตรวจสอบสถานะคำร้องเรียนของคุณในภายหลัง
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setTrackingNumber(null);
                reset();
              }}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <HiRefresh className="w-4 h-4 mr-2" />
              ส่งคำร้องเรียนอีกครั้ง
            </Button>
            
            <Button
              onClick={() => window.open('/tracking', '_blank')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <HiEye className="w-4 h-4 mr-2" />
              ตรวจสอบสถานะ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <HiDocumentText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ส่งคำร้องเรียนโดยไม่ระบุตัวตน
          </h2>
          <p className="text-blue-100 text-sm md:text-base">
            ร้องเรียนปัญหาต่างๆ อย่างปลอดภัยและเป็นความลับ
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <HiExclamation className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">เกิดข้อผิดพลาด</h4>
                <p className="text-red-700 text-sm mt-1">{submitError}</p>
              </div>
            </div>
          )}

          {/* Form Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>ความคืบหน้าการกรอกแบบฟอร์ม</span>
              <span>
                {Object.values(watchedValues).filter(Boolean).length}/4 ฟิลด์
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(watchedValues).filter(Boolean).length / 4) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                หมวดหมู่คำร้องเรียน <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register("category")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">เลือกหมวดหมู่</option>
                <option value="technical">ปัญหาด้านเทคนิค</option>
                <option value="environment">สิ่งแวดล้อม</option>
                <option value="hr">ทรัพยากรบุคคล</option>
                <option value="equipment">อุปกรณ์</option>
                <option value="safety">ความปลอดภัยและการรักษาความปลอดภัย</option>
                <option value="financial">การเงิน</option>
                <option value="others">อื่น ๆ</option>
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm flex items-center">
                  <HiExclamation className="w-4 h-4 mr-1" />
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700">
                ระดับความสำคัญ <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                {...register("priority")}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  watchedValues.priority ? getPriorityColor(watchedValues.priority) : 'border-gray-300'
                }`}
              >
                <option value="low"> ต่ำ</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">สูง</option>
                <option value="urgent">ด่วน</option>
              </select>
              {errors.priority && (
                <p className="text-red-600 text-sm flex items-center">
                  <HiExclamation className="w-4 h-4 mr-1" />
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
              หัวข้อ <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              {...register("subject")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="ระบุหัวข้อคำร้องเรียนของคุณ"
            />
            {errors.subject && (
              <p className="text-red-600 text-sm flex items-center">
                <HiExclamation className="w-4 h-4 mr-1" />
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              รายละเอียด <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="โปรดอธิบายรายละเอียดของปัญหาหรือคำร้องเรียนของคุณให้ชัดเจน..."
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {errors.description && (
                  <span className="text-red-600 flex items-center">
                    <HiExclamation className="w-4 h-4 mr-1" />
                    {errors.description.message}
                  </span>
                )}
              </span>
              <span>{watchedValues.description?.length || 0} ตัวอักษร</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              ไฟล์แนบ (ไม่จำเป็น)
            </label>
            
            <div
              className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                  <HiUpload className="w-6 h-6 text-gray-600" />
                </div>
                
                <div>
                  <p className="text-gray-700 font-medium mb-2">
                    ลากไฟล์มาวางที่นี่ หรือ
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <HiPaperClip className="w-4 h-4 mr-2" />
                    เลือกไฟล์
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>สามารถอัปโหลดได้สูงสุด 5 ไฟล์ (ขนาดสูงสุดต่อไฟล์ 10MB)</p>
                  <p>รูปแบบที่รองรับ: JPG, PNG, PDF, DOC, DOCX</p>
                </div>
              </div>
            </div>

            {/* File Errors */}
            {fileErrors.length > 0 && (
              <div className="space-y-2">
                {fileErrors.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm flex items-center">
                    <HiExclamation className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">ไฟล์ที่เลือก ({files.length}/5):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center min-w-0 flex-1">
                        {getFileTypeIcon(file.type)}
                        <div className="ml-3 min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-3 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="ลบไฟล์"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
            <div className="flex items-start">
              <HiInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">ประกาศความเป็นส่วนตัว</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  คำร้องเรียนของคุณจะถูกส่งโดยไม่ระบุตัวตน เราไม่เก็บที่อยู่ IP หรือข้อมูลส่วนบุคคลใดๆ 
                  ข้อมูลทั้งหมดจะถูกเข้ารหัสและปกป้องตามมาตรฐานสากล
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  กำลังส่งคำร้องเรียน...
                </>
              ) : (
                <>
                  <HiDocumentText className="w-5 h-5 mr-2" />
                  ส่งคำร้องเรียน
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
