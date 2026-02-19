import { z } from 'zod';

const analyzeSchema = z
  .object({
    mode: z.enum(['url', 'text']).default('url'),
    url: z.string().min(1).optional().nullable(),
    content: z.string().min(1).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.mode === 'url') {
        return data.url && data.url.trim().length > 0;
      }
      if (data.mode === 'text') {
        return data.content && data.content.trim().length > 0;
      }
      return false;
    },
    { message: 'URL or content is required' }
  );

export function validateAnalyzeBody(body) {
  const result = analyzeSchema.safeParse(body);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join('; ');
    const err = new Error(msg);
    err.statusCode = 400;
    throw err;
  }
  return result.data;
}
