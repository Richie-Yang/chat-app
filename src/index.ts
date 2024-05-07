import * as Koa from 'koa';
import * as cors from '@koa/cors';
import * as Router from '@koa/router';
// import * as multer from '@koa/multer';
import * as logger from 'koa-logger';
import * as mount from 'koa-mount';
import * as path from 'path';
import * as http from 'http';
import send = require('koa-send');
import { parseBody, logRequest, validateToken } from './middlewares';
import { respondError, respondMessage } from './responses';
import { CONFIG } from './config';
import { Server } from 'socket.io';
import { chatRepository, firestore } from './firebase';

const app = new Koa({ proxy: false });
const router = new Router();
const server = http.createServer(app.callback());
const io = new Server(server, { connectionStateRecovery: {} });
firestore.init();
// const uploadFile = multer();

app.use(
  cors({
    origin: CONFIG.FRONTEND_DOMAIN,
  })
);
app.use(parseBody());
app.use(logger());
app.use(logRequest());

app.use(async (ctx: Koa.Context, next: Koa.Next) => {
  try {
    await next();
    return ctx;
  } catch (err) {
    return respondError(ctx, err);
  }
});

router.get('/test', validateToken, async (ctx: Koa.Context) =>
  respondMessage(ctx, 'ok')
);

router.get('/', async (ctx: Koa.Context) => {
  await send(ctx, ctx.path, {
    root: path.join(__dirname, '../public/index.html'),
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.broadcast.emit('hi');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    chatRepository.create('requestId', { message: msg });
    io.emit('chat message', msg);
  });
});

app.use(mount('/', router.routes()));

server.listen(CONFIG.PORT, () =>
  console.log(`Server running on port ${CONFIG.PORT}`)
);
