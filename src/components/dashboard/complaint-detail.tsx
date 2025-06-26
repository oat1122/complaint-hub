'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Status, Priority, Complaint, Attachment } from '@/types';

interface ComplaintDetailProps {
  complaint: Complaint & {
    attachments?: Attachment[];
  };
  isAdmin?: boolean;
}

export default function ComplaintDetail({ complaint, isAdmin = false }: ComplaintDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>(complaint.status);
  const router = useRouter();
  const { data: session } = useSession();

  // Use isAdmin prop or derive from session
  const canEdit = isAdmin || session?.user?.role === "admin";

  // Status configuration
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'new':
        return {
          label: 'ใหม่',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: (
            <svg
              className="w-5 h-5 text-orange-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          )
        };
      case 'received':
        return {
          label: 'รับเรื่องแล้ว',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          icon: (
            <svg
              className="w-5 h-5 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          )
        };
      case 'discussing':
        return {
          label: 'กำลังพิจารณา',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: (
            <svg
              className="w-5 h-5 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )
        };
      case 'processing':
        return {
          label: 'กำลังดำเนินการ',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: (
            <svg
              className="w-5 h-5 text-yellow-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="6" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )
        };
      case 'resolved':
        return {
          label: 'แก้ไขแล้ว',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: (
            <svg
              className="w-5 h-5 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )
        };
      case 'archived':
        return {
          label: 'จัดเก็บแล้ว',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: (
            <svg
              className="w-5 h-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          )
        };
    }
  };

  // Priority configuration
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return { label: 'เร่งด่วนมาก', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'high':
        return { label: 'เร่งด่วน', color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'medium':
        return { label: 'ปกติ', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'low':
        return { label: 'ไม่เร่งด่วน', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  // Handle delete function
  const handleDelete = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคำร้องเรียนนี้? การกระทำนี้ไม่สามารถยกเลิกได้')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete complaint');
      }

      alert('ลบคำร้องเรียนเรียบร้อยแล้ว');
      router.push('/dashboard/complaints');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('เกิดข้อผิดพลาดในการลบคำร้องเรียน');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: Status) => {
    if (!canEdit) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setCurrentStatus(newStatus);
      alert('อัปเดตสถานะเรียบร้อยแล้ว');
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Status options for dropdown
  const statusOptions: { value: Status; label: string }[] = [
    { value: 'new', label: 'ใหม่' },
    { value: 'received', label: 'รับเรื่องแล้ว' },
    { value: 'discussing', label: 'กำลังพิจารณา' },
    { value: 'processing', label: 'กำลังดำเนินการ' },
    { value: 'resolved', label: 'แก้ไขแล้ว' },
    { value: 'archived', label: 'จัดเก็บแล้ว' },
  ];

  const statusConfig = getStatusConfig(currentStatus);
  const priorityConfig = getPriorityConfig(complaint.priority);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          รายละเอียดคำร้องเรียน
        </h2>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/complaints")}
            className="flex items-center gap-2 hover:bg-gray-100 transition-all"
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            กลับไปยังรายการ
          </Button>
          
          {canEdit && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="ลบคำร้องเรียน"
              aria-label="ลบคำร้องเรียน"
            >
              {isDeleting ? (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Complaint Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">{complaint.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>รหัส: {complaint.trackingNumber}</span>
              <span>วันที่แจ้ง: {new Date(complaint.createdAt).toLocaleDateString('th-TH')}</span>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Status Badge/Dropdown */}
            {canEdit ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">สถานะ:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value as Status)}
                  disabled={isUpdatingStatus}
                  className="border border-gray-300 rounded-md px-3 py-1 text-xs font-medium bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isUpdatingStatus && (
                  <svg className="w-4 h-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
            ) : (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            )}
            
            {/* Priority Badge */}
            <div className={`${priorityConfig.bgColor} rounded-full px-3 py-1`}>
              <span className={`text-xs font-medium ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">รายละเอียด</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">หมวดหมู่</h3>
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            {complaint.category}
          </span>
        </div>

        {/* Category */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">หมวดหมู่</h3>
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            {complaint.category}
          </span>
        </div>

        {/* Attachments */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">ไฟล์แนบ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {complaint.attachments.map((attachment) => (
                <div key={attachment.id} className="relative group">
                  {attachment.mimeType.startsWith('image/') ? (
                    <img
                      src={`/uploads/${attachment.fileName}`}
                      alt={attachment.originalName}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(`/uploads/${attachment.fileName}`, '_blank')}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                         onClick={() => window.open(`/uploads/${attachment.fileName}`, '_blank')}>
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <p className="text-xs text-gray-600 truncate max-w-full px-2">{attachment.originalName}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}