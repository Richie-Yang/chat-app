import * as Router from '@koa/router';
import { Context } from 'koa';
import { respondData, respondMessage } from '../utils/responses.util';
import { userSchema } from '../schemas';
import { userService } from '../services';
import {
  validateSchema,
  validateToken,
} from '../middlewares/validate.middleware';

const router = new Router();

router.post(
  '/api/user/login',
  validateSchema(userSchema.login),
  async (ctx: Context) => {
    const data = ctx.request.body as userSchema.Login;
    const result = await userService.login(ctx.requestId, data);
    return respondData(ctx, result);
  }
);

router.post('/api/user/logout', validateToken, async (ctx: Context) => {
  const userId = ctx.user.id;
  await userService.logout(ctx.requestId, userId);
  return respondMessage(ctx, 'ok');
});

router.post(
  '/api/user',
  validateSchema(userSchema.signup),
  async (ctx: Context) => {
    const data = ctx.request.body as userSchema.Signup;
    const result = await userService.signup(ctx.requestId, data);
    return respondData(ctx, result);
  }
);

router.get('/api/user', validateToken, async (ctx: Context) => {
  const result = await userService.findAll(ctx.requestId);
  return respondData(ctx, result);
});

export default router.routes();
