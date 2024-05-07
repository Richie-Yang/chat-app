import * as _ from 'lodash';
import { Context } from 'koa';

export { errorMessage, throwError, respondData, respondMessage, respondError };

function errorMessage(err: any) {
  return { detail: err };
}

function throwError(
  ctx: Context,
  status: number,
  err: any,
  customMessage?: string
) {
  if (customMessage) ctx.throw(status, customMessage, errorMessage(err));
  ctx.throw(status, errorMessage(err));
}

function respondData(ctx: Context, data: any) {
  ctx.status = 200;
  ctx.body = { status: ctx.status, data };
  return ctx;
}

function respondMessage(ctx: Context, message: string) {
  ctx.status = 200;
  ctx.body = { status: ctx.status, message };
  return ctx;
}

function respondError(ctx: Context, err: any) {
  console.log(err);
  ctx.status = err.status || 400;
  let errorResponse = { status: ctx.status, message: err.message || '' };

  if (_.isObject(err)) errorResponse = { ...errorResponse, ...err };
  else errorResponse.message = err;
  ctx.body = errorResponse;
  return ctx;
}
