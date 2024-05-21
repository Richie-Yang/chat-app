import { chatRepository } from '../repositories';
import { chatSchema } from '../schemas';
import { SchemaType } from '../variables';

export { create };

async function create(
  requestId: string,
  chat: chatSchema.Chat<SchemaType.INPUT>,
  message: chatSchema.Message<SchemaType.INPUT>
) {
  return chatRepository.initChat(requestId, chat, message);
}
