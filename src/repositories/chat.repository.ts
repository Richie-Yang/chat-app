import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as Schema from '../schemas/chat.schema';
import { DataModel, SchemaType } from '../variables';
import { firebaseRepository } from '.';
import { chatSchema } from '../schemas';
import {
  ConditionalOrderWhereQuery,
  FindAllResponse,
  FindOneResponse,
  OrderWhereQueryWithLimit,
} from './firebase.type';

export {
  create,
  findById,
  findOne,
  findAll,
  initChat,
  addMessage,
  findAllMessages,
};

const MESSAGE_COLLECTION = 'messages';

async function create(requestId: string, data: Schema.Chat<SchemaType.INPUT>) {
  return firebaseRepository.create(DataModel.CHAT, data, {
    documentId: `CHAT-${uuid.v4()}`,
    requestId,
  });
}

async function findById(
  requestId: string,
  id: string
): Promise<chatSchema.Chat<SchemaType.OUTPUT> | null> {
  const result = await firebaseRepository.findById(DataModel.CHAT, id, {
    requestId,
  });
  if (!result.data) return null;
  return result.data as chatSchema.Chat<SchemaType.OUTPUT>;
}

async function findOne(requestId: string, filter?: ConditionalOrderWhereQuery) {
  return firebaseRepository.conditionalFindOne(DataModel.CHAT, {
    filter,
    requestId,
  }) as Promise<FindOneResponse<chatSchema.Chat<SchemaType.OUTPUT>>>;
}

async function findAll(requestId: string, filter?: ConditionalOrderWhereQuery) {
  return firebaseRepository.conditionalFindAll(DataModel.CHAT, {
    filter,
    requestId,
  }) as Promise<FindAllResponse<chatSchema.Chat<SchemaType.OUTPUT>>>;
}

async function initChat(
  requestId: string,
  chat: chatSchema.Chat<SchemaType.INPUT>,
  message: chatSchema.Message<SchemaType.INPUT>
) {
  const chatId = `CHAT-${uuid.v4()}`;
  const messageId = Date.now().toString();
  const subCollection = {
    documentId: chatId,
    collection: MESSAGE_COLLECTION,
  };
  const createChat = await firebaseRepository.create(DataModel.CHAT, chat, {
    requestId,
    documentId: chatId,
  });
  await firebaseRepository.create(DataModel.CHAT, message, {
    requestId,
    subCollection,
    documentId: messageId,
  });
  return createChat;
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
    documentId: Date.now().toString(),
  });
}

async function findAllMessages(
  requestId: string,
  chatId: string,
  filter?: OrderWhereQueryWithLimit
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
