import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        code: error.code,
        details: error.details 
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors 
      },
      { status: 400 }
    );
  }
  
  // Default error response
  return NextResponse.json(
    { 
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}
