import { z } from 'zod';
import * as _ from 'lodash';

export const sessionModel = {
  key: z.string().describe('user name'),
  value: z.string().describe('user email'),
};

export const sessionModelZod = z.object(sessionModel).strict();
export type Session = z.infer<typeof sessionModelZod>;
