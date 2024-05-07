import * as dotenv from 'dotenv';

export const CONFIG = (() => {
  // all environment are for CloudRun
  if (!['prod', 'dev'].includes(process.env.NODE_ENV || '')) dotenv.config();
  if (!process.env.NODE_ENV) throw 'no env specified!';
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    AUTH_TOKEN: process.env.AUTH_TOKEN,
    FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
  };
})();
