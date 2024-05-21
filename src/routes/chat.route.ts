import * as Router from '@koa/router';
import { Context } from 'koa';
import { respondData } from '../utils/responses.util';
import { chatSchema } from '../schemas';
import { chatService, userService } from '../services';
import {
  validateSchema,
  validateToken,
} from '../middlewares/validate.middleware';

const router = new Router();

router.post(
  '/api/chat',
  validateToken,
  validateSchema(chatSchema.init),
  async (ctx: Context) => {
    const { chat, message } = ctx.request.body as chatSchema.Init;
    const result = await chatService.create(ctx.requestId, chat, message);
    return respondData(ctx, result);
  }
);

router.get('/api/chat/message', async (ctx: Context) => {
  const result = await userService.findAll(ctx.requestId);
  return respondData(ctx, result);
});

export default router.routes();
