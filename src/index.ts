import * as Koa from 'koa';
import * as cors from '@koa/cors';
import * as logger from 'koa-logger';
import * as http from 'http';
import * as routes from './routes';

import { parseBody, logRequest } from './middlewares/common.middleware';
import { respondError } from './utils/responses.util';
import { CONFIG } from './config';
import { firestore } from './firebase';
import { get } from 'lodash';
import { Server } from 'socket.io';
import { chatService } from './services';

const app = new Koa({ proxy: false });
const server = http.createServer(app.callback());
const io = new Server(server, { connectionStateRecovery: {} });
firestore.init();
chatService.init(io);

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

for (const route in routes) {
  const routeModule = get(routes, route) as Koa.Middleware;
  app.use(routeModule);
  console.log(`routeModule ${route} is bind`);
}

server.listen(CONFIG.PORT, () =>
  console.log(`Server running on port ${CONFIG.PORT}`)
);
