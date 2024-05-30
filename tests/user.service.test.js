const _ = require('lodash');
const userService = require('../lib/services/user.service');
const userRepository = require('../lib/repositories/user.repository');

// Mock the userService module
jest.mock('../lib/repositories/user.repository');

const FAKE_REQUEST_ID = 'FAKE_REQUEST_ID';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const fakeUser = {
      name: 'fake-name',
      email: 'fake-email@gmail.com',
      password: 'fake-password',
    };

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
    //   userService.findById.mockImplementation((_requestId) => {
    //     return Promise.resolve(null);
    //   });

    //   expect(async () =>
    //     chatService.getChatUsers(
    //       FAKE_REQUEST_ID,
    //       fakeMessage.fromId,
    //       fakeMessage.toId
    //     )
    //   ).rejects.toThrow();
    // });
  });
});
