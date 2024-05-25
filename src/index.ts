import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as http from 'http';
import * as routes from './routes';
import * as serve from 'koa-static';
import * as path from 'path';

import { parseBody, logRequest } from './middlewares/common.middleware';
import { respondError } from './utils/responses.util';
import { CONFIG } from './config';
import { firestore } from './repositories';
import { get } from 'lodash';
import { Server } from 'socket.io';
import { websocket } from './websocket';
import mount = require('koa-mount');

const app = new Koa({ proxy: false });
const server = http.createServer(app.callback());
const io = new Server(server, { connectionStateRecovery: {} });
firestore.init();
websocket.init(io);

const staticDirPath = path.join(__dirname, '../public');
app.use(mount('/public', serve(staticDirPath)));
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

for (const route in routes) {
  const routeModule = get(routes, route) as Koa.Middleware;
  app.use(routeModule);
  console.log(`routeModule ${route} is bind`);
}

server.listen(CONFIG.PORT, () =>
  console.log(`Server running on port ${CONFIG.PORT}`)
);
