const CommentThread = require('../CommentThread');
const ReplyThread = require('../ReplyThread');

describe('CommentThread entity', () => {
  it('should throw error when did not contain needed property property', () => {
    const payload = {
      id: 'comment-123',
      content: 'comment thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    expect(() => new CommentThread(payload)).toThrowError('COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      content: 'comment thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
      likeCount: '0',
    };

    expect(() => new CommentThread(payload, 123)).toThrowError('COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentThread object correctly', () => {
    const payloadReplies = [
      new ReplyThread({
        id: 'reply-123',
        content: 'reply comment 1',
        date: '2021-08-08T07:59:16.198Z',
        username: 'dicoding',
      }),
      new ReplyThread({
        id: 'reply-124',
        content: 'reply comment 2',
        date: '2021-08-08T07:59:16.198Z',
        username: 'dicoding',
      }),
    ];

    const payloadComment = {
      id: 'comment-123',
      content: 'comment thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
      likeCount: 10,
    };

    const commentThread = new CommentThread(payloadComment, payloadReplies);

    expect(commentThread.id).toEqual(payloadComment.id);
    expect(commentThread.content).toEqual(payloadComment.content);
    expect(commentThread.date).toEqual(payloadComment.date);
    expect(commentThread.username).toEqual(payloadComment.username);
    expect(commentThread.likeCount).toEqual(payloadComment.likeCount);
    expect(commentThread.replies).toStrictEqual(payloadReplies);
  });
});