const _ = require('lodash');
const userService = require('../lib/services/user.service');
const sessionService = require('../lib/services/session.service');
const userRepository = require('../lib/repositories/user.repository');
const bcrypt = require('bcrypt');

// Mock the userService module
jest.mock('../lib/repositories/user.repository');
jest.mock('../lib/services/session.service');
jest.mock('bcrypt');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('userService', () => {
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
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockResolvedValue();

      const createUser = _.cloneDeep(fakeUser);
      createUser.id = '1';
      const result = await userService.create(FAKE_REQUEST_ID, createUser);

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password');
    });

    it('with exist data', async () => {
      userRepository.findOne.mockResolvedValue(fakeUser);
      userRepository.create.mockResolvedValue();

      expect(async () =>
        userService.create(FAKE_REQUEST_ID, fakeUser)
      ).rejects.toThrow();
    });
  });

  describe('validateLogin', () => {
    it('success', async () => {
      userRepository.findOne.mockResolvedValue(fakeUser);
      bcrypt.compareSync.mockResolvedValue(true);

      const result = await userService.validateLogin(FAKE_REQUEST_ID, fakeUser);
      expect(result).toEqual(fakeUser);
    });

    it('failure with no data', async () => {
      userRepository.findOne.mockResolvedValue(null);
      bcrypt.compareSync.mockReturnValue(false);

      expect(async () =>
        userService.validateLogin(FAKE_REQUEST_ID, fakeUser)
      ).rejects.toThrow();
    });

    it('failure with wrong password', async () => {
      userRepository.findOne.mockResolvedValue(fakeUser);
      bcrypt.compareSync.mockReturnValue(false);

      expect(async () =>
        userService.validateLogin(FAKE_REQUEST_ID, fakeUser)
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('success With cache data', async () => {
      sessionService.get.mockReturnValue(fakeUser);

      const result = await userService.findById(FAKE_REQUEST_ID, 1, {
        isCacheEnabled: true,
      });
      expect(result).toEqual(fakeUser);
    });

    it('success With no cache data', async () => {
      sessionService.get.mockReturnValue(null);
      userRepository.findById.mockResolvedValue(fakeUser);

      const result = await userService.findById(FAKE_REQUEST_ID, 1, {
        isCacheEnabled: true,
      });
      expect(result).toEqual(fakeUser);
    });

    it('success With no data', async () => {
      sessionService.get.mockReturnValue(null);
      userRepository.findById.mockResolvedValue(null);

      const result = await userService.findById(FAKE_REQUEST_ID, 1, {
        isCacheEnabled: true,
      });
      expect(result).toEqual(null);
    });

    it('success With with data + no cache', async () => {
      sessionService.get.mockReturnValue(null);
      userRepository.findById.mockResolvedValue(fakeUser);

      const result = await userService.findById(FAKE_REQUEST_ID, 1);
      expect(result).toEqual(fakeUser);
    });
  });
});
