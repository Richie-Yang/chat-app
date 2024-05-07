import { z } from 'zod';
import * as _ from 'lodash';
import { Base } from './default.schema';
import { SchemaType } from '../variables';

export const _chatModel = {
  message: z.string().describe('chat message'),
};

export const chatModelZod = z.object(_chatModel).strict();

export type Chat<M extends SchemaType> = M extends SchemaType.INPUT
  ? z.infer<typeof chatModelZod>
  : z.infer<typeof chatModelZod> & Base;
