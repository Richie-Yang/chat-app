import { difference, pick } from 'lodash';
import { chatRepository } from '../repositories';
import {
  OrderOperator,
  WhereOperator,
} from '../repositories/firebase.variable';
import { chatSchema } from '../schemas';
import { SchemaType } from '../variables';
import { sessionService, userService } from '.';
import { OrderWhereQueryWithLimit } from '../repositories/firebase.type';

export { getCreateChat, sendMessage, getChatUsers, getMessages };

async function getCreateChat(requestId: string, message: chatSchema.Send) {
  const { from, to, users } = await getChatUsers(
    requestId,
    message.fromId,
    message.toId
  );
  const userIds = [from.id, to.id];

  const where = {
    and: [
      {
        fieldKey: 'userIds',
        operator: WhereOperator['array-contains-any'],
        fieldValue: userIds,
      },
    ],
  };
  const foundChats = await chatRepository.findAll(requestId, { where });
  console.log('chatService:getCreate:foundChats:', foundChats);
  console.log('chatService:getCreate:userIds:', userIds);

  let finalChat: chatSchema.Chat<SchemaType.OUTPUT> | null =
    foundChats.find(
      (chatItem) => difference(chatItem.userIds, userIds).length === 0
    ) || null;

  if (!finalChat) {
    const initMessage: chatSchema.Message<SchemaType.INPUT> = {
      from: pick(from, ['id', 'name']),
      to: pick(to, ['id', 'name']),
      content: message.content,
    };
    console.log('chatService:getCreate:initMessage:', initMessage);
    const chat = { userIds };
    const createChat = await chatRepository.initChat(
      requestId,
      chat,
      initMessage
    );
    finalChat = await chatRepository.findById(requestId, createChat.id);
  }
  if (!finalChat) throw new Error('Failed to create chat');

  const CHAT_USER_KEY = sessionService.SESSION_KEYS.CHAT_USERS(finalChat.id);
  sessionService.set(CHAT_USER_KEY, users);
  return finalChat;
}

async function sendMessage(
  requestId: string,
  chatId: string,
  message: chatSchema.Send
) {
  const { from, to } = await getChatUsers(
    requestId,
    message.fromId,
    message.toId
  );
  const sendMessage: chatSchema.Message<SchemaType.INPUT> = {
    from: pick(from, ['id', 'name']),
    to: pick(to, ['id', 'name']),
    content: message.content,
  };
  return chatRepository.addMessage(requestId, chatId, sendMessage);
}

async function getChatUsers(requestId: string, fromId: string, toId: string) {
  const userIds = [fromId, toId].filter((userId) => userId);
  if (!userIds || userIds.length < 2) throw new Error('Invalid chat');

  const userPromises = userIds.map((userId) =>
    userService.findById(requestId, userId)
  );
  const users = await Promise.all(userPromises);
  if (!users || users.length < 2) throw new Error('Invalid users');
  // console.log('chatService:getChatUsers:users:', users);

  const from = users.find((user) => user.id === fromId);
  const to = users.find((user) => user.id === toId);

  // console.log('chatService:getChatUsers:from:', from);
  // console.log('chatService:getChatUsers:to:', to);
  return { from, to, users };
}

async function getMessages(
  requestId: string,
  chatId: string,
  filter?: OrderWhereQueryWithLimit
) {
  const defaultFilter: OrderWhereQueryWithLimit = {
    order: {
      fieldKey: 'createdAt',
      fieldValue: OrderOperator.asc,
    },
  };
  filter = { ...defaultFilter, ...filter };

  const messages = await chatRepository.findAllMessages(
    requestId,
    chatId,
    filter
  );
  console.log('chatService:getMessages:messages:', messages);
  return messages;
}
