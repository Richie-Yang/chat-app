import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as Schema from '../schemas/user.schema';
import { DataModel, SchemaType } from '../variables';
import { firebaseRepository } from './';
import {
  ConditionalOrderWhereQuery,
  FindAllResponse,
  FindOneResponse,
} from './firebase.type';
import { userSchema } from '../schemas';

export { create, updateById, findById, findOne, findAll };

async function create(requestId: string, data: Schema.Signup) {
  return firebaseRepository.create(DataModel.USER, data, {
    documentId: `USER-${uuid.v4()}`,
    requestId,
  });
}

async function updateById(
  requestId: string,
  id: string,
  data: Partial<Schema.User<SchemaType.INPUT>>
) {
  return firebaseRepository.updateById(DataModel.USER, id, data, { requestId });
}

async function findById(
  requestId: string,
  id: string
): Promise<Schema.User<SchemaType.OUTPUT> | null> {
  const result = await firebaseRepository.findById(DataModel.USER, id, {
    requestId,
  });
  if (!result.data) return null;
  return result.data as Schema.User<SchemaType.OUTPUT>;
}

async function findOne(requestId: string, filter?: ConditionalOrderWhereQuery) {
  return firebaseRepository.conditionalFindOne(DataModel.USER, {
    filter,
    requestId,
  }) as Promise<FindOneResponse<userSchema.User<SchemaType.OUTPUT>>>;
}

async function findAll(requestId: string, filter?: ConditionalOrderWhereQuery) {
  return firebaseRepository.conditionalFindAll(DataModel.USER, {
    filter,
    requestId,
  }) as Promise<FindAllResponse<userSchema.User<SchemaType.OUTPUT>>>;
}
