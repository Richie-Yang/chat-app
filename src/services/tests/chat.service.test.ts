import { describe, it, beforeEach, expect, jest } from '@jest/globals';

import * as chatService from '../chat.service';
import * as userService from '../user.service';
import * as chatRepository from '../../repositories/chat.repository';
import { AnyObject } from '../../types';
import { OrderWhereQueryWithLimit } from '../../repositories/firebase.type';
import {
  OrderOperator,
  WhereOperator,
} from '../../repositories/firebase.variable';

jest.mock('../user.service');
jest.mock('../../repositories/chat.repository');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('chatService', () => {
  const mockedUserService = userService as jest.Mocked<any>;
  const mockedChatRepository = chatRepository as jest.Mocked<any>;
  const mockedChatService = chatService as jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatUsers', () => {
    const fakeMessage = {
      fromId: '1',
      toId: '2',
      content: 'fake-message',
    };

    it('with exist data', async () => {
      mockedUserService.findById.mockImplementation(
        (_requestId: string, id: string) => {
          return Promise.resolve({ id, name: `Test User ${id}` });
        }
      );

      const result = await chatService.getChatUsers(
        FAKE_REQUEST_ID,
        fakeMessage.fromId,
        fakeMessage.toId
      );

      const expectedResults = [
        { id: '1', name: 'Test User 1' },
        { id: '2', name: 'Test User 2' },
      ];

      expect(result).toEqual({
        from: expectedResults[0],
        to: expectedResults[1],
        users: expectedResults,
      });
    });

    it('no exist data', async () => {
      mockedUserService.findById.mockResolvedValue(null);

      expect(async () =>
        chatService.getChatUsers(
          FAKE_REQUEST_ID,
          fakeMessage.fromId,
          fakeMessage.toId
        )
      ).rejects.toThrow();
    });
  });

  describe('getMessage', () => {
    const FAKE_CHAT_ID = 'FAKE_CHAT_ID';

    it('with exist data', async () => {
      const res = [
        { id: 2, createdAt: 2 },
        { id: 1, createdAt: 1 },
        { id: 3, createdAt: 3 },
      ];
      const expected = [
        { id: 1, createdAt: 1 },
        { id: 2, createdAt: 2 },
        { id: 3, createdAt: 3 },
      ];

      mockedChatRepository.findAllMessages.mockResolvedValue(res);
      const result = await chatService.getMessages(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID
      );

      expect(result).toEqual(expected);
    });

    it('no exist data', async () => {
      const res: AnyObject[] = [];
      mockedChatRepository.findAllMessages.mockResolvedValue(res);

      const result = await chatService.getMessages(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID
      );
      expect(result).toEqual(res);
    });

    it('with order param', async () => {
      const res: AnyObject[] = [];
      mockedChatRepository.findAllMessages.mockResolvedValue(res);

      const filter: OrderWhereQueryWithLimit = {
        where: [
          {
            fieldKey: 'id',
            operator: WhereOperator.equal,
            fieldValue: 'value',
          },
        ],
        order: { fieldKey: 'createdAt', fieldValue: OrderOperator.asc },
      };
      await chatService.getMessages(FAKE_REQUEST_ID, FAKE_CHAT_ID, filter);

      expect(chatRepository.findAllMessages).toHaveBeenCalledWith(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID,
        filter
      );
    });

    it('no order param', async () => {
      const res: AnyObject[] = [];
      mockedChatRepository.findAllMessages.mockResolvedValue(res);

      const filter: OrderWhereQueryWithLimit = {
        where: [
          {
            fieldKey: 'id',
            operator: WhereOperator.equal,
            fieldValue: 'value',
          },
        ],
      };
      await chatService.getMessages(FAKE_REQUEST_ID, FAKE_CHAT_ID, filter);

      const expected = {
        where: [
          {
            fieldKey: 'id',
            operator: WhereOperator.equal,
            fieldValue: 'value',
          },
        ],
        order: { fieldKey: 'createdAt', fieldValue: OrderOperator.desc },
      };
      expect(chatRepository.findAllMessages).toHaveBeenCalledWith(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID,
        expected
      );
    });
  });

  describe('getCreateChat', () => {
    const fakeMessage = {
      fromId: '1',
      toId: '2',
      content: 'fake-message',
    };
    const userIds = ['1', '2'];

    it('with exist data', async () => {
      mockedChatService.getChatUsers = (
        jest.fn() as AnyObject
      ).mockResolvedValue({
        from: { id: '1' },
        to: { id: '2' },
      });

      mockedChatRepository.findAll.mockResolvedValue([{ userIds }]);

      const result = await chatService.getCreateChat(
        FAKE_REQUEST_ID,
        fakeMessage
      );

      expect(result).toEqual({ userIds });
    });

    it('without exist data', async () => {
      mockedChatService.getChatUsers = (
        jest.fn() as AnyObject
      ).mockResolvedValue({
        from: { id: '1' },
        to: { id: '2' },
      });

      mockedChatRepository.findAll.mockResolvedValue([]);
      mockedChatRepository.initChat.mockResolvedValue({});
      mockedChatRepository.findById.mockResolvedValue({ userIds });

      const result = await chatService.getCreateChat(
        FAKE_REQUEST_ID,
        fakeMessage
      );

      expect(result).toEqual({ userIds });
    });
  });
});
