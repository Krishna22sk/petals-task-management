import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address format'),
  role: z.string().optional().default('Employee'),
  designation: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional().default('123456'),
  avatar: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional().default('Active'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
