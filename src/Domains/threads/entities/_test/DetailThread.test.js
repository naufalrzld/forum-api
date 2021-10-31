const DetailThread = require('../DetailThread');
const CommentThread = require('../CommentThread');
const ReplyThread = require('../ReplyThread');

describe('DetailThread entity', () => {
  it('should throw error when did not contain needed property property', () => {
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      date: '2021-08-08T07:59:16.198Z',
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'thread title',
      body: 'thread body',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    expect(() => new DetailThread(payload, 123)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    const payloadReplies = [
      new ReplyThread({
        id: 'reply-123',
        content: 'reply comment',
        date: '2021-08-08T07:59:16.198Z',
        username: 'dicoding',
      }),
    ];

    const payloadComments = [
      new CommentThread({
        id: 'comment-123',
        content: 'comment thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'johndoe',
      }, payloadReplies),
    ];

    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    const createdThread = new DetailThread(payload, payloadComments);

    expect(createdThread.id).toEqual(payload.id);
    expect(createdThread.title).toEqual(payload.title);
    expect(createdThread.body).toEqual(payload.body);
    expect(createdThread.date).toEqual(payload.date);
    expect(createdThread.username).toEqual(payload.username);
    expect(createdThread.comments).toStrictEqual(payloadComments);
  });
});