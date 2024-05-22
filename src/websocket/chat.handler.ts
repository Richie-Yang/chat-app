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

    const now = new Date();
    const { fromId, toId, content, chatId } = data;
    console.log('chat.handler:registerChatHandler:content:', content);
    await chatService.sendMessage('requestId', chatId, {
      fromId,
      toId,
      content,
    });

    socket.emit(chatId, `${content} by ${user?.name || ''} at ${now}`);
    socket.broadcast.emit(
      chatId,
      `${content} by ${user?.name || ''} at ${now}`
    );
  };

  socket.on('chat message', _sendMessage);
}
