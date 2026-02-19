import { z } from 'zod';

const analyzeSchema = z
  .object({
    mode: z.enum(['url', 'text']),
    url: z.string().url().optional(),
    content: z.string().max(500 * 1024).optional(),
  })
  .refine((data) => (data.mode === 'url' ? !!data.url : !!data.content), {
    message: 'url required for URL mode, content for text mode',
  });

export function validateAnalyzeBody(body) {
  const result = analyzeSchema.safeParse(body);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join('; ');
    throw new Error(msg);
  }
  return result.data;
}
