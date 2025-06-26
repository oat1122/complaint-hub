import { useEffect, useState } from 'react';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ComplaintsPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function ComplaintsPagination({ pagination, onPageChange }: ComplaintsPaginationProps) {
  const [pages, setPages] = useState<number[]>([]);
  
  useEffect(() => {
    // Calculate pages to show
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > pagination.totalPages) {
      endPage = pagination.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const newPages = [];
    for (let i = startPage; i <= endPage; i++) {
      newPages.push(i);
    }
    
    setPages(newPages);
  }, [pagination.currentPage, pagination.totalPages]);
  
  if (pagination.totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }
  
  const renderPageNumbers = () => {
    return pages.map(page => (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`px-3 py-1 rounded-md ${
          page === pagination.currentPage
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        disabled={page === pagination.currentPage}
      >
        {page}
      </button>
    ));
  };
  
  return (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg border">
      <div className="text-sm text-gray-600">
        แสดง {(pagination.currentPage - 1) * pagination.pageSize + 1} ถึง{' '}
        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} จากทั้งหมด{' '}
        {pagination.totalItems} รายการ
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={!pagination.hasPreviousPage}
          className="px-2 py-1 bg-white text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          «
        </button>
        
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="px-2 py-1 bg-white text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        
        {renderPageNumbers()}
        
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-2 py-1 bg-white text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ›
        </button>
        
        <button
          onClick={() => onPageChange(pagination.totalPages)}
          disabled={!pagination.hasNextPage}
          className="px-2 py-1 bg-white text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          »
        </button>
      </div>
    </div>
  );
}
