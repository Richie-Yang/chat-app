import Ajv from 'ajv';
import { Context, Next } from 'koa';
import { throwError } from '../utils/responses.util';
import { tokenService } from '../services';

const ajv = new Ajv();
const ERROR_STATUS = 422;

export async function validateToken(ctx: Context, next: Next) {
  const authToken = ctx.request.header['authorization'] as string | undefined;
  if (!authToken) return throwError(ctx, 403, 'invalid token');

  const user = await tokenService.validateToken(
    ctx.requestId,
    authToken.trim()
  );
  ctx.user = user;
  return next();
}

// export function validateToken(ctx: Context, next: Next) {
//   if (CONFIG.NODE_ENV === NodeEnv.LOCAL) return next();
//   const token = ctx.request.header['authorization'] as string | undefined;
//   if (!token) throwError(ctx, 403, 'no token provided');
//   const configToken = `Bearer ${CONFIG.AUTH_TOKEN}`;
//   if (token !== configToken) throwError(ctx, 403, 'invalid token');
//   return next();
// }

export function validateSchema(schema: object) {
  return async function (ctx: Context, next: Next) {
    const valid = ajv.validate(schema, ctx.request.body);
    if (!valid) throwError(ctx, ERROR_STATUS, ajv.errors);
    return next();
  };
}
