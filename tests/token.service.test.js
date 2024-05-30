const moment = require('moment');
const { tokenService } = require('../lib/services');
const userService = require('../lib/services/user.service');

// Mock the userService module
jest.mock('../lib/services/user.service');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('tokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('with exist data', async () => {
      const FAKE_ID = '1';
      const FAKE_TOKEN = 'valid_token';
      const FAKE_AUTH_TOKEN = `Bearer ${FAKE_ID}:${FAKE_TOKEN}`;

      const foundUser = {
        id: FAKE_ID,
        token: FAKE_TOKEN,
        expiresAt: moment().add(5, 'd').unix(),
      };

      userService.findById.mockResolvedValue(foundUser);

      const result = await tokenService.validateToken(
        FAKE_REQUEST_ID,
        FAKE_AUTH_TOKEN
      );

      expect(result).toEqual(foundUser);
    });

    it('no exist data', async () => {
      const FAKE_ID = '1';
      const FAKE_TOKEN = 'valid_token';
      const FAKE_AUTH_TOKEN = `Bearer ${FAKE_ID}:${FAKE_TOKEN}`;

      userService.findById.mockResolvedValue(null);

      expect(async () =>
        tokenService.validateToken(FAKE_REQUEST_ID, FAKE_AUTH_TOKEN)
      ).rejects.toThrow();
    });

    it('with invalid prefix authToken', async () => {
      const FAKE_ID = '1';
      const FAKE_TOKEN = 'valid_token';
      const FAKE_AUTH_TOKEN = `${FAKE_ID}:${FAKE_TOKEN}`;

      expect(async () =>
        tokenService.validateToken(FAKE_REQUEST_ID, FAKE_AUTH_TOKEN)
      ).rejects.toThrow();
    });

    it('with invalid token pattern', async () => {
      const FAKE_ID = '1';
      const FAKE_TOKEN = '123';
      const FAKE_AUTH_TOKEN = `Bearer ${FAKE_ID}:${FAKE_TOKEN}`;

      const foundUser = {
        id: FAKE_ID,
        token: '321',
        expiresAt: moment().add(5, 'day').unix(),
      };

      userService.findById.mockResolvedValue(foundUser);

      expect(async () =>
        tokenService.validateToken(FAKE_REQUEST_ID, FAKE_AUTH_TOKEN)
      ).rejects.toThrow();
    });

    it('with invalid token expiresAt', async () => {
      const FAKE_ID = '1';
      const FAKE_TOKEN = '123';
      const FAKE_AUTH_TOKEN = `Bearer ${FAKE_ID}:${FAKE_TOKEN}`;

      const foundUser = {
        id: FAKE_ID,
        token: FAKE_TOKEN,
        expiresAt: moment().subtract(1, 'm').unix(),
      };

      userService.findById.mockResolvedValue(foundUser);

      expect(async () =>
        tokenService.validateToken(FAKE_REQUEST_ID, FAKE_AUTH_TOKEN)
      ).rejects.toThrow();
    });
  });
});
