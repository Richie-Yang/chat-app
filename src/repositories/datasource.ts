import * as admin from 'firebase-admin';
import * as path from 'path';
import { firestore, auth as firebaseAuth } from 'firebase-admin';
import { CONFIG } from '../config';
import { NodeEnv } from '../variables';

let _DB: firestore.Firestore | undefined;
let _Auth: firebaseAuth.Auth | undefined;

export { init, datasource, auth };

function init() {
  try {
    const appInitSetup =
      CONFIG.NODE_ENV === NodeEnv.LOCAL
        ? {
            credential: admin.credential.cert(
              require(fetchServiceAccountFilePath())
            ),
          }
        : {};
    const client = admin.initializeApp(appInitSetup);
    _DB = client.firestore();
    _DB.settings({ ignoreUndefinedProperties: true });
    _Auth = client.auth();
    console.log(`initial firebase connection success...`);
  } catch (e) {
    console.error(`initial firebase error...`, e);
    process.exit(0);
  }
}

function datasource() {
  if (!_DB) process.exit(0);
  return _DB;
}

function auth() {
  if (!_Auth) process.exit(0);
  return _Auth;
}

function fetchServiceAccountFilePath() {
  let fileName = '';
  switch (CONFIG.SERVICE_ACCOUNT_ENV) {
    case NodeEnv.LOCAL:
      fileName = 'service_account.local.json';
      break;
    case NodeEnv.DEV:
      fileName = 'service_account.dev.json';
      break;
    case NodeEnv.PROD:
      fileName = 'service_account.prod.json';
      break;
    case NodeEnv.PROD_LIKE:
      fileName = 'service_account.prodLike.json';
      break;
    default:
      throw new Error('no service account file path');
  }
  const filePath = path.join(__dirname, `../../env/${fileName}`);
  console.log(`service account file path: ${filePath}`);
  return filePath;
}
