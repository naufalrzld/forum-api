const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'reply comment',
    };

    const expectedCreatedReply = {
      id: 'reply-123',
      content: 'reply comment',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(expectedCreatedReply));

    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const createdComment = await replyUseCase.addReply(useCasePayload, 'thread-123', 'comment-123', 'user-123');

    expect(createdComment).toStrictEqual(expectedCreatedReply);
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith('comment-123');
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new CreateComment(useCasePayload),
      'comment-123',
      'user-123',
    );
  });

  it('should orchestrating the delete reply action correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.checkAvailabilityReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(replyUseCase.deleteReply('thread-123', 'comment-123', 'reply-123', 'user-123')).resolves.not.toThrowError(NotFoundError);
    await expect(replyUseCase.deleteReply('thread-123', 'comment-123', 'reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith('comment-123');
    expect(mockReplyRepository.checkAvailabilityReply).toBeCalledWith('reply-123');
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith('reply-123', 'user-123');
    expect(mockReplyRepository.deleteReply).toBeCalledWith('reply-123');
  });
});