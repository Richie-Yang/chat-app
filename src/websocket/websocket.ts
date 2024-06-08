import { Server, Socket } from 'socket.io';
import { AnyObject } from '../types';
import { tokenService } from '../services';
import { registerChatHandler } from './chat.handler';

export { init };

function init(io: Server) {
  // io.engine.use(async (request: AnyObject, res: AnyObject, next: Next) => {
  //   const authToken = request.headers.authorization;
  //   console.log('authorization:', authToken);

  //   const user = await tokenService
  //     .validateToken('requestId', authToken)
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //   request.user = user;
  //   return next();
  // });

  io.use(async (socket, next) => {
    const authToken = socket.handshake.auth.token;
    console.log('authorization:', authToken);

    const user = await tokenService
      .validateToken('requestId', authToken)
      .catch((error) => {
        console.log(error);
      });

    (socket.request as AnyObject).user = user;
    return next();
  });

  const onConnection = (socket: Socket) => {
    console.log('a user connected');

    registerChatHandler(socket);
  };

  io.on('connection', onConnection);
}
