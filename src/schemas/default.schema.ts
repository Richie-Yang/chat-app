import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const baseModel = {
  id: z.string().describe('document id'),
  createdAt: z.number().describe('create time (timestamp)'),
  updatedAt: z.number().describe('update time (timestamp)'),
};

const _base = z.object(baseModel).strict();

export type Base = z.infer<typeof _base>;
export const base = zodToJsonSchema(_base);
