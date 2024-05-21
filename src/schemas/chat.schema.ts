import { z } from 'zod';
import * as _ from 'lodash';
import { Base } from './default.schema';
import { SchemaType } from '../variables';
import zodToJsonSchema from 'zod-to-json-schema';

export const profileModel = {
  id: z.string().describe('user id'),
  name: z.string().describe('user name'),
  email: z.string().describe('user email'),
};

export const messageModel = {
  from: z.object(profileModel).describe('from user'),
  to: z.object(profileModel).describe('to user'),
  message: z.string().describe('chat message'),
};

export const chatModel = {
  userIds: z.array(z.string()).describe('user ids'),
};

export const initModel = {
  chat: z.object(chatModel).describe('chat'),
  message: z.object(messageModel).describe('message'),
};

export const chatModelZod = z.object(chatModel).strict();
export const messageModelZod = z.object(messageModel).strict();
export const profileModelZod = z.object(profileModel).strict();
export const initModelZod = z.object(initModel).strict();

export type Chat<M extends SchemaType> = M extends SchemaType.INPUT
  ? z.infer<typeof chatModelZod>
  : z.infer<typeof chatModelZod> & Base;
export type Message<M extends SchemaType> = M extends SchemaType.INPUT
  ? z.infer<typeof messageModelZod>
  : z.infer<typeof messageModelZod> & Base;
export type Profile<M extends SchemaType> = M extends SchemaType.INPUT
  ? z.infer<typeof profileModelZod>
  : z.infer<typeof profileModelZod> & Base;
export type Init = z.infer<typeof initModelZod>;

export const init = zodToJsonSchema(initModelZod);
