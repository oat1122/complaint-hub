"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ComplaintsFilters } from './complaints-filters';
import { ComplaintsTable } from './complaints-table';
import { ComplaintsPagination } from './complaints-pagination';
import { Complaint, Category, Priority, Status, ComplaintFilters } from '@/types';
import { getCachedData } from '@/lib/cache/memory-cache';

export function ComplaintsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse search params for initial filter state
  const initialFilters: ComplaintFilters = {
    category: (searchParams.get('category') as Category) || undefined,
    priority: (searchParams.get('priority') as Priority) || undefined,
    status: (searchParams.get('status') as Status) || undefined,
    search: searchParams.get('search') || undefined,
    fromDate: searchParams.get('fromDate') || undefined,
    toDate: searchParams.get('toDate') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
  };
  
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load complaints based on current filters
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.priority) params.set('priority', filters.priority);
        if (filters.status) params.set('status', filters.status);
        if (filters.search) params.set('search', filters.search);
        if (filters.fromDate) params.set('fromDate', filters.fromDate);
        if (filters.toDate) params.set('toDate', filters.toDate);
        params.set('page', String(filters.page || 1));
        params.set('limit', String(filters.limit || 10));
        
        // Update URL with filters for sharing/bookmarking
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        
        // Fetch complaints with new filters
        const response = await fetch(`/api/complaints?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch complaints');
        }
        
        const data = await response.json();
        
        setComplaints(data.data || []);
        setPagination(data.meta?.pagination || {
          currentPage: 1,
          totalPages: 0,
          pageSize: 10,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false
        });
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching complaints');
        console.error('Error fetching complaints:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComplaints();
  }, [filters]);
  
  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<ComplaintFilters>) => {
    // Reset to page 1 when filters change
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Handle complaint deletion
  const handleDeleteComplaint = async (id: string) => {
    if (!window.confirm('คุณต้องการลบคำร้องเรียนนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete complaint');
      }
      
      // Refresh complaints list
      setFilters({ ...filters });
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the complaint');
      console.error('Error deleting complaint:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">รายการคำร้องเรียน</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <ComplaintsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      
      <ComplaintsTable
        complaints={complaints}
        onDeleteClick={handleDeleteComplaint}
        isLoading={isLoading}
      />
      
      <ComplaintsPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
