import { describe, it, beforeEach, expect, jest } from '@jest/globals';

import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import * as userService from '../user.service';
import * as sessionService from '../session.service';
import * as userRepository from '../../repositories/user.repository';

jest.mock('../../repositories/user.repository');
jest.mock('../session.service');
jest.mock('bcrypt');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('userService', () => {
  const mockedUserRepository = userRepository as jest.Mocked<any>;
  const mockedSessionService = sessionService as jest.Mocked<any>;
  const mockedBcrypt = bcrypt as jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fakeUser = {
    name: 'fake-name',
    email: 'fake-email@gmail.com',
    password: 'fake-password',
  };

  describe('create', () => {
    it('without exist data', async () => {
      mockedUserRepository.findOne.mockResolvedValue(null);
      mockedUserRepository.create.mockResolvedValue();

      const createUser: typeof fakeUser & Partial<{ id: string }> =
        _.cloneDeep(fakeUser);
      createUser.id = '1';
      const result = await userService.create(FAKE_REQUEST_ID, createUser);

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password');
    });

    it('with exist data', async () => {
      mockedUserRepository.findOne.mockResolvedValue(fakeUser);
      mockedUserRepository.create.mockResolvedValue();

      expect(async () =>
        userService.create(FAKE_REQUEST_ID, fakeUser)
      ).rejects.toThrow();
    });
  });

  describe('validateLogin', () => {
    it('success', async () => {
      mockedUserRepository.findOne.mockResolvedValue(fakeUser);
      mockedBcrypt.compareSync.mockResolvedValue(true);

      const result = await userService.validateLogin(FAKE_REQUEST_ID, fakeUser);
      expect(result).toEqual(fakeUser);
    });

    it('failure with no data', async () => {
      mockedUserRepository.findOne.mockResolvedValue(null);
      mockedBcrypt.compareSync.mockReturnValue(false);

      expect(async () =>
        userService.validateLogin(FAKE_REQUEST_ID, fakeUser)
      ).rejects.toThrow();
    });

    it('failure with wrong password', async () => {
      mockedUserRepository.findOne.mockResolvedValue(fakeUser);
      mockedBcrypt.compareSync.mockReturnValue(false);

      expect(async () =>
        userService.validateLogin(FAKE_REQUEST_ID, fakeUser)
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('success With cache data', async () => {
      mockedSessionService.get.mockReturnValue(fakeUser);

      const result = await userService.findById(FAKE_REQUEST_ID, '1', {
        isCacheEnabled: true,
      });
      expect(result).toEqual(fakeUser);
    });

    it('success With no cache data', async () => {
      mockedSessionService.get.mockReturnValue(null);
      mockedUserRepository.findById.mockResolvedValue(fakeUser);
      const expected = _.cloneDeep(_.omit(fakeUser, ['password']));

      const result = await userService.findById(FAKE_REQUEST_ID, '1', {
        isCacheEnabled: true,
      });
      expect(result).toEqual(expected);
    });

    it('success With no data', async () => {
      mockedSessionService.get.mockReturnValue(null);
      mockedUserRepository.findById.mockResolvedValue(null);

      const result = await userService.findById(FAKE_REQUEST_ID, '1', {
        isCacheEnabled: true,
      });
      expect(result).toEqual(null);
    });

    it('success With with data + no cache', async () => {
      mockedSessionService.get.mockReturnValue(null);
      mockedUserRepository.findById.mockResolvedValue(fakeUser);
      const expected = _.cloneDeep(_.omit(fakeUser, ['password']));

      const result = await userService.findById(FAKE_REQUEST_ID, '1');
      expect(result).toEqual(expected);
    });
  });
});
