import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as Schema from '../schemas/chat.schema';
import { DataModel, SchemaType } from '../variables';
import { firebaseRepository } from './';

export { create };

async function create(requestId: string, data: Schema.Chat<SchemaType.INPUT>) {
  return firebaseRepository.create(DataModel.CHAT, data, {
    documentId: `CHAT-${uuid.v4()}`,
    requestId,
  });
}
