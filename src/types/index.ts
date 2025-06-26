// Basic types mapped from Prisma schema
export type Category = 
  | 'technical' 
  | 'environment' 
  | 'hr' 
  | 'equipment' 
  | 'safety' 
  | 'financial' 
  | 'others';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Status = 
  | 'new' 
  | 'received' 
  | 'discussing' 
  | 'processing' 
  | 'resolved' 
  | 'archived';

export type Role = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
  createdAt: Date;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  category: Category;
  priority: Priority;
  subject: string;
  description: string;
  status: Status;
  createdAt: Date;
  attachments?: Attachment[];
  userNotifications?: UserNotification[];
  user?: User; // Add user field for complaint detail page
}

export interface Attachment {
  id: string;
  complaintId: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedAt: Date;
}

export interface UserNotification {
  id: string;
  userId: string;
  complaintId: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  complaint?: Complaint;
  user?: User;
}

export interface Settings {
  id: string;
  itemsPerPage: number;
  autoArchiveDays: number;
  enableAutoArchive: boolean;
  lastUpdated: Date;
}

// Request/Response Types
export interface ComplaintFormValues {
  category: Category;
  priority: Priority;
  subject: string;
  description: string;
}

export interface ComplaintFilters {
  category?: Category;
  priority?: Priority;
  status?: Status;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface NotificationItem {
  id: string;
  complaintId?: string;
  subject: string;
  trackingNumber: string;
  priority: Priority;
  createdAt: string;
  isRead: boolean;
}
