import { z } from 'zod';

export const createQuerySchema = z.object({
  employeeId: z.string().optional(),
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeEmail: z.string().email('Invalid email address format'),
  subject: z.string().min(2, 'Subject is required'),
  category: z.string().optional().default('General Inquiry'),
  priority: z.string().optional().default('Normal'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export const replyQuerySchema = z.object({
  replyText: z.string().min(1, 'Reply message cannot be empty'),
  repliedBy: z.string().optional().default('HR / Admin'),
});
