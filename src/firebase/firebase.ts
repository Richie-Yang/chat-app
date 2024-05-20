import * as _ from 'lodash';
import { firestore } from 'firebase-admin';
import { datasource as db, auth } from './datasource';
import { WhereOperator } from './firebase.variable';
import {
  WhereQuery,
  OrderQuery,
  OrderWhereQuery,
  FilterQuery,
  CollectionRef,
  QueryRef,
  PageResult,
  CreateData,
  UpdateData,
  UserResponse,
  TokenResponse,
  ConditionalFilterQuery,
  ConditionalOrderWhereQuery,
  ConditionalQuery,
} from './firebase.type';
import { CONFIG } from '../config';
import { NodeEnv } from '../variables';
import { FirestoreCount } from './firebase.type';

export {
  generateAuthToken,
  signup,
  login,
  create,
  updateById,
  deleteById,
  count,
  getRefById,
  findById,
  findPaged,
  findAll,
  conditionalFindAll,
  conditionalFindPaged,
  findOne,
  conditionalFindOne,
  getCollectionRef,
  getDocumentRef,
  runTransaction,
  getCounter,
  prefix,
};

const prefix = _switchPrefix();

function _switchPrefix() {
  switch (CONFIG.NODE_ENV) {
    case NodeEnv.LOCAL:
      return 'local_';
    case NodeEnv.DEV:
      return 'dev_';
    case NodeEnv.PROD:
      return 'prod_';
    case NodeEnv.PROD_LIKE:
      return 'prodLike_';
    default:
      return '';
  }
}

async function generateAuthToken(uid: string): Promise<TokenResponse> {
  if (!uid) return { err: true };
  return auth()
    .createCustomToken(uid)
    .then((token) => ({ err: false, token }))
    .catch((error) => {
      console.error('Error creating new user:', error);
      return { err: true, error };
    });
}

async function signup(uid: string, userParam: object): Promise<UserResponse> {
  return auth()
    .createUser({ uid, ...userParam })
    .then((userRecord) => {
      console.log('Successfully created new user:', userRecord.toJSON());
      return { err: false, userRecord };
    })
    .catch((error) => {
      console.error('Error creating new user:', error);
      return { err: false, error };
    });
}

async function login(firebaseUid: string): Promise<UserResponse> {
  if (!firebaseUid) return { err: true };
  return auth()
    .getUser(firebaseUid)
    .then((userRecord) => {
      console.log('Successfully get user:', userRecord.toJSON());
      return { err: false, userRecord };
    })
    .catch((error: any) => {
      console.error('Error get user:', error);
      return { err: true, error };
    });
}

async function create(
  collection: string,
  createData: CreateData = {},
  options: { documentId?: string; requestId?: string } = {}
) {
  if (options.requestId) {
    const counter = getCounter(options.requestId);
    counter.WRITE_COUNT++;
    const funcName = `${collection}.${create.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  const id = options.documentId || _genRandomCode(12);
  const data = Object.assign(createData, {
    id,
    createdAt: Math.round(Date.now() / 1000),
    updatedAt: Math.round(Date.now() / 1000),
  });
  const res = await db()
    .collection(`${prefix}${collection}`)
    .doc(data.id)
    .set(data);
  return { id, ...res };
}

async function updateById(
  collection: string,
  documentId: string,
  updateData: UpdateData = {},
  options?: { requestId?: string }
) {
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.WRITE_COUNT++;
    const funcName = `${collection}.${updateById.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  updateData.updatedAt = Math.round(Date.now() / 1000);
  return db()
    .collection(`${prefix}${collection}`)
    .doc(documentId)
    .update(updateData);
}

async function deleteById(
  collection: string,
  documentId: string,
  options?: { requestId?: string }
) {
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.DELETE_COUNT++;
    const funcName = `${collection}.${deleteById.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  return db().collection(`${prefix}${collection}`).doc(documentId).delete();
}

function count(collection: string, options?: { requestId?: string }) {
  return new Promise((resolve, reject) => {
    const docRef = db().collection(`${prefix}${collection}`);
    docRef
      .get()
      .then((snap) => {
        if (options?.requestId) {
          const counter = getCounter(options.requestId);
          counter.READ_COUNT = counter.READ_COUNT + snap.size;
          const funcName = `${collection}.${count.name}`;
          counter.TRACE_CALLS.push(funcName);
        }
        resolve(snap.size);
      })
      .catch((error) => reject({ error: error }));
  });
}

function getRefById(collection: string, documentId: string) {
  return db().collection(`${prefix}${collection}`).doc(documentId);
}

async function findById(
  collection: string,
  documentId: string,
  options?: { requestId?: string }
) {
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT++;
    const funcName = `${collection}.${findById.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  const docRef = db().collection(`${prefix}${collection}`).doc(documentId);
  const docSnap = await docRef.get();
  if (docSnap.exists)
    return { docRef, docSnap, data: docSnap.data(), exists: true };
  return { docRef, exists: false };
}

async function findPaged(
  collection: string,
  options?: { filter?: FilterQuery; requestId?: string }
) {
  const result: PageResult = {
    size: 0,
    page: 0,
    total: 0,
    pageCount: 0,
    rows: [],
  };

  let docRef: QueryRef | CollectionRef = db().collection(
    `${prefix}${collection}`
  );
  if (options?.filter?.where)
    docRef = await _where(docRef, options.filter.where);
  if (options?.filter?.order)
    docRef = await _order(docRef, options.filter.order);

  const allDocs = await docRef.get();
  if (allDocs.empty) return result;
  result.total = allDocs.size;

  const size = options?.filter?.size || 50;
  result.size = size;
  docRef = docRef.limit(size);

  const page = options?.filter?.page || 1;
  result.page = page;
  docRef = docRef.offset(size * (page - 1));

  const docSnap = await docRef.get();
  docSnap.forEach((doc) => {
    result.rows.push(doc.data());
  });

  result.pageCount = Math.ceil(result.total / size);
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT = counter.READ_COUNT + docSnap.size;
    const funcName = `${collection}.${findPaged.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  return result;
}

async function findAll(
  collection: string,
  options?: { filter?: OrderWhereQuery; requestId?: string }
) {
  const allDocs: firestore.DocumentData[] = [];
  let docRef: QueryRef | CollectionRef = db().collection(
    `${prefix}${collection}`
  );
  if (options?.filter?.where)
    docRef = await _where(docRef, options.filter.where);
  if (options?.filter?.order)
    docRef = await _order(docRef, options.filter.order);
  const docSnap = await docRef.get();
  docSnap.forEach((doc) => allDocs.push(doc.data()));
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT = counter.READ_COUNT + docSnap.size;
    const funcName = `${collection}.${findAll.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  return allDocs;
}

async function conditionalFindPaged(
  collection: string,
  options?: { filter?: ConditionalFilterQuery; requestId?: string }
) {
  const result: PageResult = {
    size: 0,
    page: 0,
    total: 0,
    pageCount: 0,
    rows: [],
  };

  let docRef: QueryRef | CollectionRef = db().collection(
    `${prefix}${collection}`
  );
  if (options?.filter?.where)
    docRef = await _getDocRefWithWhere(docRef, options.filter.where);
  if (options?.filter?.order)
    docRef = await _order(docRef, options.filter.order);

  const allDocs = await docRef.get();
  if (allDocs.empty) return result;
  result.total = allDocs.size;

  const size = options?.filter?.size || 50;
  result.size = size;
  docRef = docRef.limit(size);

  const page = options?.filter?.page || 1;
  result.page = page;
  docRef = docRef.offset(size * (page - 1));

  const docSnap = await docRef.get();
  docSnap.forEach((doc) => {
    result.rows.push(doc.data());
  });

  result.pageCount = Math.ceil(result.total / size);
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT = counter.READ_COUNT + docSnap.size;
    const funcName = `${collection}.${conditionalFindPaged.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  return result;
}

async function conditionalFindAll(
  collection: string,
  options?: { filter?: ConditionalOrderWhereQuery; requestId?: string }
) {
  const allDocs: firestore.DocumentData[] = [];
  let docRef: QueryRef | CollectionRef = db().collection(
    `${prefix}${collection}`
  );
  if (options?.filter?.where)
    docRef = await _getDocRefWithWhere(docRef, options.filter.where);
  if (options?.filter?.order)
    docRef = await _order(docRef, options.filter.order);
  const docSnap = await docRef.get();
  docSnap.forEach((doc) => allDocs.push(doc.data()));
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT = counter.READ_COUNT + docSnap.size;
    const funcName = `${collection}.${conditionalFindAll.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  return allDocs;
}

async function _getDocRefWithWhere(
  docRef: QueryRef | CollectionRef,
  where: ConditionalQuery
) {
  const filterArray = [];
  const or = _.get(where, 'or', []) as Array<WhereQuery>;
  const and = _.get(where, 'and', []) as Array<WhereQuery>;
  if (!_.isEmpty(or)) filterArray.push(firestore.Filter.or(..._getWhere(or)));
  if (!_.isEmpty(and))
    filterArray.push(firestore.Filter.and(..._getWhere(and)));
  const compositeFilter = firestore.Filter.and(...filterArray);
  console.log('compositeFilter:', compositeFilter);
  return docRef.where(compositeFilter);
}

async function findOne(
  collection: string,
  options?: { filter?: OrderWhereQuery; requestId?: string }
) {
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT++;
    const funcName = `${collection}.${findOne.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  const allDocs: firestore.DocumentData[] = [];
  let docRef: QueryRef | CollectionRef = db().collection(
    `${prefix}${collection}`
  );
  if (options?.filter?.where)
    docRef = await _where(docRef, options.filter.where);
  if (options?.filter?.order)
    docRef = await _order(docRef, options.filter.order);
  docRef = docRef.limit(1);
  const docSnap = await docRef.get();
  docSnap.forEach((doc) => allDocs.push(doc.data()));
  return _.get(allDocs, '[0]', null) as firestore.DocumentData | null;
}

async function conditionalFindOne(
  collection: string,
  options?: { filter?: ConditionalOrderWhereQuery; requestId?: string }
) {
  if (options?.requestId) {
    const counter = getCounter(options.requestId);
    counter.READ_COUNT++;
    const funcName = `${collection}.${findOne.name}`;
    counter.TRACE_CALLS.push(funcName);
  }
  const allDocs: firestore.DocumentData[] = [];
  let docRef: QueryRef | CollectionRef = db().collection(
    `${prefix}${collection}`
  );
  if (options?.filter?.where)
    docRef = await _getDocRefWithWhere(docRef, options.filter.where);
  if (options?.filter?.order)
    docRef = await _order(docRef, options.filter.order);
  docRef = docRef.limit(1);
  const docSnap = await docRef.get();
  docSnap.forEach((doc) => allDocs.push(doc.data()));
  return _.get(allDocs, '[0]', null) as firestore.DocumentData | null;
}

async function getCollectionRef(collection: string) {
  return db().collection(`${prefix}${collection}`);
}

async function getDocumentRef(collection: string, documentId: string) {
  return db().collection(`${prefix}${collection}`).doc(documentId);
}

async function runTransaction(
  callback: (t: firestore.Transaction) => Promise<any>
) {
  return db().runTransaction(callback);
}

function getCounter(requestId: string): FirestoreCount {
  return _.get(CONFIG.FIRESTORE_COUNTER, requestId, {
    READ_COUNT: 0,
    WRITE_COUNT: 0,
    DELETE_COUNT: 0,
    TRACE_CALLS: [],
    RE_INIT: true,
  });
}

async function _where(
  docRef: QueryRef | CollectionRef,
  where: WhereQuery | Array<WhereQuery>
) {
  let whereDocRef = _.cloneDeep(docRef);
  const searchEntries = (
    Array.isArray(where) ? where : [where]
  ) as Array<WhereQuery>;
  for (const entry of searchEntries) {
    whereDocRef = await _operate(whereDocRef, entry);
  }
  return whereDocRef;
}

function _getWhere(where: WhereQuery | Array<WhereQuery>) {
  const whereArray: firestore.Filter[] = [];
  const searchEntries = (
    Array.isArray(where) ? where : [where]
  ) as Array<WhereQuery>;
  for (const entry of searchEntries) {
    const operate = _getOperate(entry);
    if (!operate) continue;
    whereArray.push(operate);
  }
  return whereArray;
}

async function _order(
  docRef: QueryRef | CollectionRef,
  order: OrderQuery | Array<OrderQuery>
) {
  let orderDocRef = _.cloneDeep(docRef);
  const orderEntries = (
    Array.isArray(order) ? order : [order]
  ) as Array<OrderQuery>;
  for (const entry of orderEntries) {
    orderDocRef = await orderDocRef.orderBy(entry.fieldKey, entry.fieldValue);
  }
  return orderDocRef;
}

function _operate(docRef: QueryRef | CollectionRef, where: WhereQuery) {
  const { fieldKey, operator, fieldValue } = where;
  switch (operator) {
    case WhereOperator.equal:
      return docRef.where(fieldKey, '==', fieldValue);
    case WhereOperator.neq:
      return docRef.where(fieldKey, '!=', fieldValue);
    case WhereOperator.gt:
      return docRef.where(fieldKey, '>', fieldValue);
    case WhereOperator.gte:
      return docRef.where(fieldKey, '>=', fieldValue);
    case WhereOperator.lt:
      return docRef.where(fieldKey, '<', fieldValue);
    case WhereOperator.lte:
      return docRef.where(fieldKey, '<=', fieldValue);
    case WhereOperator['array-contains']:
      return docRef.where(fieldKey, 'array-contains', fieldValue);
    case WhereOperator['array-contains-any']:
      return docRef.where(fieldKey, 'array-contains-any', fieldValue);
    case WhereOperator.in:
      return docRef.where(fieldKey, 'in', fieldValue);
    case WhereOperator['not-in']:
      return docRef.where(fieldKey, 'not-in', fieldValue);
    default:
      return docRef;
  }
}

function _getOperate(where: WhereQuery) {
  const { fieldKey, operator, fieldValue } = where;
  switch (operator) {
    case WhereOperator.equal:
      return firestore.Filter.where(fieldKey, '==', fieldValue);
    case WhereOperator.neq:
      return firestore.Filter.where(fieldKey, '!=', fieldValue);
    case WhereOperator.gt:
      return firestore.Filter.where(fieldKey, '>', fieldValue);
    case WhereOperator.gte:
      return firestore.Filter.where(fieldKey, '>=', fieldValue);
    case WhereOperator.lt:
      return firestore.Filter.where(fieldKey, '<', fieldValue);
    case WhereOperator.lte:
      return firestore.Filter.where(fieldKey, '<=', fieldValue);
    case WhereOperator['array-contains']:
      return firestore.Filter.where(fieldKey, 'array-contains', fieldValue);
    case WhereOperator['array-contains-any']:
      return firestore.Filter.where(fieldKey, 'array-contains-any', fieldValue);
    case WhereOperator.in:
      return firestore.Filter.where(fieldKey, 'in', fieldValue);
    case WhereOperator['not-in']:
      return firestore.Filter.where(fieldKey, 'not-in', fieldValue);
    default:
      return null;
  }
}

function _genRandomCode(length: number) {
  const char = '1234567890abcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code = code + char[Math.floor(Math.random() * char.length)];
  }
  return code;
}
