import * as dotenv from 'dotenv';
import * as path from 'path';
import { FirestoreCounter } from './repositories/firebase.type';

const envPath = path.join(__dirname, '../env/.env');

export const CONFIG = (() => {
  // all environment are for CloudRun
  if (!['prod', 'dev'].includes(process.env.NODE_ENV || ''))
    dotenv.config({ path: envPath });
  if (!process.env.NODE_ENV) throw 'no env specified!';
  return {
    FIRESTORE_COUNTER: {} as FirestoreCounter,

    NODE_ENV: process.env.NODE_ENV,
    SERVICE_ACCOUNT_ENV: process.env.SERVICE_ACCOUNT_ENV,

    PORT: process.env.PORT,
    AUTH_TOKEN: process.env.AUTH_TOKEN,
    FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
  };
})();
