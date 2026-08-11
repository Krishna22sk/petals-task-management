import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  projectId: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  status: z.enum(['Pending', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled']).optional().default('Pending'),
  assigneeId: z.string().optional().nullable(),
  assigneeName: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  estimatedTime: z.number().or(z.string().transform(val => Number(val))).optional().default(0),
  actualTime: z.number().or(z.string().transform(val => Number(val))).optional().default(0),
  description: z.string().optional().nullable(),
  checklists: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    completed: z.boolean().optional().default(false)
  })).optional().default([])
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled']),
});

export const updateTaskPrioritySchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export const addCommentSchema = z.object({
  comment: z.string().min(1, 'Comment text cannot be empty'),
});
