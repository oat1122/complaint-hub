"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

// Define the form schema
const complaintSchema = z.object({
  category: z.enum(
    [
      "technical",
      "environment",
      "hr",
      "equipment",
      "safety",
      "financial",
      "others",
    ],
    {
      required_error: "กรุณาเลือกหมวดหมู่",
    }
  ),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: undefined,
      priority: "medium",
      subject: "",
      description: "",
    },
  });

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
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check if total files would exceed 5
    if (files.length + selectedFiles.length > 5) {
      newErrors.push("Maximum 5 files allowed");
      setFileErrors(newErrors);
      return;
    }

    // Validate each file
    selectedFiles.forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        newErrors.push(`File ${file.name} has an unsupported format`);
      } else if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`File ${file.name} exceeds the 10MB size limit`);
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

  const onSubmit = async (data: ComplaintFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // First, submit the complaint data
      const complaintResponse = await fetch("/api/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!complaintResponse.ok) {
        throw new Error("Failed to submit complaint");
      }

      const complaintResult = await complaintResponse.json();
      const { trackingNumber, id: complaintId } = complaintResult;

      // Then, if there are files, upload them
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
          throw new Error("Failed to upload files");
        }
      }

      // Success - show tracking number
      setTrackingNumber(trackingNumber);
      reset();
      setFiles([]);
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (trackingNumber) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-green-800 mb-4">
          ส่งคำร้องเรียนสำเร็จแล้ว
        </h3>
        <p className="mb-3">
          ขอบคุณสำหรับการส่งคำร้องเรียน
          คำร้องของท่านถูกบันทึกโดยไม่ระบุตัวตนเรียบร้อยแล้ว
        </p>
        <div className="bg-white p-4 rounded border border-green-300 mb-4">
          <p className="font-medium text-gray-700">หมายเลขติดตามของคุณ:</p>
          <p className="text-2xl font-bold text-primary-600">
            {trackingNumber}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            กรุณาบันทึกหมายเลขติดตามนี้เพื่อตรวจสอบสถานะคำร้องเรียนของคุณในภายหลัง
          </p>
        </div>{" "}
        <Button
          onClick={() => {
            setTrackingNumber(null);
            reset();
          }}
          variant="secondary"
          className="mt-4 bg-black text-white hover:bg-gray-800"
        >
          ส่งคำร้องเรียนอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {" "}
      <h2 className="text-2xl font-semibold mb-6">
        ส่งคำร้องเรียนโดยไม่ระบุตัวตน
      </h2>
      {submitError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {submitError === "Failed to submit complaint"
            ? "ไม่สามารถส่งคำร้องเรียนได้"
            : submitError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          {/* Category Select */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              หมวดหมู่คำร้องเรียน *
            </label>
            <select
              id="category"
              {...register("category")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <p className="text-red-600 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>{" "}
          {/* Priority Select */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ระดับความสำคัญ *
            </label>
            <select
              id="priority"
              {...register("priority")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">ต่ำ</option>
              <option value="medium">ปานกลาง</option>
              <option value="high">สูง</option>
              <option value="urgent">เร่งด่วน</option>
            </select>
            {errors.priority && (
              <p className="text-red-600 text-sm mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>{" "}
        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            หัวข้อ *
          </label>
          <input
            id="subject"
            type="text"
            {...register("subject")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="คำอธิบายโดยย่อของปัญหา"
          />
          {errors.subject && (
            <p className="text-red-600 text-sm mt-1">
              {errors.subject.message}
            </p>
          )}
        </div>{" "}
        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            รายละเอียด *
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-32"
            placeholder="ให้ข้อมูลโดยละเอียดเกี่ยวกับคำร้องเรียนของคุณ"
            rows={5}
          ></textarea>
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>{" "}
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ไฟล์แนบ (ไม่จำเป็น)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center">
              <p className="mb-2 text-sm text-gray-500">
                อัปโหลดได้สูงสุด 5 ไฟล์ (ขนาดสูงสุดต่อไฟล์ 10MB)
              </p>
              <p className="text-xs text-gray-500 mb-4">
                รูปแบบที่รองรับ: JPG, PNG, PDF, DOC, DOCX
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </div>{" "}
            {/* File Errors */}
            {fileErrors.length > 0 && (
              <div className="mt-3">
                {fileErrors.map((error, index) => {
                  let thaiError = error;
                  if (error.includes("Maximum 5 files allowed")) {
                    thaiError = "อัปโหลดได้สูงสุด 5 ไฟล์";
                  } else if (error.includes("unsupported format")) {
                    thaiError = `ไฟล์ ${
                      error.split(" ")[1]
                    } มีรูปแบบที่ไม่รองรับ`;
                  } else if (error.includes("exceeds the 10MB size limit")) {
                    thaiError = `ไฟล์ ${error.split(" ")[1]} มีขนาดเกิน 10MB`;
                  }
                  return (
                    <p key={index} className="text-red-600 text-xs">
                      {thaiError}
                    </p>
                  );
                })}
              </div>
            )}
            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">ไฟล์ที่เลือก:</h4>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <span className="text-sm truncate max-w-xs">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ลบ
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Privacy Notice */}
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">ประกาศความเป็นส่วนตัว:</p>
          <p>
            คำร้องเรียนของคุณจะถูกส่งโดยไม่ระบุตัวตน เราไม่เก็บที่อยู่ IP ของคุณ
            หรือข้อมูลส่วนบุคคลใด ๆ
          </p>
        </div>{" "}
        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full py-3 bg-black text-white hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งคำร้องเรียน"}
          </Button>
        </div>
      </form>
    </div>
  );
}
