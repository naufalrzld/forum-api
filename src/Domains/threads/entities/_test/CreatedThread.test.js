const CreatedThread = require('../CreatedThread');

describe('CreatedThread entity', () => {
  it('should throw error when did not contain needed property property', () => {
    const payload = {
      title: 'thread title',
      owner: 'user-123',
    };

    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'thread title',
      owner: 'user-123',
    };

    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      owner: 'user-123',
    };

    const createdThread = new CreatedThread(payload);

    expect(createdThread.id).toEqual(payload.id);
    expect(createdThread.title).toEqual(payload.title);
    expect(createdThread.owner).toEqual(payload.owner);
  });
});