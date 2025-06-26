import { z } from 'zod';

// This function sanitizes strings to prevent XSS
export const sanitizeInput = (input: string): string => {
  // Basic sanitization - remove script and other potentially harmful tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ''); // Remove all HTML tags
};

// Schema for complaint creation and updates
export const complaintSchema = z.object({
  category: z.enum([
    "technical", "environment", "hr", 
    "equipment", "safety", "financial", "others"
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  subject: z.string()
    .min(3, "หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(255, "หัวข้อต้องไม่เกิน 255 ตัวอักษร")
    .transform(sanitizeInput),
  description: z.string()
    .min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(5000, "รายละเอียดต้องไม่เกิน 5000 ตัวอักษร")
    .transform(sanitizeInput)
});

// Schema for user credentials validation
export const userLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

// Schema for complaint status updates
export const complaintStatusSchema = z.object({
  status: z.enum(["new", "received", "discussing", "processing", "resolved", "archived"])
});

// Schema for pagination parameters
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

// Schema for complaint filters
export const complaintFilterSchema = z.object({
  category: z.enum(["technical", "environment", "hr", "equipment", "safety", "financial", "others"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["new", "received", "discussing", "processing", "resolved", "archived"]).optional(),
  search: z.string().optional().transform(value => value ? sanitizeInput(value) : undefined),
  fromDate: z.string().optional().refine(
    value => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    { message: "Invalid date format, use YYYY-MM-DD" }
  ),
  toDate: z.string().optional().refine(
    value => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    { message: "Invalid date format, use YYYY-MM-DD" }
  )
});
