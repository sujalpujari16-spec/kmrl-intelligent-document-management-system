import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ==========================================
// ZOD ENTERPRISE VALIDATION SCHEMAS
// ==========================================

export const LoginSchema = z.object({
  email: z.string().min(1, 'Employee ID or Email is required').max(100),
  password: z.string().min(1, 'Password is required').max(100),
  turnstileToken: z.string().optional(),
});

export const AdminUserInviteSchema = z.object({
  name: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Invalid official email address').max(150),
  role: z.enum(['Admin', 'HR', 'Employee']).default('Employee'),
  department: z.string().min(2, 'Department is required').max(100),
  avatar: z.string().optional(),
});

export const DocumentUploadMetadataSchema = z.object({
  title: z.string().min(2, 'Document title is required').max(250),
  category: z.enum([
    'Leave Policies',
    'HR Circulars',
    'Attendance & Shifts',
    'Procurement & Tenders',
    'Metro Operations',
    'General Policies',
  ]),
});

export const ApprovalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(500).optional(),
});

export const LeaveApplicationSchema = z.object({
  leaveType: z.enum([
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'Maternity Leave',
    'Paternity Leave',
  ]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  reason: z.string().min(3, 'Please provide a clear reason for leave').max(500),
  medicalCertificateUrl: z.string().optional(),
});

export const LeaveActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(500).optional(),
});

export const ChatQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(1000),
});

export const SearchQuerySchema = z.object({
  query: z.string().max(300).optional().default(''),
  category: z.string().optional().default('All'),
  mode: z.enum(['semantic', 'keyword']).optional().default('semantic'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().optional(),
});

// ==========================================
// VALIDATION MIDDLEWARE HELPERS
// ==========================================

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as any).issues || [];
      const errorMsg = issues.map((e: any) => e.message || 'Invalid input').join(', ');
      return res.status(400).json({
        error: 'Validation Error',
        message: errorMsg,
        details: issues,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = (result.error as any).issues || [];
      const errorMsg = issues.map((e: any) => e.message || 'Invalid query parameter').join(', ');
      return res.status(400).json({
        error: 'Query Parameter Validation Error',
        message: errorMsg,
        details: issues,
      });
    }
    req.query = result.data as any;
    next();
  };
}
