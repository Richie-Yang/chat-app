import { Context, Next } from 'koa';
import * as koaBodyParser from 'koa-bodyparser';
import { CONFIG } from './config';
import { throwError } from './responses';
import { NodeEnv } from './variables';

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

export function validateToken(ctx: Context, next: Next) {
  if (CONFIG.NODE_ENV === NodeEnv.LOCAL) return next();
  const token = ctx.request.header['authorization'] as string | undefined;
  if (!token) throwError(ctx, 403, 'no token provided');
  const configToken = `Bearer ${CONFIG.AUTH_TOKEN}`;
  if (token !== configToken) throwError(ctx, 403, 'invalid token');
  return next();
}
