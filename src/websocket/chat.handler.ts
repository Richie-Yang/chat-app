import { Socket } from 'socket.io';
import { get } from 'lodash';
import { userSchema } from '../schemas';
import { SchemaType } from '../variables';

export { registerChatHandler };

function registerChatHandler(socket: Socket) {
  const _sendMessage = (msg: string) => {
    const request = socket.request;
    const user = get(
      request,
      'user',
      null
    ) as userSchema.User<SchemaType.OUTPUT> | null;

    const now = new Date();
    console.log('message: ' + msg);
    // chatRepository.create('requestId', { message: msg });
    socket.emit(
      'chat message',
      `${msg} by ${user?.name ?? 'unknown'} at ${now}`
    );
  };

  socket.on('chat message', _sendMessage);
}
