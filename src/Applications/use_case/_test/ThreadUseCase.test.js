const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const CommentThread = require('../../../Domains/threads/entities/CommentThread');
const ReplyThread = require('../../../Domains/threads/entities/ReplyThread');
const ThreadUseCase = require('../ThreadUseCase');

describe('ThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'thread title',
      body: 'thread body',
    };

    const expectedCreatedThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(expectedCreatedThread));

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const createdThread = await threadUseCase.addThread(useCasePayload, 'user-123');

    expect(createdThread).toStrictEqual(expectedCreatedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(useCasePayload, 'user-123');
  });

  it('should orchestrating get detail thread action correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    const threadId = 'thread-123';

    const expectedReplies = [
      new ReplyThread({
        id: 'reply-123',
        username: 'johndoe',
        date: '2021-24-10T13:00:00',
        content: 'reply comment',
      }),
      new ReplyThread({
        id: 'reply-1234',
        username: 'dicoding',
        date: '2021-24-10T13:02:32',
        content: 'reply comment',
      }),
    ];

    const expectedThreadComments = [
      new CommentThread({
        id: 'comment-123',
        content: 'thread comment',
        date: '2021-24-10T13:00:00',
        username: 'johndoe',
      }, expectedReplies),
    ];

    const expectedDetailThread = new DetailThread({
      id: threadId,
      title: 'thread title',
      body: 'thread body',
      date: '2021-22-10T13:00:00',
      username: 'dicoding',
    }, expectedThreadComments);

    mockThreadRepository.getDetailThread = jest.fn(() => Promise.resolve(expectedDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(expectedThreadComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve(expectedReplies));

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const detailThread = await threadUseCase.getDetailThread(threadId);

    expect(detailThread).toStrictEqual(expectedDetailThread);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(['comment-123']);
  });

  it('should orchestrating get detail thread action correctly when comment and reply deleted', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    const threadId = 'thread-123';

    const expectedReplies = [
      new ReplyThread({
        id: 'reply-123',
        username: 'johndoe',
        date: '2021-24-10T13:00:00',
        content: '**balasan telah dihapus**',
      }),
      new ReplyThread({
        id: 'reply-1234',
        username: 'dicoding',
        date: '2021-24-10T13:02:32',
        content: 'reply comment',
      }),
    ];

    const expectedThreadComments = [
      new CommentThread({
        id: 'comment-123',
        content: '**komentar telah dihapus**',
        date: '2021-24-10T13:00:00',
        username: 'johndoe',
      }, expectedReplies),
    ];

    const expectedDetailThread = new DetailThread({
      id: threadId,
      title: 'thread title',
      body: 'thread body',
      date: '2021-22-10T13:00:00',
      username: 'dicoding',
    }, expectedThreadComments);

    mockThreadRepository.getDetailThread = jest.fn(() => Promise.resolve(expectedDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        content: 'comment thread',
        date: '2021-24-10T13:00:00',
        username: 'johndoe',
        is_delete: true,
      },
    ]));
    mockReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve([
      {
        id: 'reply-123',
        username: 'johndoe',
        date: '2021-24-10T13:00:00',
        content: 'reply comment',
        is_delete: true,
      },
      {
        id: 'reply-1234',
        username: 'dicoding',
        date: '2021-24-10T13:02:32',
        content: 'reply comment',
        is_delete: false,
      },
    ]));

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const detailThread = await threadUseCase.getDetailThread(threadId);

    expect(detailThread).toStrictEqual(expectedDetailThread);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(['comment-123']);
  });
});