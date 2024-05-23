import * as Router from '@koa/router';
import { Context } from 'koa';
import { respondData } from '../utils/responses.util';
import { chatSchema } from '../schemas';
import { chatService } from '../services';
import {
  validateSchema,
  validateToken,
} from '../middlewares/validate.middleware';
import { OrderWhereQuery } from '../repositories/firebase.type';

const router = new Router();

router.post(
  '/api/chat',
  validateToken,
  validateSchema(chatSchema.send),
  async (ctx: Context) => {
    const message = ctx.request.body as chatSchema.Send;
    const result = await chatService.getCreateChat(ctx.requestId, message);
    return respondData(ctx, result);
  }
);

router.get(
  '/api/chat/:chatId/messages',
  validateToken,
  async (ctx: Context) => {
    const chatId = ctx.params.chatId;
    let filter = ctx.query.filter as string;

    let result = [];
    if (filter) {
      const parsedFilter = JSON.parse(filter) as OrderWhereQuery;
      result = await chatService.getMessages(
        ctx.requestId,
        chatId,
        parsedFilter
      );
    } else {
      result = await chatService.getMessages(ctx.requestId, chatId);
    }
    return respondData(ctx, result);
  }
);

export default router.routes();
