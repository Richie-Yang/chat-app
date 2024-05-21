import { firestore } from 'firebase-admin';
import { WhereOperator } from './firebase.variable';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

export type WhereQuery = {
  fieldKey: string | firestore.FieldPath;
  operator: WhereOperator;
  fieldValue: any;
};

export type ConditionalQuery = {
  or?: Array<WhereQuery>;
  and?: Array<WhereQuery>;
};

export type OrderQuery = {
  fieldKey: string | firestore.FieldPath;
  fieldValue: firestore.OrderByDirection;
};

export type OrderWhereQuery = {
  order?: OrderQuery | Array<OrderQuery>;
  where?: WhereQuery | Array<WhereQuery>;
};

export type ConditionalOrderWhereQuery = {
  order?: OrderQuery | Array<OrderQuery>;
  where?: ConditionalQuery;
};

export type FilterQuery = {
  size?: number;
  page?: number;
  order?: OrderQuery | Array<OrderQuery>;
  where?: WhereQuery | Array<WhereQuery>;
};

export type ConditionalFilterQuery = {
  size?: number;
  page?: number;
  order?: OrderQuery | Array<OrderQuery>;
  where?: ConditionalQuery;
};

export type CollectionRef =
  firestore.CollectionReference<firestore.DocumentData>;

export type DocumentRef = firestore.DocumentReference<firestore.DocumentData>;

export type QueryRef = firestore.Query<firestore.DocumentData>;

export type PageResult = {
  size: number;
  page: number;
  total: number;
  pageCount: number;
  rows: firestore.DocumentData[];
};

export type CreateData = { [key: string]: any } & {
  createdAt?: number;
  updatedAt?: number;
};

export type UpdateData = { [key: string]: any } & { updatedAt?: number };

export type UserResponse = {
  err: boolean;
  userRecord?: UserRecord;
  error?: any;
};

export type TokenResponse = {
  err: boolean;
  token?: string;
  error?: any;
};

export type FindByIdResponse<Model> = {
  docRef: FirebaseFirestore.DocumentReference<Model>;
  docSnap: FirebaseFirestore.DocumentSnapshot<Model>;
  data: Model | undefined;
  exists: boolean;
};

export type FindAllResponse<Model> = Array<Model>;

export type FindOneResponse<Model> = Model | null;

export type FindPagedResponse<Model> = {
  size: number;
  page: number;
  total: number;
  pageCount: number;
  rows: Array<Model>;
};

export type FirestoreCounter = {
  [requestId: string]: FirestoreCount;
};

export type FirestoreCount = {
  WRITE_COUNT: number;
  READ_COUNT: number;
  DELETE_COUNT: number;
  TRACE_CALLS: string[];
  RE_INIT?: boolean;
};

export type SubCollection = {
  documentId: string;
  collection: string;
};
