import { Complaint } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';

interface ComplaintsTableProps {
  complaints: Complaint[];
  onDeleteClick: (id: string) => void;
  isLoading: boolean;
}

export function ComplaintsTable({ complaints, onDeleteClick, isLoading }: ComplaintsTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 bg-white rounded-lg overflow-hidden border">
        <div className="bg-gray-100 p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-t">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="col-span-2">
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="col-span-2">
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="col-span-2">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white p-8 text-center rounded-lg border">
        <div className="text-gray-500 mb-4">ไม่พบคำร้องเรียนที่ตรงกับเงื่อนไขที่กำหนด</div>
        <p className="text-sm text-gray-400">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technical: 'เทคนิค',
      environment: 'สภาพแวดล้อม',
      hr: 'ทรัพยากรบุคคล',
      equipment: 'อุปกรณ์',
      safety: 'ความปลอดภัย',
      financial: 'การเงิน',
      others: 'อื่นๆ'
    };
    return labels[category] || category;
  };
  
  const getPriorityBadge = (priority: string) => {
    const classes: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      low: 'ต่ำ',
      medium: 'ปานกลาง',
      high: 'สูง',
      urgent: 'ฉุกเฉิน'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[priority]}`}>
        {labels[priority]}
      </span>
    );
  };
  
  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      new: 'bg-purple-100 text-purple-800',
      received: 'bg-blue-100 text-blue-800',
      discussing: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    const labels: Record<string, string> = {
      new: 'ใหม่',
      received: 'รับเรื่องแล้ว',
      discussing: 'กำลังหารือ',
      processing: 'กำลังแก้ไข',
      resolved: 'แก้ไขเสร็จสิ้น',
      archived: 'เก็บถาวร'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border">
      <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 font-medium">
        <div className="col-span-6">รายละเอียด</div>
        <div className="col-span-2">ความสำคัญ</div>
        <div className="col-span-2">สถานะ</div>
        <div className="col-span-2 text-right">การดำเนินการ</div>
      </div>
      
      {complaints.map((complaint) => (
        <div key={complaint.id} className="grid grid-cols-12 gap-4 p-4 border-t">
          <div className="col-span-6">
            <Link href={`/dashboard/complaints/${complaint.id}`} className="hover:text-primary-700">
              <h3 className="font-medium">{complaint.subject}</h3>
            </Link>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="mr-3">{complaint.trackingNumber}</span>
              <span className="mr-3">•</span>
              <span>{getCategoryLabel(complaint.category)}</span>
              <span className="mr-3">•</span>
              <span>
                {formatDistanceToNow(new Date(complaint.createdAt), {
                  addSuffix: true,
                  locale: th,
                })}
              </span>
            </div>
          </div>
          
          <div className="col-span-2 flex items-center">
            {getPriorityBadge(complaint.priority)}
          </div>
          
          <div className="col-span-2 flex items-center">
            {getStatusBadge(complaint.status)}
          </div>
          
          <div className="col-span-2 flex items-center justify-end space-x-2">
            <Link
              href={`/dashboard/complaints/${complaint.id}`}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              ดูรายละเอียด
            </Link>
            <button
              onClick={() => onDeleteClick(complaint.id)}
              className="p-1 text-red-600 hover:text-red-800"
              title="ลบคำร้องเรียน"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
