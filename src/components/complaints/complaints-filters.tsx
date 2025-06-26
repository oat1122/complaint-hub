import { useEffect, useState } from 'react';
import { Category, Priority, Status } from '@/types';

interface FiltersProps {
  filters: {
    category?: Category | "";
    priority?: Priority | "";
    status?: Status | "";
    search?: string;
    fromDate?: string;
    toDate?: string;
  };
  onFiltersChange: (newFilters: any) => void;
}

export function ComplaintsFilters({ filters, onFiltersChange }: FiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Apply filters on change with some debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, localFilters.search !== filters.search ? 500 : 0);
    
    return () => clearTimeout(timer);
  }, [localFilters, filters.search, onFiltersChange]);
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFilters = () => {
    const resetValues = {
      category: "" as "",
      priority: "" as "",
      status: "" as "",
      search: "",
      fromDate: "",
      toDate: ""
    };
    setLocalFilters(resetValues);
    onFiltersChange(resetValues);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">ตัวกรองคำร้องเรียน</h2>
        <button 
          onClick={resetFilters}
          className="text-sm text-primary-600 hover:underline"
        >
          ล้างตัวกรอง
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium mb-1">ค้นหา</label>
          <input
            type="text"
            id="search"
            name="search"
            value={localFilters.search}
            onChange={handleChange}
            placeholder="ค้นหาหัวข้อหรือหมายเลขติดตาม"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">หมวดหมู่</label>
          <select
            id="category"
            name="category"
            value={localFilters.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">ทั้งหมด</option>
            <option value="technical">เทคนิค</option>
            <option value="environment">สภาพแวดล้อม</option>
            <option value="hr">ทรัพยากรบุคคล</option>
            <option value="equipment">อุปกรณ์</option>
            <option value="safety">ความปลอดภัย</option>
            <option value="financial">การเงิน</option>
            <option value="others">อื่นๆ</option>
          </select>
        </div>
        
        {/* Priority Filter */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1">ความสำคัญ</label>
          <select
            id="priority"
            name="priority"
            value={localFilters.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">ทั้งหมด</option>
            <option value="low">ต่ำ</option>
            <option value="medium">ปานกลาง</option>
            <option value="high">สูง</option>
            <option value="urgent">ฉุกเฉิน</option>
          </select>
        </div>
        
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">สถานะ</label>
          <select
            id="status"
            name="status"
            value={localFilters.status}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">ทั้งหมด</option>
            <option value="new">ใหม่</option>
            <option value="received">รับเรื่องแล้ว</option>
            <option value="discussing">กำลังหารือ</option>
            <option value="processing">กำลังแก้ไข</option>
            <option value="resolved">แก้ไขเสร็จสิ้น</option>
            <option value="archived">เก็บถาวร</option>
          </select>
        </div>
        
        {/* Date Filters */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium mb-1">จากวันที่</label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={localFilters.fromDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium mb-1">ถึงวันที่</label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={localFilters.toDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
