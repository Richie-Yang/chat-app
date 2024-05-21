import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as Schema from '../schemas/chat.schema';
import { DataModel, SchemaType } from '../variables';
import { firebaseRepository } from '.';
import { chatSchema } from '../schemas';
import { OrderWhereQuery } from './firebase.type';

export { create, initChat, addMessage, findAllMessages };

const MESSAGE_COLLECTION = 'messages';

async function create(requestId: string, data: Schema.Chat<SchemaType.INPUT>) {
  return firebaseRepository.create(DataModel.CHAT, data, {
    documentId: `CHAT-${uuid.v4()}`,
    requestId,
  });
}

async function initChat(
  requestId: string,
  chat: chatSchema.Chat<SchemaType.INPUT>,
  message: chatSchema.Message<SchemaType.INPUT>
) {
  const chatId = `CHAT-${uuid.v4()}`;
  const messageId = `MESSAGE-${uuid.v4()}`;
  const subCollection = {
    documentId: chatId,
    collection: MESSAGE_COLLECTION,
  };
  await firebaseRepository.create(DataModel.CHAT, chat, {
    requestId,
    documentId: chatId,
  });
  return firebaseRepository.create(DataModel.CHAT, message, {
    requestId,
    subCollection,
    documentId: messageId,
  });
}

async function addMessage(
  requestId: string,
  chatId: string,
  data: Schema.Message<SchemaType.INPUT>
) {
  const subCollection = {
    documentId: chatId,
    collection: MESSAGE_COLLECTION,
  };
  return firebaseRepository.create(DataModel.CHAT, data, {
    requestId,
    subCollection,
  });
}

async function findAllMessages(
  requestId: string,
  chatId: string,
  filter?: OrderWhereQuery
) {
  const subCollection = {
    documentId: chatId,
    collection: MESSAGE_COLLECTION,
  };
  return firebaseRepository.findAll(DataModel.CHAT, {
    requestId,
    filter,
    subCollection,
  }) as Promise<chatSchema.Message<SchemaType.OUTPUT>[]>;
}
