const CreateThread = require('../CreateThread');

describe('CreateThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      body: 'thread body',
    };

    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: true,
      body: 'thread body',
    };

    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread object correctly', () => {
    const payload = {
      title: 'thread title',
      body: 'thread body',
    };

    const createThread = new CreateThread(payload);

    expect(createThread.title).toEqual(payload.title);
    expect(createThread.body).toEqual(payload.body);
  });
});