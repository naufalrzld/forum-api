const ReplyThread = require('../ReplyThread');

describe('ReplyThread entity', () => {
  it('should throw error when did not contain needed property property', () => {
    const payload = {
      id: 'reply-123',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    expect(() => new ReplyThread(payload)).toThrowError('REPLY_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'reply-123',
      content: 123,
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    expect(() => new ReplyThread(payload)).toThrowError('REPLY_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyThread object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'reply comment',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    const replyThread = new ReplyThread(payload);

    expect(replyThread.id).toEqual(payload.id);
    expect(replyThread.content).toEqual(payload.content);
    expect(replyThread.date).toEqual(payload.date);
    expect(replyThread.username).toEqual(payload.username);
  });
});