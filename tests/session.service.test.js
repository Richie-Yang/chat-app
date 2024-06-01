const sessionService = require('../lib/services/session.service');

describe('sessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionService.session = {};
  });

  const fakeId = 'fake-id';
  const fakeParsedData = {
    email: 'fake-email@gmail.com',
  };
  const fakeStringifiedData = '{"email":"fake-email@gmail.com"}';

  describe('set', () => {
    it('success', async () => {
      sessionService.set(fakeId, fakeParsedData);
      expect(sessionService.session).toHaveProperty(fakeId);
    });
  });

  describe('get', () => {
    it('success with data', async () => {
      sessionService.session[fakeId] = fakeStringifiedData;
      const result = sessionService.get(fakeId);
      expect(result).toEqual(fakeParsedData);
    });

    it('success with no data', async () => {
      const result = sessionService.get(fakeId);
      expect(result).toEqual(null);
    });

    it('success with malformed data', async () => {
      sessionService.session[fakeId] = '{"email"="fake-email@gmail.com}';
      const result = sessionService.get(fakeId);
      expect(result).toEqual(null);
    });
  });

  describe('del', () => {
    it('success', async () => {
      sessionService.session[fakeId] = fakeStringifiedData;
      sessionService.del(fakeId);
      expect(sessionService.session).not.toHaveProperty(fakeId);
    });
  });

  describe('clear', () => {
    it('success', async () => {
      sessionService.session[fakeId] = fakeStringifiedData;
      sessionService.clear();
      expect(sessionService.session).toEqual({});
    });
  });
});
