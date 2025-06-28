import { z } from 'zod';


export const TimerSchema = z.object({
  company: z.enum(['VedaAI', 'CK', 'BrandSurge']),
  startTime: z.string().datetime({ offset: true }), // ISO8601 with timezone
  endTime: z.string().datetime({ offset: true }).optional(),
  duration: z.number().positive().optional(),
  isSubmitted: z.boolean().default(false),
});

// For expenses
export const ExpenseSchema = z.object({
  company: z.enum(['VedaAI', 'CK', 'BrandSurge']),
  amount: z.number().positive(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const UpdateExpenseSchema = ExpenseSchema.extend({
  id: z.number().positive()
});