import { z } from 'zod';
import * as _ from 'lodash';
import { Base } from './default.schema';
import { SchemaType } from '../variables';

export const chatModel = {
  message: z.string().describe('chat message'),
};

export const chatModelZod = z.object(chatModel).strict();

export type Chat<M extends SchemaType> = M extends SchemaType.INPUT
  ? z.infer<typeof chatModelZod>
  : z.infer<typeof chatModelZod> & Base;
