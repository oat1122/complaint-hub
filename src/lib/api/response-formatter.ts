export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    version: string;
  };
}

export function createSuccessResponse<T>(
  data: T, 
  meta?: Partial<Omit<ApiResponse['meta'], 'timestamp' | 'version'>>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...meta
    }
  };
}

export function createErrorResponse(
  message: string,
  code?: string,
  details?: any,
  statusCode: number = 500
): ApiResponse {
  return {
    success: false,
    error: { message, code, details },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta
): ApiResponse<T[]> {
  return createSuccessResponse(data, { pagination });
}
