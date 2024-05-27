const chatService = require('../lib/services/chat.service');
const userService = require('../lib/services/user.service');
const chatRepository = require('../lib/repositories/chat.repository');

// Mock the userService module
jest.mock('../lib/services/user.service');
jest.mock('../lib/repositories/chat.repository');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatUsers', () => {
    const fakeMessage = {
      fromId: 1,
      toId: 2,
      content: 'fake-message',
    };

    it('with exist data', async () => {
      userService.findById.mockImplementation((_requestId, id) => {
        return Promise.resolve({ id, name: `Test User ${id}` });
      });

      const result = await chatService.getChatUsers(
        FAKE_REQUEST_ID,
        fakeMessage.fromId,
        fakeMessage.toId
      );

      const expectedResults = [
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ];

      expect(result).toEqual({
        from: expectedResults[0],
        to: expectedResults[1],
        users: expectedResults,
      });
    });

    it('no exist data', async () => {
      userService.findById.mockImplementation((_requestId) => {
        return Promise.resolve(null);
      });

      expect(async () => {
        await chatService.getChatUsers(
          FAKE_REQUEST_ID,
          fakeMessage.fromId,
          fakeMessage.toId
        );
      }).rejects.toThrow();
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
      chatRepository.findAllMessages.mockResolvedValue(res);

      const result = await chatService.getMessages(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID
      );

      expect(result).toEqual(expected);
    });

    it('no exist data', async () => {
      const res = [];
      chatRepository.findAllMessages.mockResolvedValue(res);

      const result = await chatService.getMessages(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID
      );
      expect(result).toEqual(res);
    });

    it('with order param', async () => {
      const res = [];
      chatRepository.findAllMessages.mockResolvedValue(res);

      const filter = {
        where: [{ fieldKey: 'id', operator: 'eq', fieldValue: 'value' }],
        order: { fieldKey: 'createdAt', fieldValue: 'asc' },
      };
      await chatService.getMessages(FAKE_REQUEST_ID, FAKE_CHAT_ID, filter);

      expect(chatRepository.findAllMessages).toHaveBeenCalledWith(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID,
        filter
      );
    });

    it('no order param', async () => {
      const res = [];
      chatRepository.findAllMessages.mockResolvedValue(res);

      const filter = {
        where: [{ fieldKey: 'id', operator: 'eq', fieldValue: 'value' }],
      };
      await chatService.getMessages(FAKE_REQUEST_ID, FAKE_CHAT_ID, filter);

      const expected = {
        where: [{ fieldKey: 'id', operator: 'eq', fieldValue: 'value' }],
        order: { fieldKey: 'createdAt', fieldValue: 'desc' },
      };
      expect(chatRepository.findAllMessages).toHaveBeenCalledWith(
        FAKE_REQUEST_ID,
        FAKE_CHAT_ID,
        expected
      );
    });
  });
});
