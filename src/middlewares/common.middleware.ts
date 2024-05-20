import { Context, Next } from 'koa';
import * as koaBodyParser from 'koa-bodyparser';
import { CONFIG } from '../config';

export function parseBody(opts?: any) {
  const bp = koaBodyParser(opts);
  return async function (ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body || (ctx.req as any).body;
    return bp(ctx, next);
  };
}

export function logRequest() {
  return async function (ctx: Context, next: Next) {
    const { request } = ctx;
    console.log(`current env: ${CONFIG.NODE_ENV}`);
    console.log('source IP:', ctx.request.ip);
    console.log(`headers: ${JSON.stringify(request.headers)}`);
    console.log(`query: ${JSON.stringify(request.query)}`);
    console.log(`body: ${JSON.stringify(request.body)}`);
    return next();
  };
}
