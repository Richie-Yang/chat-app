import * as Router from '@koa/router';
import { Context } from 'koa';
import { respondMessage } from '../utils/responses.util';

const router = new Router();

router.get('/api/test', async (ctx: Context) => respondMessage(ctx, 'ok'));

export default router.routes();
