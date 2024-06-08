import * as Router from '@koa/router';
// import { Context } from 'koa';
// import * as path from 'path';
// import send = require('koa-send');

const router = new Router();

// router.get('/:page', async (ctx: Context) => {
//   const rootPath = {
//     root: path.join(__dirname, `../../views`),
//   };
//   const pagePath = `${ctx.params.page}.html`;
//   return send(ctx, pagePath, rootPath);
// });

export default router.routes();
