import { Socket } from 'socket.io';
import { get } from 'lodash';
import { chatSchema, userSchema } from '../schemas';
import { SchemaType } from '../variables';
import { chatService } from '../services';

export { registerChatHandler };

function registerChatHandler(socket: Socket) {
  const _sendMessage = async (data: chatSchema.Send & { chatId: string }) => {
    const request = socket.request;
    const user = get(
      request,
      'user',
      null
    ) as userSchema.User<SchemaType.OUTPUT> | null;

    const now = Math.round(Date.now() / 1000);
    const { fromId, toId, content, chatId } = data;
    console.log('chat.handler:registerChatHandler:content:', content);
    await chatService.sendMessage('requestId', chatId, {
      fromId,
      toId,
      content,
    });

    const messageData = {
      from: user,
      content,
      createdAt: now,
    };
    socket.emit(chatId, messageData);
    socket.broadcast.emit(chatId, messageData);
  };

  socket.on('chat message', _sendMessage);
}
