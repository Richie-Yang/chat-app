import * as Router from '@koa/router';
import { Context } from 'koa';
import {
  respondData,
  respondMessage,
  throwError,
} from '../utils/responses.util';
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
    const user = await userService
      .validateLogin(ctx.requestId, data)
      .catch((err) => throwError(ctx, 401, err));

    let result = null;
    if (user) result = await userService.generateToken(ctx.requestId, user);
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
    const result = await userService.create(ctx.requestId, data);
    return respondData(ctx, result);
  }
);

router.get('/api/user', validateToken, async (ctx: Context) => {
  const filter = ctx.query.filter as string;

  let result = [];
  if (filter) {
    const parsedFilter = JSON.parse(filter);
    result = await userService.findAll(ctx.requestId, parsedFilter);
  } else {
    result = await userService.findAll(ctx.requestId);
  }

  return respondData(ctx, result);
});

export default router.routes();
