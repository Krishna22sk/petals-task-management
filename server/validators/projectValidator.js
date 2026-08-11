import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  code: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled']).optional().default('Active'),
  deadline: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  budgetHours: z.number().or(z.string().transform(val => Number(val))).optional().default(0),
  leadEmployeeId: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();
