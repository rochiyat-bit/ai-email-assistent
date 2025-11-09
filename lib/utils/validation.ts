import { z } from 'zod';

export const emailQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  category: z
    .enum(['all', 'important', 'transactional', 'promotional'])
    .default('all'),
  search: z.string().max(200).optional(),
  is_read: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  is_starred: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  sender: z.string().email().optional(),
});

export const updateCategorySchema = z.object({
  category: z.enum(['important', 'transactional', 'promotional']),
});

export const markReadSchema = z.object({
  is_read: z.boolean(),
});

export const markStarredSchema = z.object({
  is_starred: z.boolean(),
});

export const updatePreferencesSchema = z.object({
  notification_preferences: z
    .object({
      important: z.boolean().optional(),
      transactional: z.boolean().optional(),
      promotional: z.boolean().optional(),
      digest_times: z
        .array(z.string().regex(/^\d{2}:\d{2}$/))
        .max(4)
        .optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  language: z.enum(['en', 'id']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const aiSummarizeSchema = z.object({
  email_ids: z.array(z.string()).min(1).max(10).optional(),
  thread_id: z.string().optional(),
  max_length: z.number().min(50).max(200).default(100).optional(),
});

export const aiReplySchema = z.object({
  email_id: z.string(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal']).default('professional'),
  language: z.string().default('en'),
  custom_instructions: z.string().max(500).optional(),
});

export const syncEmailsSchema = z.object({
  sync_type: z.enum(['full', 'incremental']),
  force: z.boolean().default(false),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  category: z.enum(['important', 'transactional', 'promotional']).optional(),
  sender: z.string().email().optional(),
  has_attachments: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  is_read: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  is_starred: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type EmailQueryInput = z.infer<typeof emailQuerySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type AISummarizeInput = z.infer<typeof aiSummarizeSchema>;
export type AIReplyInput = z.infer<typeof aiReplySchema>;
export type SyncEmailsInput = z.infer<typeof syncEmailsSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
