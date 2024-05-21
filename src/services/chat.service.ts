import { Server, Socket } from 'socket.io';
import { chatRepository } from '../firebase';
import { AnyObject } from '../types';
import { Next } from 'koa';
import { tokenService } from '.';
import { get } from 'lodash';
import { userSchema } from '../schemas';
import { SchemaType } from '../variables';

export { init };

function init(io: Server) {
  io.engine.use(async (request: AnyObject, res: AnyObject, next: Next) => {
    const authToken = request.headers.authorization;
    console.log('authorization:', authToken);

    const user = await tokenService
      .validateToken('requestId', authToken)
      .catch((error) => {
        console.log(error);
      });

    request.user = user;
    return next();
  });

  io.on('connection', (socket) => {
    const request = socket.request;
    const user = get(request, 'user', null);
    console.log('a user connected');
    socket.broadcast.emit('hi');

    sendMessage(socket, user);

    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });
  });
}

function sendMessage(
  socket: Socket,
  user: userSchema.User<SchemaType.OUTPUT> | null
) {
  socket.on('chat message', (msg) => {
    const now = new Date();
    console.log('message: ' + msg);
    chatRepository.create('requestId', { message: msg });
    socket.emit(
      'chat message',
      `${msg} by ${user?.name ?? 'unknown'} at ${now}`
    );
  });
}
