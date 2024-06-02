import { describe, it, beforeEach, expect, jest } from '@jest/globals';
import * as moment from 'moment';

import { tokenService } from '../';
import * as userService from '../user.service';

jest.mock('../user.service');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('tokenService', () => {
  const mockedUserService = userService as jest.Mocked<any>;

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

      mockedUserService.findById.mockResolvedValue(foundUser);

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

      mockedUserService.findById.mockResolvedValue(null);

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

      mockedUserService.findById.mockResolvedValue(foundUser);

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

      mockedUserService.findById.mockResolvedValue(foundUser);

      expect(async () =>
        tokenService.validateToken(FAKE_REQUEST_ID, FAKE_AUTH_TOKEN)
      ).rejects.toThrow();
    });
  });
});
